import { getWeekDay, Habit, numberTranslater, periodTranslater } from "./types";

export const now = Date.now();
export const nowDate = new Date(now);
export const DAYDURATION = 24 * 60 * 60 * 1000;
const midnight = new Date().setHours(0, 0, 0, 0);
const nextMidnight = DAYDURATION + midnight;

//const
export const msUntilMidnight = nextMidnight - now;

export default function isReadyToComplete(habit: Habit): boolean {
  const lastCompleted = habit.lastCompleted;
  const frequencyString = habit.frequency[0];
  const frequencyTime = habit.frequency[1];
  const schedule: Date[] = habit.schedule;

  //console.log(lastCompleted, midnight);

  const counter = habit.counter;
  const frequencyNumber = numberTranslater[frequencyString];
  const timePeriod = periodTranslater[frequencyTime];

  //  cases of different time periods
  //first case when it is day! or typeof timePeriod === "string"
  if (frequencyTime === "day") {
    if (midnight > lastCompleted && counter + 1 < frequencyNumber) {
      return true;
    } else {
      return false;
    }
    // second case it s for week
  } else if (frequencyTime === "week") {
    const scheduleWeek = schedule.map((item) => getWeekDay(item));

    if (
      midnight > lastCompleted &&
      scheduleWeek.includes(getWeekDay(nowDate))
    ) {
      console.log("week", getWeekDay(nowDate));
      return true;
    } else {
      return false;
    }
    //  third for month
  } else {
    return true;
  }
}
// needs to check for week and month!
export function keepStreak(habit: Habit): boolean {
  const lastCompleted = habit.lastCompleted;
  if (midnight - lastCompleted < DAYDURATION) {
    return true;
  } else {
    return false;
  }
}
