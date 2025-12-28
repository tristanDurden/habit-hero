import { millisToSeconds, scheduleConcat, secondsToMillis } from "@/lib/dbformatting";
import { prisma } from "@/lib/prisma";
import { QueuedOp } from "@/lib/queuedOps";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { nowInSeconds } from "@/lib/timeCounter";
import { Habit as uiHabit } from "@/lib/types";
import { FolderOpPayloadMap } from "@/lib/queuedFolderOps";


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
        if (job.type == "HABIT_CREATE") {
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
        } else if (job.type == "HABIT_UPDATE") {
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
              
              // Update with log scenario - atomic update + logging (like online completion)
        } else if (job.type == "HABIT_UPDATE_WITH_LOG") {
            const payload = job.payload as {habit: uiHabit, logCompletion: {date: string, count: number, duration?: number}};
            const habit = payload.habit;
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
                // Use transaction to ensure both operations happen atomically
                await prisma.$transaction(async (tx) => {
                    if (secondsToMillis(existing.updatedAt) < habit.updatedAt) {
                        await tx.habit.update({
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
                        });
                    }
                    // Always update/create the log entry
                    await tx.habitLog.upsert({
                        where: {
                            habitId_date_userId: {
                                habitId: habit.id,
                                date: payload.logCompletion.date,
                                userId: userId,
                            }
                        },
                        update: {
                            count: payload.logCompletion.count,
                            duration: payload.logCompletion.duration || 0, // Duration in milliseconds
                            updatedAt: nowInSeconds(),
                        },
                        create: {
                            habitId: habit.id,
                            date: payload.logCompletion.date,
                            count: payload.logCompletion.count,
                            duration: payload.logCompletion.duration || 0, // Duration in milliseconds
                            userId: userId,
                            updatedAt: nowInSeconds(),
                        }
                    });
                });
                console.log("Sync Update with Log successful");
                responseQueue.push({job: job, result: 'Success'});
                continue;
            } catch (error: unknown) {
                console.error('Failed to sync update with log:', error);
                responseQueue.push({job: job, result: 'Fail'});
                continue;
              }

              //Delete scenario
        } else if (job.type == "HABIT_DELETE") {
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
        } else if (job.type === "HABIT_LOG") {
            const logData = job.payload as {habitId: string, date: string, count: number, duration?: number};
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
                        duration: logData.duration || 0, // Duration in milliseconds
                        updatedAt: nowInSeconds(),
                    },
                    create: {
                        habitId: logData.habitId,
                        date: logData.date,
                        count: logData.count,
                        duration: logData.duration || 0, // Duration in milliseconds
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
        } else if (job.type == "FOLDER_CREATE") {
            const folder = job.payload as { id: string; name: string; habitIds: string[]; updatedAt: number };
            const existing = await prisma.folder.findUnique({
                where: {id: folder.id}
            });
            if (existing) {
                responseQueue.push({job: job, result: "Fail"});
                continue;
            }
            try {
                const payload = await prisma.folder.create({
                    data: {
                        id: folder.id,
                        name: folder.name,
                        userId: userId,
                        habitIds: folder.habitIds || [],
                        updatedAt: millisToSeconds(folder.updatedAt),
                    }
                });
                console.log("Sync create folder successful" + payload);
                responseQueue.push({job: job, result: "Success"});
                continue;
            } catch (error: unknown) {
                console.error('Failed to create folder:', error);
                responseQueue.push({job: job, result: 'Fail'});
                continue;
            }
        } else if (job.type == "FOLDER_UPDATE") {
            const folder = job.payload as { id: string; name: string; updatedAt: number; habitIds?: string[] };
            const existing = await prisma.folder.findUnique({
                where: {id: folder.id}
            });
            if (!existing) {
                responseQueue.push({job: job, result: "Fail"});
                continue;
            }
            // Compare timestamps: if local folder is newer, update it
            if (secondsToMillis(existing.updatedAt) < folder.updatedAt) {
                try {
                    const payload = await prisma.folder.update({
                        where: {id: folder.id, userId: userId},
                        data: {
                            name: folder.name,
                            habitIds: folder.habitIds || (existing.habitIds as string[]),
                            updatedAt: millisToSeconds(folder.updatedAt)
                        },
                    });
                    console.log("Sync update folder successful" + payload);
                    responseQueue.push({job: job, result: "Success"});
                    continue;
                } catch (error: unknown) {
                    console.error('Failed to update folder:', error);
                    responseQueue.push({job: job, result: "Fail"});
                    continue;
                }
            } else {
                responseQueue.push({job: job, result: "Success"});
                continue;
            }
        } else if (job.type == "FOLDER_DELETE") {
            const idPayload = job.payload as {id:string};
            const existing = await prisma.folder.findUnique({
                where: {id: idPayload.id}
            });
            if (!existing) {
                responseQueue.push({job: job, result: "Fail"});
                continue;
            }
            try {
                await prisma.folder.delete({
                    where: {id: idPayload.id}
                });
                console.log("Sync delete folder successful" + idPayload);
                responseQueue.push({job: job, result: "Success"});
                continue;
            } catch (error: unknown) {
                console.error('Failed to delete folder:', error);
                responseQueue.push({job: job, result: "Fail"});
                continue;
            }
        } else if (job.type == "FOLDER_ADD_HABIT") {
            const payload = job.payload as FolderOpPayloadMap["FOLDER_ADD_HABIT"];
            const existing = await prisma.folder.findUnique({
                where: {id: payload.id, userId: userId}
            });
            if (!existing) {
                responseQueue.push({job: job, result: "Fail"});
                continue;
            }
            try {
                const currentHabitIds = (existing.habitIds as string[]) || [];
                if (currentHabitIds.includes(payload.habitId)) {
                    // Already added, consider it success
                    responseQueue.push({job: job, result: "Success"});
                    continue;
                }
                const updatedHabitIds = [...currentHabitIds, payload.habitId];
                await prisma.folder.update({
                    where: {id: payload.id, userId: userId},
                    data: {
                        habitIds: updatedHabitIds,
                        updatedAt: nowInSeconds()
                    }
                });
                console.log("Sync add habit to folder successful");
                responseQueue.push({job: job, result: "Success"});
                continue;
            } catch (error: unknown) {
                console.error('Failed to add habit to folder:', error);
                responseQueue.push({job: job, result: "Fail"});
                continue;
            }
        } else if (job.type == "FOLDER_REMOVE_HABIT") {
            const payload = job.payload as FolderOpPayloadMap["FOLDER_REMOVE_HABIT"];
            const existing = await prisma.folder.findUnique({
                where: {id: payload.id, userId: userId}
            });
            if (!existing) {
                responseQueue.push({job: job, result: "Fail"});
                continue;
            }
            try {
                const currentHabitIds = (existing.habitIds as string[]) || [];
                const updatedHabitIds = currentHabitIds.filter((id) => id !== payload.habitId);
                await prisma.folder.update({
                    where: {id: payload.id, userId: userId},
                    data: {
                        habitIds: updatedHabitIds,
                        updatedAt: nowInSeconds()
                    }
                });
                console.log("Sync remove habit from folder successful");
                responseQueue.push({job: job, result: "Success"});
                continue;
            } catch (error: unknown) {
                console.error('Failed to remove habit from folder:', error);
                responseQueue.push({job: job, result: "Fail"});
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