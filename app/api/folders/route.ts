import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Folder } from "@/lib/types";
import { nowInSeconds } from "@/lib/timeCounter";


export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const folders = await prisma.folder.findMany({
      where: { userId: user.id },
    });
    
    return NextResponse.json(folders || []);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const body: Folder = await req.json();
    const folder = await prisma.folder.upsert({
        where: { id: body.id },
        update: { 
            name: body.name, 
            habitIds: body.habitIds,
            updatedAt: nowInSeconds() 
        },
        create: { id: body.id, name: body.name, userId: userId, habitIds: body.habitIds, updatedAt: nowInSeconds() },
    });

    return NextResponse.json(folder);
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    const body = await req.json();
    const folder = await prisma.folder.delete({
        where: {id: body.id, userId: user.id}
    });
    return NextResponse.json(folder);
}