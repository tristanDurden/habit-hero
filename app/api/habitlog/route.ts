import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { nowInSeconds } from "@/lib/timeCounter";


export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    const user = await prisma.user.findUnique({
        where: {email: session.user.email},
        include: {habitLog: true}
    })
    //console.log(user);

    const userId = user?.id;
    if (!userId) {
        return NextResponse.json({error: "No user found"}, {status: 404});
    }
    const body: {habitId: string, date: string, count: number} = await req.json();

    // find if the log already exist
    // const oldLog = await prisma.habitLog.findUnique({
    //     where: {
    //         habitId: body.habitId,
    //         date: body.date,
    //         userId: userId,
    //     }
    // })

    //change for upsert. I need id of log beforehand. no it doesnt help. there should b better way to store values
    //let split logic in two different ways.
    try {
        const newLog = await prisma.habitLog.upsert({
            where: {
                habitId_date_userId: {
                    habitId: body.habitId,
                    date: body.date,
                    userId
                }
            },
            update: {
                count: body.count,
                updatedAt: nowInSeconds(),
            },
            create: {
                habitId: body.habitId,
                date: body.date,
                count: body.count,
                userId: userId,
                updatedAt: nowInSeconds(),
            }
        })
        return NextResponse.json(newLog);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Uknown error";
        console.log("Can't put log", error);
        return NextResponse.json({error:"cant put log into",details: message}, {status: 500})
    }

    
}

export async function DELETE(req:NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    const user = await prisma.user.findUnique({
        where: {email: session.user.email},
        //select: {habitLog: true}
    })
    if (!user?.id) {
        return NextResponse.json({error: "No user found"}, {status: 404})
    }
    const userId = user?.id;

    const body: {habitId: string} = await req.json();

    try {
        const deleteLog = await prisma.habitLog.deleteMany({
            where: {
                    habitId: body.habitId,
                    userId: userId,
            }
        })
        return NextResponse.json({deleteLog});
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "uknown error";
        console.log("cant delete log - ", message);
        return NextResponse.json({error: "Cant delete log", details: message}, {status: 500});
    }
}