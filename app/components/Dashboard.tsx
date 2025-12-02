"use client";

import React, { useState } from "react";
import useHabitStore from "../habitStore";
import HabitCard from "./HabitCard";
import HabitDialog from "./HabitDialog";
import { AddDefaultHabit } from "@/lib/types";
import ActivityTable from "./ActivityTable";
import { Session } from "next-auth";

interface DashboardProps {
  session: Session; // or type from next-auth
}

export default function Dashboard({ session }: DashboardProps) {
  const habits = useHabitStore((state) => state.habits);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row gap-5 items-center py-3">
        <h1>
          Welcome, {session.user?.name}! Your habit journey starts here 💪
        </h1>

        <HabitDialog mode="add" habit={AddDefaultHabit} />
      </div>

      {/* habits mapping */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </div>

      <ActivityTable />
    </div>
  );
}
