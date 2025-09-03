import { create } from "zustand";

export type Habit = {
  id: number;
  title: string;
  description: string;
  frequency: string;
  streak: number;
  lastCompleted: string;
  doneToday: boolean;
};

type HabitState = {
  habits: Habit[];
};
type HabitActions = {
  addHabit: (habit: Habit) => void;
  removeHabit: (id: number) => void;
  updateHabit: (habit: Habit) => void;
};
type HabitStore = HabitState & HabitActions;

const useHabitStore = create<HabitStore>()((set) => ({
  habits: [
    {
      id: 1,
      title: "test habit",
      description: "description of test habit",
      frequency: "1 per day",
      streak: 0,
      lastCompleted: "never",
      doneToday: false,
    },
  ],
  addHabit: (habit: Habit) =>
    set((state) => ({ habits: [...state.habits, habit] })),
  removeHabit: (id: number) =>
    set((state) => ({
      habits: state.habits.filter((habit) => habit.id !== id),
    })),
  updateHabit: (habit: Habit) =>
    set((state) => ({
      habits: state.habits.map((h) => (h.id === habit.id ? habit : h)),
    })),
}));
export default useHabitStore;
