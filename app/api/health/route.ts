import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`; // or a tiny findFirst on habits
        return NextResponse.json(
          { ok: true, timestamp: Date.now(), version: process.env.APP_VERSION || "dev" },
          { status: 200 }
        );
      } catch (err) {
        return NextResponse.json(
          { ok: false, error: "db_unreachable", details: (err as Error).message },
          { status: 503 }
        );
      }
}