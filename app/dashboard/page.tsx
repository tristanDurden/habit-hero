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
        <Tabs />
      </main>
      <ActivityTable />
    </div>
  );
}
