"use client";

import NavBar from "./components/NavBar";
import Dashboard from "./components/Dashboard";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-6">
        {status === "loading" && (
          <p className="text-center text-gray-500">Loading session...</p>
        )}

        {status !== "loading" && !session && (
          <p className="text-center text-lg text-gray-700">
            Please log in to view your dashboard.
          </p>
        )}

        {status !== "loading" && session && <Dashboard session={session} />}
      </main>
    </div>
  );
}
