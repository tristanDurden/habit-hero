import { useEffect, useRef } from "react";
import useTimerStore from "../../timerStore";
import useHabitStore from "@/app/habitStore";

export function useTimerTick(habitId: string) {
  const tick = useTimerStore((s) => s.tick);
  // Only depend on timer.status, not the whole timer object
  const timerStatus = useHabitStore((s) =>
    s.habits.find((h) => h.id === habitId)?.timer?.status
  );
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!timerStatus) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (timerStatus === "running" && intervalRef.current === null) {
      intervalRef.current = window.setInterval(() => {
        tick(habitId, 1000);
      }, 1000);
    }

    if (timerStatus !== "running" && intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [habitId, timerStatus, tick]);
}
