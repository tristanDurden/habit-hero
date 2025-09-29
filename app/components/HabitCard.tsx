"use client";
import React, { useEffect } from "react";
import useHabitStore from "../habitStore";
import { Habit, numberTranslater } from "@/lib/types";
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
  keepStreak,
  msUntilMidnight,
} from "@/lib/timeCounter";

import { Progress } from "@/components/ui/progress";

type Props = {
  habit: Habit;
};

export default function HabitCard({ habit }: Props) {
  const removeHabit = useHabitStore((state) => state.removeHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  //const updateHabitLog = useHabitStore((state) => state.updateHabitLog);

  //timing is not good enough! need to calibrate
  const isTimePassed: boolean = isReadyToComplete(habit);
  // if (isTimePassed && habit.doneToday) {
  //   //console.log("time passed");
  // }
  const frequencyNumber = numberTranslater[habit.frequency[0]];
  //progress variable
  const progress =
    habit.frequency[1] === "day"
      ? (habit.counter * 100) / frequencyNumber
      : (habit.counter * 100) / 1;

  //  checking if time passed to complete habit
  useEffect(() => {
    if (isTimePassed) {
      updateHabit({
        ...habit,
        counter: 0,
        doneToday: false,
      });
    }

    const timer = setTimeout(() => {
      updateHabit({
        ...habit,
        counter: 0,
        doneToday: false,
      });
    }, msUntilMidnight);

    console.log(timer, msUntilMidnight / (1000 * 60));

    return () => clearTimeout(timer);
  }, [habit.lastCompleted]);

  // click on the complete button
  const handleCompleted = () => {
    if (habit.doneToday === false) {
      if (habit.frequency[1] === "day") {
        if (habit.counter + 1 < frequencyNumber) {
          updateHabit({
            ...habit,
            lastCompleted: Date.now(),
            counter: habit.counter + 1,
          });
        } else {
          updateHabit({
            ...habit,
            streak: keepStreak(habit) ? habit.streak + 1 : 1,
            doneToday: true,
            counter: habit.counter + 1,
          });
        }
      } else if (habit.frequency[1] === "week") {
        updateHabit({
          ...habit,
          //streak is not calculating right
          streak: keepStreak(habit) ? habit.streak + 1 : 1,
          lastCompleted: Date.now(),
          counter: habit.counter + 1,
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
            <HabitDialog mode="update" habit={habit} />

            <button
              onClick={() => removeHabit(habit.id)}
              className="cursor-pointer"
            >
              <Trash size={20} />
            </button>
          </CardAction>
        </CardHeader>
        <CardContent className="border-2 border-slate-500">
          <p>id:{habit.id}</p>
          <p>
            Frequency: {habit.frequency[0]} per {habit.frequency[1]}
          </p>
          <p>Yor counter of times: {habit.counter} </p>
          <p>Your streak: {habit.streak}</p>
          <p>LastCompleted: {habit.lastCompleted}</p>
          <p>is time pased to do {isTimePassed ? "yes" : "no"} </p>
          <p>
            {habit.doneToday
              ? "You ve already done it for today"
              : "Your task is waiting for making it today"}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            onClick={handleCompleted}
            variant={habit.doneToday ? "ghost" : "default"}
            className=""
          >
            {habit.doneToday ? "Completed!" : `Press to complete!`}
          </Button>
          <Progress value={progress} className="w-[75%]" />
        </CardFooter>
      </Card>
    </div>
  );
}
