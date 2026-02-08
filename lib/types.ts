import { Timer } from "@/app/types/timer";

export type frequencyNumber = "" | "one" | "two" | "three";
export type frequencyUnit = "" | "day" | "week" | "month";
export type frequencyTuple = [frequencyNumber, frequencyUnit];

export type Habit = {
  id: string;
  title: string;
  description: string;
  frequency: frequencyTuple;
  schedule: Date[];
  counter: number;
  streak: number;
  lastCompleted: number;
  doneToday: boolean;
  updatedAt: number;
  timer?: Timer;
};

export const AddDefaultHabit: Habit = {
  id: "",
  title: "Enter the title",
  description: "Enter the description of habit",
  frequency: ["", ""] as frequencyTuple,
  counter: 0,
  streak: 0,
  lastCompleted: Date.now(),
  doneToday: false,
  schedule: [],
  updatedAt: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
};

export type HabitLog = {
  [habitId: string]: Array<{ date: string, count: number, duration: number }>;
};

export type Folder = {
  id: string;
  name: string;
  habitIds: string[]; // Store only IDs, not full habit objects
  updatedAt: number;
}

export const numberTranslater: Record<string, number> = {
  "one": 1,
  "two": 2,
  "three": 3
}

export const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Shared helper: normalise a Date | string input into a Date object
const toDate = (day: Date | string): Date =>
  typeof day === 'string' ? new Date(day) : day;

export const getWeekDay = (day: Date | string) =>
  weekdays[toDate(day).getDay()];

export const getWeekdayNumber = (day: Date | string) =>
  toDate(day).getDay();

export const getMonthDay = (day: Date | string): number =>
  toDate(day).getDate();