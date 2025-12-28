"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { Timer, TimerConfigForm } from "../../types/timer";
import { toast } from "sonner";
import useTimerStore from "../../timerStore";
import { useHabitCompletion } from "../../hooks/habits/useHabitCompletion";
import { useHabitLogDuration } from "../../hooks/habits/useHabitLogDuration";
import useHabitStore from "../../habitStore";
import { todayKey, nowDate } from "@/lib/timeCounter";
import { numberTranslater } from "@/lib/types";

type Props = {
  habitId: string;
  form: TimerConfigForm;
  timer?: Timer;
  onHide: () => void;
};

export default function TimerButtons({ habitId, form, timer, onHide }: Props) {
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resetTimer = useTimerStore((s) => s.resetTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const finishTimer = useTimerStore((s) => s.finishTimer);
  const showFloatingTimer = useTimerStore((s) => s.showFloatingTimer);

  const completeHabit = useHabitCompletion();
  const logDuration = useHabitLogDuration();

  const handleStart = () => {
    switch (form.type) {
      case "count_up":
        startTimer(habitId, { type: form.type });
        break;
      case "count_down":
        if (!form.durationMin)
          return toast.warning("Specify duration for count down");
        startTimer(habitId, {
          type: form.type,
          durationMs: form.durationMin * 60 * 1000,
        });
        break;
      case "pomodoro":
        if (!form.durationMin || !form.breakDurationMin || !form.cycles)
          return toast.warning("Specify all Pomodoro fields");
        startTimer(habitId, {
          type: form.type,
          durationMs: form.durationMin * 60 * 1000,
          breakDurationMs: form.breakDurationMin * 60 * 1000,
          cycles: form.cycles,
        });
        break;
    }
  };

  const handleFinish = async () => {
    // Get fresh habit from store to avoid stale closures
    const habit = useHabitStore.getState().habits.find((h) => h.id === habitId);
    if (!habit || !habit.timer) return;

    // Save the elapsed time from the timer before it might be cleared
    const elapsedMs = habit.timer.elapsedMs;

    // Finish the timer first - this updates timer status
    // Note: finishTimer no longer calls updateHabitLog to avoid double-counting
    finishTimer(habitId);

    // Wait a bit longer to ensure store updates are fully processed
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Get fresh habit again after finishTimer updates the store
    // Use a fresh reference to ensure we have the latest state
    let updatedHabit = useHabitStore
      .getState()
      .habits.find((h) => h.id === habitId);
    if (!updatedHabit) {
      // If habit not found, try one more time after a short delay
      await new Promise((resolve) => setTimeout(resolve, 50));
      updatedHabit = useHabitStore
        .getState()
        .habits.find((h) => h.id === habitId);
      if (!updatedHabit) return;
    }

    // Ensure we have the latest habit state by creating a fresh copy
    // This ensures doneToday and other fields are current
    // Force a fresh read from the store to avoid any stale state
    const store = useHabitStore.getState();
    const latestHabit = store.habits.find((h) => h.id === habitId);
    if (!latestHabit) {
      console.error("Habit not found after timer finish");
      return;
    }

    // Create a fresh copy and ensure doneToday is false if counter hasn't reached frequency
    // This allows completion via timer even if doneToday was previously true
    const frequencyNumber = numberTranslater[latestHabit.frequency[0]];
    const freshHabit = {
      ...latestHabit,
      // Reset doneToday to false if counter hasn't reached frequency
      // This ensures completion via timer will persist
      doneToday:
        latestHabit.counter >= frequencyNumber ? latestHabit.doneToday : false,
    };

    // Debug: Log the habit state before completion
    console.log("Completing habit via timer:", {
      id: freshHabit.id,
      doneToday: freshHabit.doneToday,
      counter: freshHabit.counter,
      frequencyNumber,
      timerElapsed: elapsedMs,
    });

    // Complete the habit - this will handle counter, streak, and updateHabitLog (increments count)
    await completeHabit(freshHabit);

    // Update the habit log entry with the timer duration WITHOUT incrementing count again
    // Wait a bit to ensure completeHabit has finished updating the store
    await new Promise((resolve) => setTimeout(resolve, 10));
    await logDuration(habitId, todayKey(nowDate()), elapsedMs);
    resetTimer(habitId);
  };

  const handleHide = () => {
    showFloatingTimer();
    onHide();
    // Close the timer dialog in store
    useTimerStore.getState().closeTimerDialog();
  };

  return (
    <div className="flex justify-end gap-2 pt-4">
      {timer && <Button onClick={handleHide}>Hide</Button>}
      {timer && (
        <Button
          onClick={handleFinish}
          variant={timer.status === "idle" ? "outline" : "default"}
        >
          Complete
        </Button>
      )}
      {timer && (
        <Button
          onClick={() => resetTimer(habitId)}
          variant={timer.status === "idle" ? "outline" : "default"}
        >
          <Square />
        </Button>
      )}

      {!timer && (
        <Button onClick={handleStart}>
          <Play />
        </Button>
      )}
      {timer?.status === "idle" && (
        <Button onClick={handleStart}>
          <Play />
        </Button>
      )}
      {timer?.status === "running" && (
        <Button onClick={() => pauseTimer(habitId)}>
          <Pause />
        </Button>
      )}
      {timer?.status === "paused" && (
        <Button onClick={() => resumeTimer(habitId)}>
          <Play />
        </Button>
      )}
      {timer?.status === "finished" && (
        <Button onClick={handleStart}>
          <RotateCcw />
        </Button>
      )}
    </div>
  );
}
