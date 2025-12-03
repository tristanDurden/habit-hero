"use client";
import HabitCard from "../components/HabitCard";
import { Habit as DbHabit } from "@prisma/client";
import { numberTranslater, Habit as UiHabit } from "../../lib/types";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { dbHabitToUi } from "@/lib/dbformatting";
import useHabitStore from "../habitStore";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [habitsArray, setHabitsArray] = useState<DbHabit[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
  }, [refreshTrigger]);

  // Listen for custom event when habits are updated
  useEffect(() => {
    const handleHabitUpdate = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener("habitUpdated", handleHabitUpdate);
    return () => {
      window.removeEventListener("habitUpdated", handleHabitUpdate);
    };
  }, []);

  console.log("array", habitsArray);
  const localHabits = useHabitStore((state) => state.habits);
  const habits: UiHabit[] =
    habitsArray.length > 0
      ? habitsArray.map((dbhabit: DbHabit) => dbHabitToUi(dbhabit))
      : localHabits;

  const sortedHabits = habits.sort((a, b) => {
    // First group: not completed (doneToday === false)
    // Second group: already done (doneToday === true)
    if (a.doneToday !== b.doneToday) {
      return a.doneToday ? 1 : -1;
    }
    // Within each group: descending by frequencyNumber
    const freqA = numberTranslater[a.frequency[0]] || 0;
    const freqB = numberTranslater[b.frequency[0]] || 0;
    if (freqA !== freqB) {
      return freqB - freqA; // Descending order
    }
    // If frequency equal: descending by lastCompleted (more recent first)
    return b.lastCompleted - a.lastCompleted;
  });
  //reffactoring object for Habit Card

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {session?.user?.name} 👋</h1>
      <p className="mt-2 text-gray-600">
        This is your private dashboard — only visible when logged in.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {sortedHabits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </div>
    </main>
  );
}
