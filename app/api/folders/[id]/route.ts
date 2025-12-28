import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { nowInSeconds } from "@/lib/timeCounter";


export async function POST(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    const user = await prisma.user.findUnique({
        where: {email: session.user.email},
    })
    if (!user) {
        return NextResponse.json({error: "User not found"}, {status:404});
    }
    const body: {habitId: string} = await req.json();
    const {id: folderId} = await params;
    
    // First verify the folder belongs to the user
    const folder = await prisma.folder.findFirst({
        where: {id: folderId, userId: user.id}
    })
    if (!folder) {
        return NextResponse.json({error: "Folder not found"}, {status: 404});
    }
    try {
        // Get current habitIds array (Prisma returns JSON as parsed object/array)
        const currentHabitIds = (folder.habitIds as string[]) || [];
        
        // Check if habitId already exists
        if (currentHabitIds.includes(body.habitId)) {
            return NextResponse.json(folder); // Already added, return folder as-is
        }
        
        // Add the new habitId
        const updatedHabitIds = [...currentHabitIds, body.habitId];
        
        const updatedFolder = await prisma.folder.update({
            where: {id: folderId},
            data: {
                habitIds: updatedHabitIds,
                updatedAt: nowInSeconds()
            }
        });
        return NextResponse.json(updatedFolder);
    } catch (error: unknown) {
        console.error('Failed to add habit to folder:', error);
        return NextResponse.json({error: "Failed to add habit to folder"}, {status: 500});
    }   
}

export async function DELETE(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    const user = await prisma.user.findUnique({
        where: {email: session.user.email},
    })
    if (!user) {
        return NextResponse.json({error: "User not found"}, {status:404});
    }
    const body: {habitId: string} = await req.json();
    const {id: folderId} = await params;
    
    // First verify the folder belongs to the user
    const folder = await prisma.folder.findFirst({
        where: {id: folderId, userId: user.id}
    })
    if (!folder) {
        return NextResponse.json({error: "Folder not found"}, {status: 404});
    }
    try {
        // Get current habitIds array (Prisma returns JSON as parsed object/array)
        const currentHabitIds = (folder.habitIds as string[]) || [];
        
        // Remove the habitId from the array
        const updatedHabitIds = currentHabitIds.filter((id) => id !== body.habitId);
        
        const updatedFolder = await prisma.folder.update({
            where: {id: folderId},
            data: {
                habitIds: updatedHabitIds,
                updatedAt: nowInSeconds()
            }
        });
        return NextResponse.json(updatedFolder);
    } catch (error: unknown) {
        console.error('Failed to remove habit from folder:', error);
        return NextResponse.json({error: "Failed to remove habit from folder"}, {status: 500});
    }
}
