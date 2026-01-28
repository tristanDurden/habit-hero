import useHabitStore from "@/app/habitStore";
import { useOnlineStatus } from "@/app/providers/online-status";
import { keepDayStreak, keepWeekStreak, now, nowDate, todayKey } from "@/lib/timeCounter";
import { numberTranslater, Habit as uiHabit } from "@/lib/types";
import { toast } from "sonner";

export function useHabitCompletion() {
  //online const
  const { isOnline } = useOnlineStatus();

  // habitStore functions
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const updateHabitLog = useHabitStore((state) => state.updateHabitLog);
  const pushQueue = useHabitStore((state) => state.pushQueue);

  return async function completeHabit(habit: uiHabit) {
    //console.log(habit); //test
    const frequencyNumber = numberTranslater[habit.frequency[0]];
    const newCounter = habit.counter + 1;
    const checkFinish = newCounter === frequencyNumber;
    console.log(checkFinish);

    if (habit.doneToday === false) {
      //need to get a seperate function to handle to keep code clean

      // updating the button for day frequency
      if (habit.frequency[1] === "day") {
        const updatedHabit: uiHabit = {
          ...habit,
          counter: newCounter,
          lastCompleted: now(),
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
            // Send habit update and log completion in a single atomic request
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
          // Queue atomic update with log (same as online behavior)
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
        updateHabit(updatedHabit);
        // notify listeners that habit log changed (e.g. ActivityTable)
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
            // Send habit update and log completion in a single atomic request
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
          // Queue atomic update with log (same as online behavior)
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
        updateHabit(updatedHabit);
        // notify listeners that habit log changed (e.g. ActivityTable)
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
        window.dispatchEvent(new CustomEvent("habitUpdated"));
      }, 100);
    } else {
      toast(`You ve already completed your "${habit.title} for now"`, {
        position: "top-center",
        description: `Come back later`,
      });
    }
  };
};