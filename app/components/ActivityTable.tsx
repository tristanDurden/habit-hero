import React from "react";
import useHabitStore from "../habitStore";
import { todayKey } from "@/lib/timeCounter";
import {
  activityReducerDurationForDay,
  activityReducerCounterForDay,
} from "@/lib/habitlogFunc";

export default function ActivityTable() {
  //  store consts
  const habitLog = useHabitStore((state) => state.habitLog);
  //const habits = useHabitStore((state) => state.habits);

  // consts for time and so on
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const todayString = todayKey(now);
  const yesterdayString = todayKey(yesterday);
  //vars
  const counterForToday = activityReducerCounterForDay(habitLog, todayString);
  const counterForYesterday = activityReducerCounterForDay(
    habitLog,
    yesterdayString
  );
  const durationForToday =
    activityReducerDurationForDay(habitLog, todayString) / 1000;

  return (
    <div className="mt-6 items-center justify-center text-center">
      <h1>ActivityTable</h1>
      <div>
        <h1>Today</h1>
        <p>You ve completed your tasks {counterForToday} times</p>
        <p>Your total time spend: {durationForToday} seconds </p>
      </div>
      <div>
        <h1>Yesterday</h1>
        <p>You ve completed your tasks {counterForYesterday} times</p>
      </div>
    </div>
  );
}
