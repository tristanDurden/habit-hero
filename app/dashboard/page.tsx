"use client";
import { AddDefaultHabit } from "@/lib/types";
import ActivityTable from "../components/misc/ActivityTable";
import HabitDialog from "../components/habits/HabitDialog";
import Tabs from "../components/tabs/Tabs";
import { useSession } from "next-auth/react";
import NewEditList from "../components/lists/NewEditList";

export default function DashboardPage() {
  const { data: session } = useSession();
  return (
    <>
      <h1 className="text-center">
        Welcome, {session?.user?.name || "User"}! Your habit journey starts
        here 💪
      </h1>
      <div className="flex flex-row gap-5 items-center justify-center px-6 py-3">
        <HabitDialog
          mode="add"
          habit={AddDefaultHabit}
          className="cursor-pointer p-0 m-0 items-center justify-center border-2 border-gray-300 rounded-md px-2 py-1"
        />
        <NewEditList mode="add" />
      </div>
      <p>All habits and list which are have to be done today go here</p>
      <ActivityTable />
    </>
  );
}
