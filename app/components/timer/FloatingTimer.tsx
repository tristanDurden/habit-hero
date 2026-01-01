"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Play, X, Maximize2 } from "lucide-react";
import useTimerStore from "../../timerStore";
import useHabitStore from "../../habitStore";
import { useAlarm } from "../../hooks/timer/useAlarm";
import { minutesAndSeconds } from "@/lib/timeFormatting";

export function FloatingTimer() {
  // habit store consts - include finished timers too
  const activeHabit = useHabitStore((s) =>
    s.habits.find(
      (h) =>
        h.timer?.status === "running" ||
        h.timer?.status === "paused" ||
        h.timer?.status === "finished"
    )
  );
  // timer consts
  const floatingVisible = useTimerStore((s) => s.floatingVisible);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const openTimerDialog = useTimerStore((s) => s.openTimerDialog);

  // Floating timer only shows when explicitly set to visible (not automatically)
  const visible = floatingVisible;

  // Stop alarm if timer is restarted (remainingMs > 0)
  const { stop } = useAlarm();
  const remainingMs = activeHabit?.timer?.remainingMs;

  useEffect(() => {
    if (activeHabit?.timer && remainingMs !== undefined && remainingMs > 0) {
      // Timer is running with time remaining, stop any playing alarm
      stop();
    }
  }, [remainingMs, activeHabit?.timer, stop]);

  if (!visible) return null;
  if (!activeHabit || !activeHabit.timer) return null;

  const elapsedFormatted = minutesAndSeconds(activeHabit.timer.elapsedMs);
  const remainingFormatted = minutesAndSeconds(activeHabit.timer.remainingMs);

  const handlePause = () => {
    pauseTimer(activeHabit.id);
  };

  const handleResume = () => {
    resumeTimer(activeHabit.id);
  };

  const handleOpenTimer = () => {
    openTimerDialog(activeHabit.id);
  };

  const handleClose = () => {
    // Open timer dialog instead of just hiding
    openTimerDialog(activeHabit.id);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-64 p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">{activeHabit.title}</span>
          <Button size="icon" variant="ghost" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {activeHabit.timer.status === "finished" ? (
          <div className="text-2xl mt-2 font-mono text-green-600">
            Timer Finished!
          </div>
        ) : (
          <>
            <div className="text-md mt-2 font-mono">
              type: {activeHabit.timer.config.type}
            </div>
            <div className="text-md mt-2 font-mono">
              elapsed: {elapsedFormatted}
            </div>
            {activeHabit.timer.config.type !== "count_up" && (
              <div className="text-md mt-2 font-mono">
                remaining: {remainingFormatted}
              </div>
            )}
            {activeHabit.timer.config.type === "pomodoro" && (
              <div className="text-md mt-2 font-mono">
                current cycle: {activeHabit.timer.currentCycle} /{" "}
                {activeHabit.timer.config.cycles}
                <div className="text-md mt-2 font-mono">
                  phase: {activeHabit.timer.phase}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex gap-2 mt-3">
          <Button onClick={handleOpenTimer} variant="outline" size="sm">
            <Maximize2 className="w-4 h-4 mr-2" />
            Open Timer
          </Button>
          {activeHabit.timer.status === "running" && (
            <Button onClick={handlePause}>
              <Pause />
            </Button>
          )}

          {activeHabit.timer.status === "paused" && (
            <Button onClick={handleResume}>
              <Play />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
