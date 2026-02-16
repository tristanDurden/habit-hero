import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { List } from "@/lib/types";
import { nowInSeconds } from "@/lib/timeCounter";




export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const body: List = await req.json();
    const { id } = await params;
    const list = await prisma.list.upsert({
        where: { id: id, userId: user.id },
        update: { name: body.name, description: body.description, type: body.type, isArchived: body.isArchived, updatedAt: nowInSeconds() },
        create: { id: id, name: body.name, description: body.description, type: body.type, isArchived: body.isArchived, createdAt: nowInSeconds(), updatedAt: nowInSeconds(), userId: user.id },
    });
    return NextResponse.json(list);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const list = await prisma.list.delete({
        where: { id: id, userId: user.id },
    });
    return NextResponse.json(list);
}