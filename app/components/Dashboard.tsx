"use client";
import React from "react";
import useHabitStore from "../habitStore";
import HabitCard from "./HabitCard";
import { Button } from "@/components/ui/button";
import HabitDialog from "./HabitDialog";

type Props = {};

export default function Dashboard({}: Props) {
  const habits = useHabitStore((state) => state.habits);

  return (
    <div className="p-4 flex flex-col">
      <div className="flex flex-row gap-5 items-center py-3">
        <h1>Habit hero is here! Your habit journey start from here!</h1>

        <HabitDialog mode="add" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4">
        {habits.map((habit) => {
          return <HabitCard key={habit.id} habit={habit} />;
        })}
      </div>
    </div>
  );
}
