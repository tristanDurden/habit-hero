"use client";

import { Timer } from "@/app/types/timer";
import { cn } from "@/lib/utils";

type Props = {
  timer: Timer;
};

export default function TimerStatus({ timer }: Props) {
  return (
    <div className="mt-4 rounded-md border bg-muted p-3 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Status</span>
        <span
          className={cn(
            "font-medium capitalize",
            timer.status === "finished" ? "text-green-600" : ""
          )}
        >
          {timer.status}
        </span>
      </div>

      {timer.config.type === "pomodoro" && (
        <>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phase</span>
            <span className="font-medium capitalize">{timer.phase}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Cycle</span>
            <span className="font-medium capitalize">{timer.currentCycle}</span>
          </div>
        </>
      )}

      <div className="flex justify-between">
        <span className="text-muted-foreground">Elapsed</span>
        <span className="font-mono">{Math.floor(timer.elapsedMs / 1000)}s</span>
      </div>

      {timer.remainingMs !== undefined && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Remaining</span>
          <span className="font-mono">
            {Math.max(0, Math.floor(timer.remainingMs / 1000))}s
          </span>
        </div>
      )}
    </div>
  );
}
