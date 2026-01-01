"use client";

import { useEffect, useRef } from "react";
import useTimerStore from "../../timerStore";
import useHabitStore from "../../habitStore";

export function GlobalTimerTick() {
  const tick = useTimerStore((s) => s.tick);
  // Only depend on the count of running timers, not the whole habits array
  const runningTimerCount = useHabitStore(
    (s) => s.habits.filter((h) => h.timer?.status === "running").length
  );
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (runningTimerCount > 0 && intervalRef.current === null) {
      intervalRef.current = window.setInterval(() => {
        // Get fresh habits from store to avoid stale closures
        const currentHabits = useHabitStore.getState().habits;
        const currentRunningTimers = currentHabits.filter(
          (h) => h.timer?.status === "running"
        );

        // Tick all running timers
        currentRunningTimers.forEach((habit) => {
          if (habit.timer?.status === "running") {
            tick(habit.id, 1000);
          }
        });
      }, 1000);
    }

    if (runningTimerCount === 0 && intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [runningTimerCount, tick]);

  return null;
}
