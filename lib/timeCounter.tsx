import {
  getWeekDay,
  getWeekdayNumber,
  Habit,
  numberTranslater,
  weekdays,
} from "./types";

//export const now = Date.now();
export const now = () => {
  return Date.now();
};

// Return Unix timestamp in seconds (for database INTEGER fields)
export const nowInSeconds = () => {
  return Math.floor(Date.now() / 1000);
};
export const nowDate = () => {
  return new Date();
};
export const DAYDURATION = 24 * 60 * 60 * 1000;
export const WEEKDURATION = DAYDURATION * 7;
const midnight = () => {
  return new Date().setHours(0, 0, 0, 0);
};
const nextMidnight = DAYDURATION + midnight();

//const
export const msUntilMidnight = nextMidnight - now();

export default function isReadyToComplete(habit: Habit): boolean {
  const lastCompleted = habit.lastCompleted;
  const frequencyString = habit.frequency[0];
  const frequencyTime = habit.frequency[1];
  const schedule: Date[] = habit.schedule;

  //console.log(lastCompleted, midnight);

  const counter = habit.counter;
  const frequencyNumber = numberTranslater[frequencyString];

  //  cases of different time periods
  //first case when it is day! or typeof timePeriod === "string"
  if (frequencyTime === "day") {
    if (midnight() > lastCompleted) {
      return true;
    } else {
      return false;
    }
    // second case it s for week
  } else if (frequencyTime === "week") {
    const scheduleWeek = schedule.map((item) => getWeekDay(item));

    if (
      midnight() > lastCompleted &&
      scheduleWeek.includes(getWeekDay(nowDate()))
    ) {
      return true;
    } else {
      return false;
    }
    //  third for month
  } else {
    return true;
  }
}
// needs to check for  month!
export function keepDayStreak(habit: Habit): boolean {
  const lastCompleted = habit.lastCompleted;
  if (midnight() - lastCompleted < 0) {
    return true;
  } else {
    return false;
  }
}
// here we go for week streak counting
export function keepWeekStreak(habit: Habit): boolean {
  const lastCompleted = habit.lastCompleted;
  if (WEEKDURATION > now() - lastCompleted) {
    return true;
  } else {
    return false;
  }
}

//counting timer for week estimation
export function msUntilNextScheduledDay(habit: Habit): number {
  //if its day
  if (habit.frequency[1] === "day") return msUntilMidnight;
  // const for calculating days until next scheduled day
  const scheduleWeek = habit.schedule.map((item) => getWeekdayNumber(item));
  const todayDayNumber = nowDate().getDay();
  // returning ms until next scheduled day
  let msUntilNextScheduledDay = 0;
  let daysUntilNextScheduledDay = 0;
  // scenario when today is before the first scheduled day
  if (todayDayNumber < scheduleWeek[0]) {
    daysUntilNextScheduledDay = scheduleWeek[0] - todayDayNumber;
  } else if (
    todayDayNumber > scheduleWeek[0] &&
    todayDayNumber < scheduleWeek[1]
  ) {
    daysUntilNextScheduledDay = scheduleWeek[1] - todayDayNumber;
  } else {
    daysUntilNextScheduledDay = scheduleWeek[0] + 7 - todayDayNumber;
  }
  msUntilNextScheduledDay =
    daysUntilNextScheduledDay === 1
      ? msUntilMidnight
      : (daysUntilNextScheduledDay - 1) * DAYDURATION + msUntilMidnight;
  return msUntilNextScheduledDay;
}

export function howManyDaysLeftFromLast(last: Date, now: Date): string {
  // consts
  const lastDay = last.getDate();
  const nowDate = now.getDate();
  //var
  let difference: number = 0;
  let message: string = "";
  // case if month changed
  if (lastDay > nowDate) {
    difference = lastDay - nowDate;
  } else {
    difference = nowDate - lastDay;
  }
  if (difference === 0) {
    message = "today";
  } else if (difference === 1) {
    message = "yesterday";
  } else {
    message = `${difference} days ago`;
  }

  return message;
}

// Helper: format date as YYYY-MM-DD
export const todayKey = (date: Date) => date.toISOString().split("T")[0];
