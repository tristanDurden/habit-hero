"use client";
import NavBar from "../components/NavBar";
import { useSession } from "next-auth/react";
import ActivityTable from "../components/ActivityTable";
import Tabs from "../components/Tabs";
import { Button } from "@/components/ui/button";
import { AddDefaultHabit } from "@/lib/types";
import HabitDialog from "../components/HabitDialog";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex flex-row gap-5 items-center py-3">
        <h1>
          Welcome, {session?.user?.name || "User"}! Your habit journey starts
          here 💪
        </h1>

        <HabitDialog mode="add" habit={AddDefaultHabit} />
      </div>
      <main className="flex-1 p-6">
        <Tabs />
      </main>
      <ActivityTable />
    </div>
  );
}
