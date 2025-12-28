// useAlarm.ts
"use client";

// Re-export the alarm functions for use in React components
// The actual implementation is in lib/alarm.ts
import { playAlarm, stopAlarm } from "@/lib/alarm";

export function useAlarm() {
  return {
    play: playAlarm,
    stop: stopAlarm,
  };
}
