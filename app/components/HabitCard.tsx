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
import isReadyToComplete, {
  howManyDaysLeftFromLast,
  keepDayStreak,
  keepWeekStreak,
  msUntilNextScheduledDay,
  now,
  nowDate,
  todayKey,
} from "@/lib/timeCounter";

import { Progress } from "@/components/ui/progress";
import { HabitInfo } from "./HabitInfo";
import { v4 as uuidv4 } from "uuid";
import { id } from "date-fns/locale";

type Props = {
  habit: Habit;
};

export default function HabitCard({ habit }: Props) {
  // habitStore functnions
  const removeHabit = useHabitStore((state) => state.removeHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const updateHabitLog = useHabitStore((state) => state.updateHabitLog);

  const isTimePassed: boolean = isReadyToComplete(habit);

  //const
  const lastCompletedDate = new Date(habit.lastCompleted);
  const frequencyNumber = numberTranslater[habit.frequency[0]];
  //progress variable
  const progress =
    habit.frequency[1] === "day"
      ? (habit.counter * 100) / frequencyNumber
      : (habit.counter * 100) / 1;

  //  checking if time passed to complete habit
  useEffect(() => {
    if (isTimePassed) {
      //  alert if habits are waiting for completion
      toast(`You habit - "${habit.title}" - is waiting to be done!`, {
        position: "bottom-center",
        description: `What are you waiting for?`,
      });
      //  update DB
      updateHabit({
        ...habit,
        counter: 0,
        doneToday: false,
      });
    }

    // we should check if habit is for a week or day
    const msUntilNextScheduled = msUntilNextScheduledDay(habit);

    const timer = setTimeout(() => {
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
  const handleDeletion = async (id: string) => {
    removeHabit(id);
    await fetch("/api/habitlog", {
      method: "DELETE",
      headers: { "Cntent-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    await fetch(`/api/habits/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast(`You deleted your "${habit.title}"`, {
      position: "bottom-left",
      description: `I guess we will never know what you made of!`,
    });
  };

  // click on the complete button
  //  update DB
  const handleCompleted = async () => {
    console.log(habit);
    const newCounter = habit.counter + 1;
    const checkFinish = newCounter === frequencyNumber;

    if (habit.doneToday === false) {
      //need to get a seperate function to handle to keep code clean

      // updating the button for day frequency
      if (habit.frequency[1] === "day") {
        //local vars

        console.log("click!");
        updateHabitLog(habit.id, todayKey(nowDate()));
        await fetch("api/habitlog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            habitId: habit.id,
            date: todayKey(nowDate()),
            count: newCounter,
          }),
        });
        await fetch("api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...habit,
            counter: newCounter,
            lastCompleted: now(),
            streak: checkFinish
              ? keepDayStreak(habit)
                ? habit.streak + 1
                : 1
              : habit.streak,
            doneToday: checkFinish ? true : habit.doneToday,
          }),
        });
        updateHabit({
          ...habit,
          counter: newCounter,
          lastCompleted: now(),
          streak: checkFinish
            ? keepDayStreak(habit)
              ? habit.streak + 1
              : 1
            : habit.streak,
          doneToday: checkFinish ? true : habit.doneToday,
        });
      } else if (habit.frequency[1] === "week") {
        updateHabitLog(habit.id, todayKey(nowDate()));
        await fetch("api/habitlog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            habitId: habit.id,
            date: todayKey(nowDate()),
            count: newCounter,
          }),
        });
        await fetch("api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...habit,
            counter: newCounter,
            lastCompleted: now(),
            streak: keepWeekStreak(habit) ? habit.streak + 1 : 1,
            doneToday: true,
          }),
        });
        updateHabit({
          ...habit,
          //streak is  calculating right
          streak: keepWeekStreak(habit) ? habit.streak + 1 : 1,
          lastCompleted: now(),
          counter: newCounter,
          doneToday: true,
        });
      }

      //updateHabitLog(habit.id);
      toast(`You completed your "${habit.title}"`, {
        position: "top-center",
        description: `Great Work!`,
      });
    } else {
      toast(`You ve already completed your "${habit.title} for now"`, {
        position: "top-center",
        description: `Come back later`,
      });
    }
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

            <button
              onClick={() => handleDeletion(habit.id)}
              className="cursor-pointer"
            >
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
            LastCompleted: {lastCompletedDate.toLocaleString()} -{" "}
            {getWeekDay(lastCompletedDate)} -{" "}
            {howManyDaysLeftFromLast(lastCompletedDate, nowDate())}
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
          <Button
            type="submit"
            onClick={handleCompleted}
            variant={habit.doneToday ? "ghost" : "default"}
            className=""
          >
            {habit.doneToday ? "Completed for now!" : `Press to complete!`}
          </Button>
          <Progress value={progress} className="w-[75%]" />
        </CardFooter>
      </Card>
    </div>
  );
}
