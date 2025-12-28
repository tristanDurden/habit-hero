"use client";
import NavBar from "../components/NavBar";
import { useSession } from "next-auth/react";
import ActivityTable from "../components/ActivityTable";
import Tabs from "../components/Tabs";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">
          Welcome, {session?.user?.name} 👋
        </h1>
        <p className="mt-2 text-gray-600">
          This is your private dashboard — only visible when logged in.
        </p>
        <Tabs />
      </main>
      <ActivityTable />
    </div>
  );
}
