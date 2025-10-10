export type Habit = {
    id: string;
    title: string;
    description: string;
    frequency: ["" | "one" | "two" | "three", "" | "day" | "week" | "month"];
    schedule: Date[];
    counter: number;
    streak: number;
    lastCompleted: number;
    doneToday: boolean;
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
    schedule: []
  };

  export type HabitLog = {
    [habitId: string]: {
      [date: string]: number;
    };
  };
  export const numberTranslater: Record<string, number> = {
    "one": 1,
    "two": 2,
    "three": 3
  }

  export const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    
  export const periodTranslater: Record<string, number[] | string[] | string> = {
    "day": 'day',
    "week": weekdays,
    "month": Array.from({length: 31}, (_, i) => (i+1))
  }
  
  export const getWeekDay = (day: Date | string) => {
    const dateObj = typeof day === 'string' ? new Date(day) : day;
    return weekdays[dateObj.getDay()];
  }
  export const getWeekdayNumber = (day: Date | string) => {
    const dateObj = typeof day === 'string' ? new Date(day) : day;  
    return dateObj.getDay();
  }