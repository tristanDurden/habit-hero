import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { List } from "@/lib/types";
import { nowInSeconds } from "@/lib/timeCounter";


// Create a new list
export async function POST(req: NextRequest) {
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
    const list = await prisma.list.upsert({
        where: { id: body.id },
        update: { name: body.name, description: body.description, type: body.type, isArchived: body.isArchived, updatedAt: nowInSeconds() },
        create: { id: body.id, name: body.name, description: body.description, type: body.type, isArchived: body.isArchived, createdAt: nowInSeconds(), updatedAt: nowInSeconds(), userId: user.id },
    });
    return NextResponse.json(list);
}
// Get all lists
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
    const lists = await prisma.list.findMany({
        where: { userId: user.id },
        include: { items: true },
    });
    return NextResponse.json(lists);
}