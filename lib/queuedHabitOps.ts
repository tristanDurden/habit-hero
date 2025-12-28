import { Habit } from "./types";

export type HabitOpPayloadMap = {
  HABIT_CREATE: Habit;
  HABIT_UPDATE: Habit;
  HABIT_DELETE: { id: string };

  HABIT_LOG: {
    habitId: string;
    date: string;
    count: number;
    duration?: number;
  };

  HABIT_UPDATE_WITH_LOG: {
    habit: Habit;
    logCompletion: {
      date: string;
      count: number;
      duration?: number;
    };
  };
};

export type HabitQueuedOp = {
  [K in keyof HabitOpPayloadMap]: {
    type: K;
    payload: HabitOpPayloadMap[K];
    timestamp: string;
  }
}[keyof HabitOpPayloadMap];
