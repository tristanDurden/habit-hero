import { PomodoroPhase, Timer } from "@/app/types/timer";

export default function assertPomodoroTimer(
    timer: Timer
  ): asserts timer is Timer & {
    phase: PomodoroPhase;
    currentCycle: number;
    config: {
      type: "pomodoro";
      durationMs: number;
      breakDurationMs: number;
      cycles: number;
    };
  } {
    if (
      timer.config.type !== "pomodoro" ||
      timer.phase === undefined ||
      timer.currentCycle === undefined ||
      timer.config.durationMs === undefined ||
      timer.config.breakDurationMs === undefined ||
      timer.config.cycles === undefined
    ) {
      throw new Error("Invalid pomodoro timer state");
    }
  }
  