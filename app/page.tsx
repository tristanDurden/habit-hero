"use client";

import NavBar from "./components/NavBar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        {status === "loading" && (
          <p className="text-center text-gray-500">Loading session...</p>
        )}

        {status !== "loading" && !session && (
          <div className="text-center space-y-6 max-w-2xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Welcome to Habit Hero! 🎯
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Build better habits, track your progress, and achieve your goals.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Please log in to get started with your habit journey.
            </p>
          </div>
        )}

        {status !== "loading" && session && (
          <div className="text-center space-y-6 max-w-2xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back, {session.user?.name}! 👋
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Ready to continue your habit journey?
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                Go to Dashboard →
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
