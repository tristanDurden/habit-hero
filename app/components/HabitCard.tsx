"use client";
import React, { useEffect } from "react";
import useHabitStore from "../habitStore";
import { getWeekDay, Habit, numberTranslater } from "@/lib/types";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash } from "lucide-react";
import HabitDialog from "./HabitDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Timer } from "./Timer";
import isReadyToComplete, {
  howManyDaysLeftFromLast,
  msUntilNextScheduledDay,
  nowDate,
} from "@/lib/timeCounter";

import { Progress } from "@/components/ui/progress";
import { HabitInfo } from "./HabitInfo";
import { useOnlineStatus } from "../providers/online-status";
import { useHabitCompletion } from "../hooks/habits/useHabitCompletion";
import { useHabitDeletion } from "../hooks/habits/useHabitDeletion";

type Props = {
  habit: Habit;
};

export default function HabitCard({ habit }: Props) {
  // hooks consts
  const completeHabit = useHabitCompletion();
  const deleteHabit = useHabitDeletion();

  //online const
  const { isOnline } = useOnlineStatus();
  // habitStore functnions
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const pushQueue = useHabitStore((state) => state.pushQueue);

  const isTimePassed: boolean = isReadyToComplete(habit);

  //const
  const lastCompletedDate = habit.lastCompleted
    ? new Date(habit.lastCompleted)
    : new Date();
  const frequencyNumber = numberTranslater[habit.frequency[0]];
  //progress variable
  const progress =
    habit.frequency[1] === "day"
      ? (habit.counter * 100) / frequencyNumber
      : (habit.counter * 100) / 1;

  //  checking if time passed to complete habit
  useEffect(() => {
    //fetch function for inside useEffect usage.
    const fetchData = async () => {
      try {
        const response = await fetch("/api/habits/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...habit,
            counter: 0,
            doneToday: false,
          }),
        });
        if (!response.ok) {
          throw new Error(`Http error is: ${response.status}`);
        }
      } catch (err: unknown) {
        console.log("uknown error: ", err);
      }
    };
    // start from checking is time passed already
    if (isTimePassed) {
      //  alert if habits are waiting for completion
      toast(`You habit - "${habit.title}" - is waiting to be done!`, {
        position: "bottom-center",
        description: `What are you waiting for?`,
      });

      if (isOnline) {
        fetchData();
      } else {
        pushQueue({
          type: "UPDATE",
          payload: {
            ...habit,
            counter: 0,
            doneToday: false,
          },
          timestamp: nowDate().toISOString(),
        });
      }
      updateHabit({
        ...habit,
        counter: 0,
        doneToday: false,
      });
    }

    // we should check if habit is for a week or day
    const msUntilNextScheduled = msUntilNextScheduledDay(habit);

    const timer = setTimeout(() => {
      if (isOnline) {
        fetchData();
      } else {
        pushQueue({
          type: "UPDATE",
          payload: {
            ...habit,
            counter: 0,
            doneToday: false,
          },
          timestamp: nowDate().toISOString(),
        });
      }
      updateHabit({
        ...habit,
        counter: 0,
        doneToday: false,
      });
    }, msUntilNextScheduled);

    console.log(timer, msUntilNextScheduled / (1000 * 60));

    return () => clearTimeout(timer);
  }, [habit.lastCompleted]);

  // handle deletion of habit
  const handleDeletion = () => {
    deleteHabit(habit.id);
  };

  // click on the complete button
  const handleCompleted = () => {
    completeHabit(habit);
  };

  return (
    <div className="">
      <Card className="w-full max-w-xs">
        <CardHeader>
          <CardTitle>{habit.title}</CardTitle>
          <CardDescription>{habit.description}</CardDescription>
          <CardAction className="flex gap-2 items-center justify-center">
            <HabitInfo habit={habit} />
            <HabitDialog mode="update" habit={habit} />

            <button onClick={handleDeletion} className="cursor-pointer">
              <Trash size={20} />
            </button>
          </CardAction>
        </CardHeader>
        <CardContent className="border-2 border-slate-500">
          <p>
            Frequency: {habit.frequency[0]} per {habit.frequency[1]}
          </p>
          <p>Your streak: {habit.streak}</p>

          <p>
            LastCompleted:{" "}
            {/* Need to add createdAt parameter to db and store and type to control that with ease and accuracy */}
            {/* or just use habitlog query. if there is no result so it s never completed */}
            {!useHabitStore.getState().habitLog[habit.id] ? (
              "never completed"
            ) : (
              <>
                {lastCompletedDate.toLocaleString()} -{" "}
                {getWeekDay(lastCompletedDate)} -{" "}
                {howManyDaysLeftFromLast(lastCompletedDate, nowDate())}
              </>
            )}
          </p>
          {habit.frequency[1] === "week" && (
            <>
              <p>Schedule:</p>
              {habit.schedule.length > 0 &&
                habit.schedule.map((item, id) => (
                  <p key={id}>{getWeekDay(item)}</p>
                ))}
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <div className="grid grid-cols-6 gap-1">
            <Button
              type="submit"
              onClick={handleCompleted}
              variant={habit.doneToday ? "ghost" : "default"}
              className="col-span-5"
            >
              {habit.doneToday ? "Completed for now!" : `Press to complete!`}
            </Button>
            <Timer />
          </div>
          <Progress value={progress} className="w-[75%]" />
        </CardFooter>
      </Card>
    </div>
  );
}
