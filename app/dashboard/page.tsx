"use client";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import HabitCard from "../components/HabitCard";
import { Habit } from "@prisma/client";
import { Habit as UiHabit } from "../../lib/types";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [habitsArray, setHabitsArray] = useState([]);
  // get habits from db
  useEffect(() => {
    const fetchHabits = async () => {
      const res = await fetch("api/habits", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("didnt fetch data");
      const data = await res.json();
      setHabitsArray(data || []);
    };
    fetchHabits();
  }, []);

  console.log("array", habitsArray);
  const habits = habitsArray;
  //reffactoring object for Habit Card
  const refactoredHabits: UiHabit[] = habits.map((habit: Habit) => {
    const schedule = habit.schedule.split("/").map((date) => new Date(date));
    const frequency = habit.frequency.split("/");
    return {
      id: habit.id,
      title: habit.title,
      description: habit.description,
      frequency: frequency as [
        "" | "one" | "two" | "three",
        "" | "day" | "week" | "month"
      ],
      schedule: schedule,
      counter: habit.counter,
      streak: habit.streak,
      lastCompleted: Number(habit.lastCompleted) * 1000,
      doneToday: habit.doneToday,
    };
  });

  // if (!session) {
  //   redirect("/api/auth/signin"); // ⬅ redirect to GitHub login
  // }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {session?.user?.name} 👋</h1>
      <p className="mt-2 text-gray-600">
        This is your private dashboard — only visible when logged in.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {refactoredHabits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </div>
    </main>
  );
}
