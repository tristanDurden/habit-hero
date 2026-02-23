"use client";
import { AddDefaultHabit, Habit, List, ListItem } from "@/lib/types";
import ActivityTable from "../components/misc/ActivityTable";
import HabitDialog from "../components/habits/HabitDialog";
import NewEditList from "../components/lists/NewEditList";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useHabitStore from "../habitStore";
import useListsStore from "../listsStore";
import isReadyToComplete from "@/lib/timeCounter";
import HabitCard from "../components/habits/HabitCard";
import { Checkbox } from "@/components/ui/checkbox";
import useListMutations from "../hooks/lists/useListMutations";
import useListSync from "../hooks/lists/useListSync";
import useHabitSync from "../hooks/habits/useHabitSync";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Sync habits & lists so we have fresh data
  useHabitSync();
  useListSync();

  // Get habits due today
  const habits = useHabitStore((s) => s.habits);
  const todayHabits = habits.filter(
    (habit: Habit) => isReadyToComplete(habit) && !habit.doneToday
  );

  // Get list items due today
  const lists = useListsStore((s) => s.lists);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayStartSec = Math.floor(todayStart.getTime() / 1000);
  const todayEndSec = Math.floor(todayEnd.getTime() / 1000);

  // Collect list items due today (with their parent list info)
  const todayListItems: { list: List; item: ListItem }[] = [];
  lists.forEach((list) => {
    if (list.isArchived) return;
    list.items.forEach((item) => {
      if (
        item.dueDate &&
        item.dueDate >= todayStartSec &&
        item.dueDate <= todayEndSec &&
        !item.completed
      ) {
        todayListItems.push({ list, item });
      }
    });
  });

  return (
    <div className="flex flex-col p-6 gap-6">
      <h1 className="text-center text-2xl font-bold">
        Welcome, {session?.user?.name || "User"}! Your habit journey starts
        here 💪
      </h1>

      {/* Create buttons */}
      <div className="flex flex-row gap-5 items-center justify-center">
        <HabitDialog
          mode="add"
          habit={AddDefaultHabit}
          className="cursor-pointer p-0 m-0 items-center justify-center border-2 border-gray-300 rounded-md px-2 py-1"
          onCreated={() => router.push("/dashboard/habits")}
        />
        <NewEditList
          mode="add"
          onCreated={() => router.push("/dashboard/lists")}
        />
      </div>

      {/* Today's habits */}
      {todayHabits.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Habits to complete today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        </section>
      )}

      {/* Today's list items */}
      {todayListItems.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Tasks due today</h2>
          <div className="flex flex-col gap-2">
            {todayListItems.map(({ list, item }) => (
              <TodayListItem key={item.id} list={list} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {todayHabits.length === 0 && todayListItems.length === 0 && (
        <p className="text-center text-muted-foreground">
          Nothing due today &#8212; you&apos;re all caught up! 🎉
        </p>
      )}

      {/* Activity table */}
      <ActivityTable />
    </div>
  );
}

function TodayListItem({ list, item }: { list: List; item: ListItem }) {
  const { toggleListItem } = useListMutations();

  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => toggleListItem(item)}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-medium truncate">{item.name}</span>
        {item.description && (
          <span className="text-sm text-muted-foreground truncate">
            {item.description}
          </span>
        )}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {list.name}
      </span>
      {item.priority && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
            item.priority === "high"
              ? "bg-red-100 text-red-700"
              : item.priority === "medium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {item.priority}
        </span>
      )}
    </div>
  );
}
