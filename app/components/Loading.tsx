"use client";
import React from "react";
import HabitDialog from "./HabitDialog";
import useHabitStore from "../habitStore";
import HabitCard from "./HabitCard";
import useUiStore from "../uiStore";
import { AddDefaultHabit } from "@/lib/types";

export default function Loading() {
  const habits = useHabitStore((state) => state.habits);
  const isLoading = useUiStore((state) => state.isLoading);

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="flex flex-row gap-5 items-center py-3">
        <h1 className="text-lg font-semibold">
          Habit hero is here! Your habit journey starts from here!
        </h1>
        <HabitDialog mode="add" habit={AddDefaultHabit} />
      </div>

      {/* Skeleton grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 w-full bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
              />
            ))
          : habits.map((habit) => <HabitCard key={habit.id} habit={habit} />)}
      </div>
    </div>
  );
}
