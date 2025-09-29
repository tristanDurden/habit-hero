"use client";
import React from "react";
import useHabitStore, { todayKey } from "../habitStore";
import HabitCard from "./HabitCard";
import HabitDialog from "./HabitDialog";
import { AddDefaultHabit } from "@/lib/types";

export default function Dashboard() {
  const habits = useHabitStore((state) => state.habits);
  const habitLog = useHabitStore((state) => state.habitLog);

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="flex flex-row gap-5 items-center py-3">
        <h1>Habit hero is here! Your habit journey start from here!</h1>

        <HabitDialog mode="add" habit={AddDefaultHabit} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {habits.map((habit) => {
          return <HabitCard key={habit.id} habit={habit} />;
        })}
      </div>
      <div>
        {Object.entries(habitLog).map(([habitId]) => (
          <p key={habitId}>
            {habitId} - {todayKey()} - {habitLog[habitId][todayKey()]}
          </p>
        ))}
      </div>
    </div>
  );
}
