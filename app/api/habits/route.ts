import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Habit } from "@/lib/types";
import { Habibi } from "next/font/google";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { habits: true },
  });
  console.log(user);
  return NextResponse.json(user?.habits || []);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { habits: true },
    });
    //console.log(user);

    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  
    const body: Habit = await req.json();
    console.log('body',body);
    // refactoring schedule value for string and schedule and userId
    const scheduleString = Array.isArray(body.schedule)
      ? body.schedule
          .map((d: unknown) => {
            const dateObj = typeof d === "string" ? new Date(d) : new Date(d as Date);
            return dateObj.toISOString();
          })
          .join("/")
      : "";
    console.log(scheduleString);

    try {
      const newHabit = await prisma.habit.upsert({
        where: {
          id: body.id,
        },
        update: {
          counter: Number(body.counter),
          lastCompleted: body.lastCompleted/1000,
          streak: Number(body.streak),
          doneToday: body.doneToday,
        },
        create: {
          id: body.id,
          title: body.title,
          description: body.description,
          frequency: body.frequency[0].concat('/', body.frequency[1]),
          schedule: scheduleString,
          counter: Number(body.counter || 0),
          streak: Number(body.streak || 0),
          lastCompleted: (body.lastCompleted/1000),
          doneToday: Boolean(body.doneToday),
          userId: userId,
        },
      });
      return NextResponse.json(newHabit);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to create habit:', error);
      return NextResponse.json(
        { error: 'Failed to create habit', details: message },
        { status: 500 }
      );
    }
    
  }
  
  export async function UPDATE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { habits: true },
    });
    console.log(user);

    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  }