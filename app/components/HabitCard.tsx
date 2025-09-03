"use client";
import React from "react";
import useHabitStore, { Habit } from "../habitStore";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash } from "lucide-react";
import HabitDialog from "./HabitDialog";

type Props = {
  habit: Habit;
};

export default function HabitCard({ habit }: Props) {
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const removeHabit = useHabitStore((state) => state.removeHabit);

  return (
    <div className="">
      <Card className="w-full max-w-xs">
        <CardHeader>
          <CardTitle>{habit.title}</CardTitle>
          <CardDescription>{habit.frequency}</CardDescription>
          <CardAction className="flex gap-2">
            <HabitDialog mode="update" />
            <button
              onClick={() => removeHabit(habit.id)}
              className="cursor-pointer bg-slate-200 hover:bg-slate-400 rounded-full px-2"
            >
              <Trash size={20} />
            </button>
          </CardAction>
        </CardHeader>
        <CardContent className="border-2 border-slate-500">
          <p>{habit.description}</p>
          <p>Your streak: {habit.streak}</p>
          <p>
            {habit.doneToday
              ? "You ve already done it for today"
              : "Your task is waiting for making it today"}
          </p>
          <p>when done last time: {habit.lastCompleted}</p>
        </CardContent>
        <CardFooter>
          <p>Progress Bar, Badges and something else</p>
        </CardFooter>
      </Card>
    </div>
  );
}
