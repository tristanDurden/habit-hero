import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";



export async function GET(req:NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    const user = await prisma.user.findUnique({
        where: { email: session.user.email},
        include: {habitLog: true}
    })
    if (!user) {
        return NextResponse.json({error: "User not found"}, {status:404})
    }
    return NextResponse.json(user?.habitLog || []);
}