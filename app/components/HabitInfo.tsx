"use client";

import * as React from "react";

import { useMediaQuery } from "react-responsive";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import CalendarHeatmap from "react-calendar-heatmap";
import useHabitStore from "../habitStore";
import { Habit } from "@/lib/types";
import { CalendarDays } from "lucide-react";

type Props = {
  habit: Habit;
};

export function HabitInfo({ habit }: Props) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });

  const now = new Date();
  now.setMonth(now.getMonth() - 6);
  const startDate = now;

  //  store consts
  const habitLog = useHabitStore((state) => state.habitLog);
  const log = habitLog[habit.id];

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <CalendarDays className=" cursor-pointer" width={20} height={20} />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{habit.title}</DialogTitle>
            <DialogDescription>{habit.description}</DialogDescription>
            <p>{!log && "You have not complete it yet"}</p>
            <p>another bio</p>
            {log ? (
              <CalendarHeatmap
                startDate={startDate}
                endDate={new Date()}
                showWeekdayLabels
                values={log}
                titleForValue={(log) =>
                  `You completed ${log?.count} time(s) on ${log?.date}`
                }
              />
            ) : (
              ""
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <CalendarDays className=" cursor-pointer" width={20} height={20} />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <p>wtf</p>
        <CalendarHeatmap
          startDate={new Date("2016-01-01")}
          endDate={new Date("2016-04-01")}
          values={[
            { date: "2016-01-01", count: 12 },
            { date: "2016-01-22", count: 122 },
            { date: "2016-01-30", count: 38 },
            // ...and so on
          ]}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
