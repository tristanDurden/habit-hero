import useHabitStore from "@/app/habitStore";
import { useOnlineStatus } from "@/app/providers/online-status";
import {
  keepDayStreak,
  keepMonthStreak,
  keepWeekStreak,
  now,
  nowDate,
  todayKey,
} from "@/lib/timeCounter";
import { numberTranslater, Habit as uiHabit } from "@/lib/types";
import { toast } from "sonner";

export default function useHabitMutations() {
  // online const
  const { isOnline } = useOnlineStatus();

  // habitStore functions
  const storeUpdateHabit = useHabitStore((state) => state.updateHabit);
  const updateHabitLog = useHabitStore((state) => state.updateHabitLog);
  const updateHabitLogDuration = useHabitStore(
    (state) => state.updateHabitLogDuration
  );
  const pushQueue = useHabitStore((state) => state.pushQueue);
  const addHabit = useHabitStore((state) => state.addHabit);
  const removeHabit = useHabitStore((state) => state.removeHabit);
  const habits = useHabitStore((state) => state.habits);

  const notify = new CustomEvent("habitUpdated");

  // ── Complete Habit ──────────────────────────────────────────────

  async function completeHabit(habit: uiHabit) {
    const frequencyNumber = numberTranslater[habit.frequency[0]];
    const newCounter = habit.counter + 1;
    const checkFinish = newCounter === frequencyNumber;
    console.log(checkFinish);

    if (habit.doneToday === false) {
      // updating the button for day frequency
      if (habit.frequency[1] === "day") {
        const updatedHabit: uiHabit = {
          ...habit,
          counter: newCounter,
          lastCompleted: checkFinish ? now() : habit.lastCompleted,
          streak: checkFinish
            ? keepDayStreak(habit)
              ? habit.streak + 1
              : 1
            : habit.streak,
          doneToday: checkFinish ? true : habit.doneToday,
        };
        // checking for online
        if (isOnline) {
          try {
            const response = await fetch("/api/habits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...updatedHabit,
                logCompletion: {
                  date: todayKey(nowDate()),
                  count: newCounter,
                },
              }),
            });
            if (!response.ok) {
              throw new Error("Update failed");
            }
          } catch {
            toast.error("Failed to update habit", {
              description: "Please try again later",
              position: "top-center",
            });
            return;
          }
        } else {
          pushQueue({
            type: "HABIT_UPDATE_WITH_LOG",
            payload: {
              habit: { ...updatedHabit },
              logCompletion: {
                date: todayKey(nowDate()),
                count: newCounter,
              },
            },
            timestamp: nowDate().toISOString(),
          });
        }
        console.log("click!");
        updateHabitLog(habit.id, todayKey(nowDate()));
        storeUpdateHabit(updatedHabit);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("habitLogUpdated"));
        }
        // WEEK LOGIC
      } else if (habit.frequency[1] === "week") {
        const updatedHabit: uiHabit = {
          ...habit,
          counter: newCounter,
          lastCompleted: now(),
          streak: keepWeekStreak(habit) ? habit.streak + 1 : 1,
          doneToday: true,
        };
        if (isOnline) {
          try {
            const response = await fetch("/api/habits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...updatedHabit,
                logCompletion: {
                  date: todayKey(nowDate()),
                  count: newCounter,
                },
              }),
            });
            if (!response.ok) {
              throw new Error("Updating failed");
            }
          } catch {
            toast.error("Failed to update habit", {
              description: "Please try again later",
              position: "top-center",
            });
            return;
          }
        } else {
          pushQueue({
            type: "HABIT_UPDATE_WITH_LOG",
            payload: {
              habit: { ...updatedHabit },
              logCompletion: {
                date: todayKey(nowDate()),
                count: newCounter,
              },
            },
            timestamp: nowDate().toISOString(),
          });
        }
        updateHabitLog(habit.id, todayKey(nowDate()));
        storeUpdateHabit(updatedHabit);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("habitLogUpdated"));
        }
        // MONTH LOGIC
      } else if (habit.frequency[1] === "month") {
        const updatedHabit: uiHabit = {
          ...habit,
          counter: newCounter,
          lastCompleted: now(),
          streak: keepMonthStreak(habit) ? habit.streak + 1 : 1,
          doneToday: true,
        };
        if (isOnline) {
          try {
            const response = await fetch("/api/habits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...updatedHabit,
                logCompletion: {
                  date: todayKey(nowDate()),
                  count: newCounter,
                },
              }),
            });
            if (!response.ok) {
              throw new Error("Updating failed");
            }
          } catch {
            toast.error("Failed to update habit", {
              description: "Please try again later",
              position: "top-center",
            });
            return;
          }
        } else {
          pushQueue({
            type: "HABIT_UPDATE_WITH_LOG",
            payload: {
              habit: { ...updatedHabit },
              logCompletion: {
                date: todayKey(nowDate()),
                count: newCounter,
              },
            },
            timestamp: nowDate().toISOString(),
          });
        }
        updateHabitLog(habit.id, todayKey(nowDate()));
        storeUpdateHabit(updatedHabit);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("habitLogUpdated"));
        }
      }
      toast(`You completed your "${habit.title}"`, {
        position: "top-center",
        description: `Great Work!`,
      });
      // Dispatch after a small delay to ensure API has processed the update
      setTimeout(() => {
        window.dispatchEvent(notify);
      }, 100);
    } else {
      toast(`You ve already completed your "${habit.title} for now"`, {
        position: "top-center",
        description: `Come back later`,
      });
    }
  }

  // ── Create Habit ────────────────────────────────────────────────

  async function createHabit(habit: uiHabit) {
    if (isOnline) {
      try {
        const response = await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...habit,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create habit");
        }
      } catch {
        toast.error("Failed to save habit", {
          description: "Please try again later",
          position: "top-center",
        });
        return;
      }
    } else {
      pushQueue({
        type: "HABIT_CREATE",
        payload: habit,
        timestamp: nowDate().toISOString(),
      });
    }

    addHabit(habit);
    toast(`You've added "${habit.title}" to your habits list`, {
      description: `Start to accomplish it`,
      position: "top-center",
    });
    window.dispatchEvent(notify);
  }

  // ── Delete Habit ────────────────────────────────────────────────

  async function deleteHabit(id: string) {
    const habit = useHabitStore.getState().habits.find((h) => h.id === id);
    const habitTitle = habit?.title || "habit";

    if (isOnline) {
      try {
        const response = await fetch(`/api/habits/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error("Failed to delete habit");
        }
      } catch {
        toast.error("Failed to delete habit", {
          description: "Please try again later",
          position: "top-center",
        });
        return;
      }
    } else {
      pushQueue({
        type: "HABIT_DELETE",
        payload: { id: id },
        timestamp: nowDate().toISOString(),
      });
    }
    removeHabit(id);

    toast(`You deleted your "${habitTitle}"`, {
      position: "bottom-left",
      description: `I guess we will never know what you made of!`,
    });
    window.dispatchEvent(notify);
  }

  // ── Update Habit ────────────────────────────────────────────────

  async function updateHabit(habit: uiHabit) {
    if (isOnline) {
      try {
        const response = await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...habit,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update habit");
        }
      } catch {
        toast.error("Failed to update habit", {
          description: "Please try again later",
          position: "top-center",
        });
        return;
      }
    } else {
      pushQueue({
        type: "HABIT_UPDATE",
        payload: habit,
        timestamp: nowDate().toISOString(),
      });
    }
    storeUpdateHabit(habit);
    toast(`You've updated your "${habit.title}" habit`, {
      description: `Proceed to accomplishing your dream`,
      position: "top-center",
    });
    window.dispatchEvent(notify);
  }

  // ── Log Duration ────────────────────────────────────────────────

  async function logDuration(habitId: string, date: string, duration: number) {
    const habit: uiHabit | undefined = habits.find((h) => h.id === habitId);
    if (!habit) {
      updateHabitLogDuration(habitId, date, duration);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("habitLogUpdated"));
      }
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
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("habitLogUpdated"));
    }

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
  }

  return {
    completeHabit,
    createHabit,
    deleteHabit,
    updateHabit,
    logDuration,
  };
}
