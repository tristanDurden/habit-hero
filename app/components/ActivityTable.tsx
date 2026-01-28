import React, { useEffect, useState, useRef } from "react";
import useHabitStore from "../habitStore";
import { nowDate, todayKey } from "@/lib/timeCounter";
import {
  activityReducerDurationForDay,
  activityReducerCounterForDay,
} from "@/lib/habitlogFunc";
import { mergeServerHabitLogToLocal } from "@/lib/onlineFunc";
import { HabitLog as dbHabitLog } from "@prisma/client";
import { dbHabitLogToUi } from "@/lib/dbformatting";

export default function ActivityTable() {
  //  store consts
  const habitLog = useHabitStore((state) => state.habitLog);
  const isOnline = useHabitStore((state) => state.isOnline);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isFirstMount = useRef(true);

  // consts for time and so on
  const now = nowDate();
  const yesterday = nowDate();
  yesterday.setDate(now.getDate() - 1);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOnline) {
        console.log("Offline - using localStorage data");
        return;
      }
      try {
        const response = await fetch("/api/habitlog", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const serverLog: dbHabitLog[] = await response.json();
          if (isFirstMount.current) {
            // Get current local state
            const store = useHabitStore.getState();
            const localLog = store.habitLog;
            const queue = store.queue || [];

            // Merge server data with local data
            const mergedLog = mergeServerHabitLogToLocal(
              serverLog,
              localLog,
              queue
            );

            useHabitStore.setState({ habitLog: mergedLog });
            isFirstMount.current = false;
          } else {
            // On refresh, just replace with server data (online-status handles merging on reconnect)
            const formattedLog = dbHabitLogToUi(serverLog);
            useHabitStore.setState({ habitLog: formattedLog });
          }
        }
      } catch (error) {
        console.log("Failed to fetch habit log:", error);
      }
    };
    fetchData();
  }, [isOnline, refreshTrigger]);

  useEffect(() => {
    const handleHabitLogUpdate = () => {
      setTimeout(() => {
        setRefreshTrigger((prev) => prev + 1);
      }, 300);
    };

    window.addEventListener("habitLogUpdated", handleHabitLogUpdate);
    return () => {
      window.removeEventListener("habitLogUpdated", handleHabitLogUpdate);
    };
  }, []);

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
