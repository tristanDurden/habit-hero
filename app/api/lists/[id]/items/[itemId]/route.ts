import { prisma } from "@/lib/prisma";
import { ListItem } from "@/lib/types";
import { nowInSeconds } from "@/lib/timeCounter";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";




export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string, itemId: string }> }) {
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
    const { id, itemId } = await params;
    const list = await prisma.list.findUnique({
        where: { id: id, userId: user.id },
    });
    if (!list) {
        return NextResponse.json({ error: "List not found" }, { status: 404 });
    }
    const item = await prisma.listItem.findUnique({
        where: { id: itemId, listId: id },
    });
    if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    const body: ListItem = await req.json();
    // UI sends dueDate in milliseconds; DB stores seconds
    const dueDateInSeconds = body.dueDate ? Math.floor(body.dueDate / 1000) : body.dueDate;
    const result = await prisma.$transaction(async (tx) => {
        const updatedItem = await tx.listItem.update({
            where: { id: itemId, listId: id },
            data: { name: body.name, description: body.description, completed: body.completed, position: body.position, priority: body.priority, dueDate: dueDateInSeconds, quantity: body.quantity, unit: body.unit, updatedAt: nowInSeconds() },
        });
        await tx.list.update({
            where: { id: id },
            data: { updatedAt: nowInSeconds() },
        });
        return updatedItem;
    });
    return NextResponse.json(result);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, itemId: string }> }) {
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
    const { id, itemId } = await params;
    const list = await prisma.list.findUnique({
        where: { id: id, userId: user.id },
    });
    if (!list) {
        return NextResponse.json({ error: "List not found" }, { status: 404 });
    }
    const item = await prisma.listItem.findUnique({
        where: { id: itemId, listId: id },
    });
    if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    const result = await prisma.$transaction(async (tx) => {
        const deletedItem = await tx.listItem.delete({
            where: { id: itemId, listId: id },
        });
        await tx.list.update({
            where: { id: id },
            data: { updatedAt: nowInSeconds() },
        });
        return deletedItem;
    });
    return NextResponse.json(result);
}