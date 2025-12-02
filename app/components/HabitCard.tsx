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
import { useOnlineStatus } from "../providers/online-status";

type Props = {
  habit: Habit;
};

export default function HabitCard({ habit }: Props) {
  //online const
  const { isOnline } = useOnlineStatus();
  // habitStore functnions
  const removeHabit = useHabitStore((state) => state.removeHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const updateHabitLog = useHabitStore((state) => state.updateHabitLog);
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
  const handleDeletion = async (id: string) => {
    if (isOnline) {
      // If online: call API, then remove from store
      try {
        const response1 = await fetch(`/api/habits/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const response2 = await fetch("/api/habitlog", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habitId: id }),
        });
        if (!response1.ok || !response2.ok) {
          throw new Error("Failed to delete habit");
        }
      } catch {
        toast.error("Failed to delete habit", {
          description: "Please try again later",
          position: "top-center",
        });
        return;
      }
    } else {
      pushQueue({
        type: "DELETE",
        payload: { id: id },
        timestamp: nowDate().toISOString(),
      });
    }
    removeHabit(id);

    toast(`You deleted your "${habit.title}"`, {
      position: "bottom-left",
      description: `I guess we will never know what you made of!`,
    });
    // Dispatch custom event to trigger refetch in dashboard
    window.dispatchEvent(new CustomEvent("habitUpdated"));
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
        const updatedHabit: Habit = {
          ...habit,
          counter: newCounter,
          lastCompleted: now(),
          streak: checkFinish
            ? keepDayStreak(habit)
              ? habit.streak + 1
              : 1
            : habit.streak,
          doneToday: checkFinish ? true : habit.doneToday,
        };
        //checking for online
        if (isOnline) {
          try {
            const response1 = await fetch("/api/habits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedHabit),
            });
            const response2 = await fetch("/api/habitlog", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                habitId: habit.id,
                date: todayKey(nowDate()),
                count: newCounter,
              }),
            });
            if (!response1.ok || !response2.ok) {
              throw new Error("Update failed");
            }
          } catch {
            toast.error("Failed to update habit", {
              description: "Please try again later",
              position: "top-center",
            });
            return;
          }
        } else {
          //have to push to jobs for updating the habit db and habitlog db
          pushQueue({
            type: "UPDATE",
            payload: { ...updatedHabit },
            timestamp: nowDate().toISOString(),
          });
          pushQueue({
            type: "LOGGING",
            payload: {
              habitId: updatedHabit.id,
              date: todayKey(nowDate()),
              count: updatedHabit.counter,
            },
            timestamp: nowDate().toISOString(),
          });
        }
        console.log("click!");
        updateHabitLog(habit.id, todayKey(nowDate()));
        updateHabit(updatedHabit);
        // Dispatch custom event to trigger refetch in dashboard
        window.dispatchEvent(new CustomEvent("habitUpdated"));
        // WEEK LOGIC
      } else if (habit.frequency[1] === "week") {
        const updatedHabit: Habit = {
          ...habit,
          counter: newCounter,
          lastCompleted: now(),
          streak: keepWeekStreak(habit) ? habit.streak + 1 : 1,
          doneToday: true,
        };
        if (isOnline) {
          try {
            const response1 = await fetch("/api/habitlog", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                habitId: habit.id,
                date: todayKey(nowDate()),
                count: newCounter,
              }),
            });
            const response2 = await fetch("/api/habits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedHabit),
            });
            if (!response1.ok || !response2.ok) {
              throw new Error("Updating failed");
            }
          } catch {
            toast.error("Failed to update habit", {
              description: "Please try again later",
              position: "top-center",
            });
            return;
          }
        } else {
          pushQueue({
            type: "UPDATE",
            payload: { ...updatedHabit },
            timestamp: nowDate().toISOString(),
          });
          pushQueue({
            type: "LOGGING",
            payload: {
              habitId: updatedHabit.id,
              date: todayKey(nowDate()),
              count: updatedHabit.counter,
            },
            timestamp: nowDate().toISOString(),
          });
        }
        updateHabitLog(habit.id, todayKey(nowDate()));
        updateHabit(updatedHabit);
      }
      toast(`You completed your "${habit.title}"`, {
        position: "top-center",
        description: `Great Work!`,
      });
      // Dispatch custom event to trigger refetch in dashboard
      window.dispatchEvent(new CustomEvent("habitUpdated"));
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
