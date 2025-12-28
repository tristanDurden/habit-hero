import { create } from "zustand";
import {  TimerConfig  } from "./types/timer";

import useHabitStore from "./habitStore";
import { now, nowDate, todayKey } from "@/lib/timeCounter";
import assertPomodoroTimer from "@/lib/assert";
import { Hamburger } from "lucide-react";
import { playAlarm, stopAlarm } from "@/lib/alarm";



type TimerStore = {
    startTimer: (id: string, config: TimerConfig) => void;
    pauseTimer: (id: string) => void;
    resumeTimer: (id: string) => void;
    resetTimer: (id: string) => void;
    tick: (id: string, deltaMs: number) => void;
    completeCycle: (id: string) => void;
    finishTimer: (habitId: string) => void;
    // floating timer
    floatingVisible: boolean;
    showFloatingTimer: () => void;
    hideFloatingTimer: () => void;
    // timer dialog
    openTimerDialog: (habitId: string) => void;
    closeTimerDialog: () => void;
    openTimerDialogId: string | null;
}


const useTimerStore = create<TimerStore>()(
    (set, get) => ({
        startTimer: (habitId: string, config: TimerConfig) => {
            useHabitStore.getState().setTimer(habitId, {
                config: config,
                status: "running",
                startedAt: now(),
                phase: config.type === "pomodoro" ? "work" : undefined,
                pausedAt: undefined,
                elapsedMs: 0,
                remainingMs: config.type === "count_up" ? undefined : config.durationMs,
                currentCycle: config.type === "pomodoro" ? 1 : undefined
            })
        },
        pauseTimer: (habitId: string) => {
          const timer = useHabitStore
            .getState()
            .habits.find(h => h.id === habitId)?.timer;
        
          if (!timer || timer.status !== "running") return;
        
          useHabitStore.getState().updateTimer(habitId, {
            status: "paused",
            pausedAt: now(),
            elapsedMs: timer.elapsedMs,
            remainingMs: timer.remainingMs,
          });
        },
        resumeTimer: (habitId: string) => {
            useHabitStore.getState().updateTimer(habitId, {
                status: "running",
                pausedAt: undefined,
                startedAt: now(),
            })
        },
        resetTimer: (habitId: string) => {
            const habit = useHabitStore.getState().habits.find((h) => h.id === habitId);
            if (!habit || !habit.timer) return;

            // Stop alarm when timer is reset
            stopAlarm();

            useHabitStore.getState().setTimer(habitId, {
                config: habit.timer.config,
                status: "idle",
                startedAt: undefined,
                phase: undefined,
                elapsedMs: 0,
                pausedAt: undefined,
                remainingMs: habit.timer.config.type === "count_up" ? undefined: habit.timer.config.durationMs,
                currentCycle: habit.timer.config.type === "pomodoro" ? 1 : undefined
            });
        },
        tick: (habitId: string, deltaMs: number) => {
            const habit = useHabitStore.getState().habits.find(h => h.id === habitId);
            if (!habit?.timer || habit.timer.status !== "running") return;
          
            const timer = habit.timer;
            const elapsedMs = timer.elapsedMs + deltaMs;
            
            // For pomodoro, use break duration when in break phase, otherwise use work duration
            let durationMs = timer.config.durationMs;
            if (timer.config.type === "pomodoro" && timer.phase === "break") {
              durationMs = timer.config.breakDurationMs;
            }
          
            const remainingMs =
              durationMs !== undefined
                ? Math.max(durationMs - elapsedMs, 0)
                : undefined;
          
            useHabitStore.getState().updateTimer(habitId, {
              elapsedMs,
              remainingMs,
            });
          
            if (remainingMs !== 0) return;
          
            if (timer.config.type === "pomodoro") {
              get().completeCycle(habitId);
            } else {
              get().finishTimer(habitId);
            }
          },
          
          completeCycle: (habitId: string) => {
            const habit = useHabitStore.getState().habits.find(h => h.id === habitId);
            if (!habit?.timer) return;
          
            const timer = habit.timer;
            assertPomodoroTimer(timer);
          
            if (timer.phase === "work") {
              // Work cycle ending - play alarm
              
              if (timer.currentCycle >= timer.config.cycles) {
                // All cycles complete, finish timer
                get().finishTimer(habitId);
                return;
              }
          
              // Update timer state first
              useHabitStore.getState().updateTimer(habitId, {
                phase: "break",
                elapsedMs: 0,
                remainingMs: timer.config.breakDurationMs,
                startedAt: now(),
                pausedAt: undefined,
              });
              
              // Play alarm after state update
              console.log("Pomodoro: Break ending, work starting, playing alarm");
              playAlarm();
              
          
            } else {
              // Break ending, work cycle starting - play alarm
              
              // Update timer state first
              useHabitStore.getState().updateTimer(habitId, {
                phase: "work",
                currentCycle: timer.currentCycle + 1,
                elapsedMs: 0,
                remainingMs: timer.config.durationMs,
                startedAt: now(),
                pausedAt: undefined,
              });
              
              // Play alarm after state update
              console.log("Pomodoro: Work cycle starting, playing alarm");
              playAlarm();
            }
          },
          
        finishTimer: (habitId: string) => {
            const habit = useHabitStore.getState().habits.find((h) => h.id === habitId);
            if (!habit || !habit.timer) return;
            
            // Play alarm for countdown timers
            if (habit.timer.config.type === "count_down") {
                playAlarm();
            }
            
            // Just update timer status - let completeHabit handle the habit log update
            // to avoid double-incrementing the count
            useHabitStore.getState().updateTimer(habitId,{
                status: "finished",
                startedAt: undefined
            });
            
            // Show floating timer when timer finishes only if modal is CLOSED
            // If modal is open, it will remain open (don't show floating timer)
            const state = get();
            if (state.openTimerDialogId !== habitId) {
                // Modal is closed, show floating timer
                state.showFloatingTimer();
            }
            // If modal is open, it stays open - no need to show floating timer
        },
        // floating declaration
        floatingVisible: false,
        showFloatingTimer: () => set({floatingVisible: true}),
        hideFloatingTimer: () => set({floatingVisible: false}),
        // timer dialog
        openTimerDialogId: null,
        openTimerDialog: (habitId: string) => set({ openTimerDialogId: habitId, floatingVisible: false }),
        closeTimerDialog: () => set({ openTimerDialogId: null }),

    })
);
export default useTimerStore;