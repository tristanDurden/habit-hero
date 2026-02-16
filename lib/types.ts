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

export type List = {
  id: string;

  name: string;
  description?: string;
  items: ListItem[];

  type: "tasks" | "shopping" | "notes";


  createdAt: number;
  updatedAt: number;

  isArchived: boolean;
}


export type ListItem = {
  id: string;
  listId: string;

  name: string;
  description?: string;

  position: number;

  completed: boolean;

  priority?: "low" | "medium" | "high";

  dueDate?: number | null;

  quantity?: number; // useful for shopping
  unit?: string;     // "kg", "pcs", etc.

  createdAt: number;
  updatedAt: number;
}

export const AddDefaultList: List = {
  id: "",
  name: "Enter the name",
  description: "Enter the description of list",
  type: "tasks",
  createdAt: Math.floor(Date.now() / 1000),
  updatedAt: Math.floor(Date.now() / 1000),
  isArchived: false,
  items: [],
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