import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: habitId } = await params;

  // Ensure the habit belongs to the signed-in user
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    include: { user: { select: { email: true } } },
  });

  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (habit.user.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await prisma.habit.delete({ where: { id: habitId } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to create habit:', error);
    return NextResponse.json(
      { error: 'Failed to create habit', details: message },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}