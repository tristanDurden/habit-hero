import {
  getMonthDay,
  getWeekDay,
  getWeekdayNumber,
  Habit,
} from "./types";

export const now = () => Date.now();

// Return Unix timestamp in seconds (for database INTEGER fields)
export const nowInSeconds = () => Math.floor(Date.now() / 1000);

export const nowDate = () => new Date();
export const DAYDURATION = 24 * 60 * 60 * 1000;
export const WEEKDURATION = DAYDURATION * 7;
export const MONTHDURATION = DAYDURATION * 31;
const midnight = () => {
  return new Date().setHours(0, 0, 0, 0);
};

// Must be a function — if calculated once at module load it goes stale
export const msUntilMidnight = () => {
  const nextMidnight = midnight() + DAYDURATION;
  return nextMidnight - now();
};

export default function isReadyToComplete(habit: Habit): boolean {
  const { lastCompleted, frequency, schedule } = habit;
  const frequencyTime = frequency[1];
  const isPastMidnight = midnight() > lastCompleted;

  if (frequencyTime === "day") {
    return isPastMidnight;
  }

  if (frequencyTime === "week") {
    const scheduledWeekdays = schedule.map((item) => getWeekDay(item));
    return isPastMidnight && scheduledWeekdays.includes(getWeekDay(nowDate()));
  }

  if (frequencyTime === "month") {
    const scheduledMonthDays = schedule.map((item) => getMonthDay(item));
    return isPastMidnight && scheduledMonthDays.includes(getMonthDay(nowDate()));
  }

  return true;
}
// Keep the daily streak if lastCompleted is no more than one day before today's midnight
export function keepDayStreak(habit: Habit): boolean {
  return midnight() - habit.lastCompleted <= DAYDURATION;
}

// Keep the weekly streak if last completion was within 7 days
export function keepWeekStreak(habit: Habit): boolean {
  return now() - habit.lastCompleted < WEEKDURATION;
}

// Keep the monthly streak if last completion was within 31 days
export function keepMonthStreak(habit: Habit): boolean {
  return now() - habit.lastCompleted < MONTHDURATION;
}

// Calculate ms until the next scheduled completion window
export function msUntilNextScheduledDay(habit: Habit): number {
  if (habit.frequency[1] === "day") return msUntilMidnight();

  // week logic
  if (habit.frequency[1] === "week") {
    const scheduleWeek = habit.schedule.map((item) => getWeekdayNumber(item));
    const todayDayNumber = nowDate().getDay();

    let daysUntilNext: number;
    if (todayDayNumber < scheduleWeek[0]) {
      daysUntilNext = scheduleWeek[0] - todayDayNumber;
    } else if (
      todayDayNumber > scheduleWeek[0] &&
      todayDayNumber < scheduleWeek[1]
    ) {
      daysUntilNext = scheduleWeek[1] - todayDayNumber;
    } else {
      daysUntilNext = scheduleWeek[0] + 7 - todayDayNumber;
    }

    return daysUntilNext === 1
      ? msUntilMidnight()
      : (daysUntilNext - 1) * DAYDURATION + msUntilMidnight();
  }

  // month logic
  if (habit.frequency[1] === "month") {
    const scheduledDays = habit.schedule
      .map((item) => getMonthDay(item))
      .sort((a, b) => a - b);
    const today = nowDate();
    const todayDayOfMonth = today.getDate();

    // Find the next scheduled day in the current month
    const nextDayThisMonth = scheduledDays.find(
      (day) => day > todayDayOfMonth
    );

    let daysUntilNext: number;

    if (nextDayThisMonth !== undefined) {
      daysUntilNext = nextDayThisMonth - todayDayOfMonth;
    } else {
      // Wrap to next month - find the first scheduled day
      const daysInCurrentMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getDate();
      const remainingDaysThisMonth = daysInCurrentMonth - todayDayOfMonth;
      const firstScheduledDay = scheduledDays[0];
      daysUntilNext = remainingDaysThisMonth + firstScheduledDay;
    }

    return daysUntilNext === 1
      ? msUntilMidnight()
      : (daysUntilNext - 1) * DAYDURATION + msUntilMidnight();
  }

  // fallback
  return msUntilMidnight();
}

export function howManyDaysLeftFromLast(last: Date, now: Date): string {
  const difference = Math.abs(now.getDate() - last.getDate());

  if (difference === 0) return "Today";
  if (difference === 1) return "Yesterday";
  return `${difference} days ago`;
}

// Helper: format date as YYYY-MM-DD in the user's LOCAL timezone
// (toISOString() would return UTC, which can be a different day)
export const todayKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
