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
        //checking for online
        if (isOnline) {
          try {
            const response1 = await fetch("/api/habits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedHabit),
            });
            const response2 = await fetch("/api/habitlog", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                habitId: habit.id,
                date: todayKey(nowDate()),
                count: newCounter,
              }),
            });
            if (!response1.ok || !response2.ok) {
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
          //have to push to jobs for updating the habit db and habitlog db
          pushQueue({
            type: "UPDATE",
            payload: { ...updatedHabit },
            timestamp: nowDate().toISOString(),
          });
          pushQueue({
            type: "LOGGING",
            payload: {
              habitId: updatedHabit.id,
              date: todayKey(nowDate()),
              count: updatedHabit.counter,
            },
            timestamp: nowDate().toISOString(),
          });
        }
        console.log("click!");
        updateHabitLog(habit.id, todayKey(nowDate()));
        updateHabit(updatedHabit);
        // Dispatch custom event to trigger refetch in dashboard
        window.dispatchEvent(new CustomEvent("habitUpdated"));
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
            const response1 = await fetch("/api/habitlog", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                habitId: habit.id,
                date: todayKey(nowDate()),
                count: newCounter,
              }),
            });
            const response2 = await fetch("/api/habits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedHabit),
            });
            if (!response1.ok || !response2.ok) {
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
            type: "UPDATE",
            payload: { ...updatedHabit },
            timestamp: nowDate().toISOString(),
          });
          pushQueue({
            type: "LOGGING",
            payload: {
              habitId: updatedHabit.id,
              date: todayKey(nowDate()),
              count: updatedHabit.counter,
            },
            timestamp: nowDate().toISOString(),
          });
        }
        updateHabitLog(habit.id, todayKey(nowDate()));
        updateHabit(updatedHabit);
      }
      toast(`You completed your "${habit.title}"`, {
        position: "top-center",
        description: `Great Work!`,
      });
      // Dispatch custom event to trigger refetch in dashboard
      window.dispatchEvent(new CustomEvent("habitUpdated"));
    } else {
      toast(`You ve already completed your "${habit.title} for now"`, {
        position: "top-center",
        description: `Come back later`,
      });
    }
    };
};