import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useHabitStore from "../habitStore";
import { DialogClose } from "@/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Habit } from "@/lib/types";
import { Calendar04 } from "./Calendar";
import { now, nowDate } from "@/lib/timeCounter";
import { useSession } from "next-auth/react";
import { redirect } from "next/dist/server/api-utils";

type Props = {
  habit: Habit;
  mode: "add" | "update";
};

export default function NewHabit({ habit, mode }: Props) {
  //  setForm consts
  const [form, setForm] = useState({
    title: habit.title,
    description: habit.description,
    frequency: habit.frequency,
    doneToday: false,
    schedule: [nowDate()],
  });

  //  session const now needed

  const updateHabit = useHabitStore((state) => state.updateHabit);
  const addHabit = useHabitStore((state) => state.addHabit);

  const inputHabit: Habit = {
    id: mode === "update" ? habit.id : uuidv4(),
    title: form.title,
    description: form.description,
    frequency: form.frequency,
    counter: habit.counter,
    lastCompleted: habit.lastCompleted,
    streak: habit.streak,
    doneToday: mode === "update" ? habit.doneToday : form.doneToday,
    schedule: form.schedule,
  };

  const handleSaveHabit = async () => {
    if (mode === "add") {
      await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inputHabit,
        }),
      });

      addHabit(inputHabit);
      console.log(inputHabit);
      toast(`You ve added "${inputHabit.title}" for your habits list`, {
        description: `Start to acomplish it`,
        position: "top-center",
      });
    } else {
      updateHabit(inputHabit);
      toast(`You ve updated your "${inputHabit.title}" habit`, {
        description: `Proceed to accomplishing your dream`,
        position: "top-center",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleScheduleChange = (schedule: Date[]) => {
    setForm((prev) => ({ ...prev, schedule: schedule }));
  };

  return (
    <div>
      <Card>
        <CardContent className="">
          <div className="grid w-full max-w-sm items-center gap-3 pb-3">
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-3 pb-3">
            <Label htmlFor="description">Description</Label>
            <Input
              type="text"
              id="description"
              name="description"
              onChange={handleChange}
              value={form.description}
            />
          </div>
          {/* Selector of frequencies */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="frequency">
              How often you want to do the excercise
            </Label>
            <div className="flex gap-3">
              <Select
                value={form.frequency[0]}
                onValueChange={(val) => {
                  setForm((prev) => ({
                    ...prev,
                    frequency: [
                      val as Habit["frequency"][0],
                      prev.frequency[1],
                    ],
                  }));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Times per " />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one">Once</SelectItem>
                  <SelectItem value="two">twice</SelectItem>
                  <SelectItem value="three">three</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={form.frequency[1]}
                onValueChange={(val) => {
                  setForm((prev) => ({
                    ...prev,
                    frequency: [
                      prev.frequency[0],
                      val as Habit["frequency"][1],
                    ],
                  }));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* select for week timeperiod */}
            {(form.frequency[1] === "week" ||
              form.frequency[1] === "month") && (
              <Calendar04
                date={now()}
                frequency={form.frequency}
                onSendSchedule={handleScheduleChange}
              />
            )}
            {/* select for month. maybe calendar should be 1 with logic inside */}
            {/* {form.frequency[1] === 'month' && (
              
            )} */}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <DialogClose
            type="submit"
            onClick={handleSaveHabit}
            className="cursor-pointer"
          >
            Save
          </DialogClose>
          <DialogClose className="cursor-pointer">Exit</DialogClose>
        </CardFooter>
      </Card>
    </div>
  );
}
