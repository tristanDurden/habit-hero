import { millisToSeconds, scheduleConcat, secondsToMillis } from "@/lib/dbformatting";
import { prisma } from "@/lib/prisma";
import { QueuedOp } from "@/lib/queueType";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { nowInSeconds } from "@/lib/timeCounter";
import { Habit as uiHabit } from "@/lib/types";


export async function POST(req:NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { habits: true },
    });

    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const queue: QueuedOp[] = await req.json();
    if (!queue.length) {
        return NextResponse.json({});
    };
    type ResponseQueueType = {
        job: QueuedOp,
        result: 'Success' | "Fail",
    }
    //variable for full resposne
    const responseQueue: ResponseQueueType[] = [];

    for (const job of queue) {
        // Create scenario
        if (job.type == "CREATE") {
            const habit = job.payload as uiHabit;
            const existing = await prisma.habit.findUnique({
                where: {
                    id: habit.id
                },
            })
            if (existing) {
                responseQueue.push({job: job, result: 'Fail'});
                continue;
            }
            try {
                const payload = await prisma.habit.create({
                    data: {
                        id: habit.id,
                        title: habit.title,
                        description: habit.description,
                        frequency: habit.frequency[0].concat('/', habit.frequency[1]),
                        schedule: scheduleConcat(habit.schedule),
                        counter: habit.counter,
                        streak: habit.streak,
                        lastCompleted: millisToSeconds(habit.lastCompleted),
                        doneToday:habit.doneToday,
                        userId: userId,
                        updatedAt: millisToSeconds(habit.updatedAt),
                    }
                })
                console.log("Sync Create succesful" + payload);
                responseQueue.push({job: job, result: 'Success'})
                continue;
            } catch (error: unknown) {
                console.error('Failed to create habit:', error);
                responseQueue.push({job: job, result: 'Fail'});
                continue;
              }

              // Update scenario
        } else if (job.type == "UPDATE") {
            const habit = job.payload as uiHabit;
            const existing = await prisma.habit.findUnique({
                where: {
                    id: habit.id
                }
            })
            if (!existing) {
                responseQueue.push({job: job, result: 'Fail'});
                continue;
            }
            try {
                if (secondsToMillis(existing.updatedAt) < habit.updatedAt) {
                    const payload = await prisma.habit.update({
                        where: {
                            id: habit.id,
                            userId: userId,
                        },
                        data: {
                            counter: habit.counter,
                            lastCompleted: millisToSeconds(habit.lastCompleted),
                            streak: habit.streak,
                            doneToday: habit.doneToday,
                            updatedAt: millisToSeconds(habit.updatedAt)
                        }
                    })
                    console.log("Sync Update successful" + payload);
                    responseQueue.push({job: job, result: 'Success'})
                } else {
                    // No update needed - server version is newer or same
                    responseQueue.push({job: job, result: 'Success'})
                }
                continue;
            } catch (error: unknown) {
                console.error('Failed to update habit:', error);
                responseQueue.push({job: job, result: 'Fail'});
                continue;
              }

              //Delete scenario
        } else if (job.type == "DELETE") {
            const idPayload = job.payload as {id:string};
            const existing = await prisma.habit.findUnique({
                where: {id: idPayload.id}
            })
            if (!existing) {
                console.log("Deletion failed", job);
                responseQueue.push({job: job, result: 'Fail'});
                continue;
            }
            try {
                await prisma.habit.delete({
                    where: {id: idPayload.id}
                });
                //deletion of logs
                await prisma.habitLog.deleteMany({
                    where: {
                        habitId: idPayload.id,
                    }
                })
                console.log("Sync delete successful" + idPayload);
                responseQueue.push({job: job, result: "Success"});
                continue;
            } catch (error: unknown) {
                console.error('Failed to delete habit:', error);
                responseQueue.push({job: job, result: "Fail"});
                continue;
              }
              // Logging scenario - sync habit log entry
        } else if (job.type === "LOGGING") {
            const logData = job.payload as {habitId: string, date: string, count: number};
            try {
                const payload = await prisma.habitLog.upsert({
                    where: {
                        habitId_date_userId: {
                            habitId: logData.habitId,
                            date: logData.date,
                            userId: userId,
                        }
                    },
                    update: {
                        count: logData.count,
                        updatedAt: nowInSeconds(),
                    },
                    create: {
                        habitId: logData.habitId,
                        date: logData.date,
                        count: logData.count,
                        userId: userId,
                        updatedAt: nowInSeconds(),
                    }
                })
                console.log("Sync Logging successful" + payload);
                responseQueue.push({job: job, result: 'Success'});
                continue;
            } catch (error: unknown) {
                console.error('Failed to sync habit log:', error);
                responseQueue.push({job: job, result: 'Fail'});
                continue;
              }
        } else {
            console.log("there is no such type of job");
            responseQueue.push({job: job, result: 'Fail'});
        }
    }
    
    // Return the results of all processed jobs
    return NextResponse.json({ results: responseQueue });
}