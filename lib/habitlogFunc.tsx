import { Habit, HabitLog } from "./types";

export function activityReducerForDay(
  habitLog: HabitLog,
  date: string
): number {
  let counter = 0;
  Object.values(habitLog).forEach((habitArray) => {
    habitArray.forEach((entry) => {
      if (date === entry.date) {
        counter += entry.count;
      }
    });
  });
  return counter;
}

export function mapTasksForCalendar(habitLog: HabitLog, habits: Habit[]) {
  const addedLog: { date: string; count: number }[] = [];
  habits.forEach((habit) => {
    const id = habit.id;
    const habitArray = habitLog[id];
    if (!habitArray) return;
    habitArray.forEach((entry) => {
      const exists = addedLog.find((log) => log.date === entry.date);
      if (exists) {
        exists.count += entry.count;
      } else {
        addedLog.push({ ...entry });
      }
    });
  });
  return addedLog;
}
