export type TimerType = "count_up" | "count_down" | "pomodoro";
export type TimerStatus = "idle" | "running" | "paused" | "finished";
export type PomodoroPhase = "work" | "break";
export type TimerConfig = {
    type: TimerType;
    durationMs?: number;
    breakDurationMs?: number;
    cycles?: number;
}

export type Timer = {
    status: TimerStatus;
    phase?: PomodoroPhase;
    config: TimerConfig;
    startedAt?: number;
    pausedAt?: number;
    elapsedMs: number;
    remainingMs: number | undefined;
    currentCycle?: number;
}

export type TimerConfigForm = {
    type: TimerType;
    durationMin?: number;
    breakDurationMin?: number;
    cycles?: number;
}
export type FloatingTimerUi = {
    visible: boolean
}