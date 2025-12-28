import useHabitStore from "@/app/habitStore";
import { useOnlineStatus } from "@/app/providers/online-status";
import { nowDate } from "@/lib/timeCounter";
import { Habit as uiHabit } from "@/lib/types";
import { toast } from "sonner";

export function useHabitLogDuration() {
  const { isOnline } = useOnlineStatus();
  const updateHabitLogDuration = useHabitStore(
    (state) => state.updateHabitLogDuration
  );
  const pushQueue = useHabitStore((state) => state.pushQueue);
  const habits = useHabitStore((state) => state.habits);

  return async function logDuration(
    habitId: string,
    date: string,
    duration: number
  ) {
    // Get the habit to sync
    const habit: uiHabit | undefined = habits.find((h) => h.id === habitId);
    if (!habit) {
      // If habit doesn't exist, just update the log locally
      updateHabitLogDuration(habitId, date, duration);
      return;
    }

    // Get current log entry to calculate totals BEFORE updating state
    const state = useHabitStore.getState();
    const habitLog = state.habitLog[habitId] || [];
    const existingEntry = habitLog.find((entry) => entry.date === date);
    const currentCount = existingEntry ? existingEntry.count : 1;
    const totalDuration = existingEntry
      ? existingEntry.duration + duration
      : duration;

    // Update local state first
    updateHabitLogDuration(habitId, date, duration);

    // Handle sync
    if (isOnline) {
      try {
        const response = await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...habit,
            logCompletion: {
              date: date,
              count: currentCount,
              duration: totalDuration,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to sync duration");
        }
      } catch (err) {
        console.error("Failed to sync duration:", err);
        toast.error("Failed to sync duration", {
          description: "Changes saved locally",
          position: "top-center",
        });
      }
    } else {
      // Offline: Queue the operation
      pushQueue({
        type: "HABIT_LOG",
        payload: {
          habitId,
          date,
          count: currentCount,
          duration: totalDuration,
        },
        timestamp: nowDate().toISOString(),
      });
    }
  };
}

