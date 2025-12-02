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
  };

  export const AddDefaultHabit: Habit = {
    id: "",
    title: "Enter the title",
    description: "Enter the description of habit",
    frequency: ["", ""] as Habit["frequency"],
    counter: 0,
    streak: 0,
    lastCompleted: Date.now(),
    doneToday: false,
    schedule: [],
    updatedAt: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
  };

  export type HabitLog = {
    [habitId: string]: Array<{date: string, count: number}>;
  };
  export const numberTranslater: Record<string, number> = {
    "one": 1,
    "two": 2,
    "three": 3
  }

  export const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    
  
  export const getWeekDay = (day: Date | string) => {
    const dateObj = typeof day === 'string' ? new Date(day) : day;
    return weekdays[dateObj.getDay()];
  }
  export const getWeekdayNumber = (day: Date | string) => {
    const dateObj = typeof day === 'string' ? new Date(day) : day;  
    return dateObj.getDay();
  }