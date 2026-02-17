import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nowInSeconds } from "@/lib/timeCounter";
import { ListItem } from "@/lib/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params;
    const list = await prisma.list.findUnique({
        where: { id: id, userId: user.id },
        include: { items: true },
    });
    if (!list) {
        return NextResponse.json({ error: "List not found" }, { status: 404 });
    }
    return NextResponse.json(list.items);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params;
    const list = await prisma.list.findUnique({
        where: { id: id, userId: user.id },
    });
    if (!list) {
        return NextResponse.json({ error: "List not found" }, { status: 404 });
    }
    const body: ListItem = await req.json();
    // UI sends dueDate in milliseconds; DB stores seconds
    const dueDateInSeconds = body.dueDate ? Math.floor(body.dueDate / 1000) : body.dueDate;
    const result = await prisma.$transaction(async (tx) => {
        const item = await tx.listItem.create({
            data: { id: body.id, listId: id, name: body.name, description: body.description, completed: body.completed, position: body.position, priority: body.priority, dueDate: dueDateInSeconds, quantity: body.quantity, unit: body.unit, createdAt: nowInSeconds(), updatedAt: nowInSeconds() },
        });
        await tx.list.update({
            where: { id: id },
            data: { updatedAt: nowInSeconds() },
        });
        return item;
    });
    return NextResponse.json(result);
}