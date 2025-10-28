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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopUpMenu } from "./PopUpMenuCalendar";
import { mapTasksForCalendar } from "@/lib/habitlogFunc";
import { useEffect } from "react";

type Props = {
  habit: Habit;
};

export function CalendarDrawer() {
  const [open, setOpen] = React.useState(false);
  //  state of mounted for ssr hydration issue
  const [mounted, setMounted] = React.useState(false);
  const [chosenHabits, setChosenHabits] = React.useState<Habit[]>([]);
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });

  const startDate = React.useMemo(() => {
    const now = new Date();
    now.setMonth(now.getMonth() - 6);
    return now;
  }, []);

  //  store consts
  const habitLog = useHabitStore((state) => state.habitLog);

  const log = mapTasksForCalendar(habitLog, chosenHabits);
  //for hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);
  //  recalculating count right with substracting

  if (!mounted) return null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <CalendarDays className=" cursor-pointer" width={20} height={20} />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Calendar of your habits!</DialogTitle>
            <DialogDescription>Showing off</DialogDescription>
            <PopUpMenu
              chosenHabits={chosenHabits}
              setChosenHabits={setChosenHabits}
            />
            {chosenHabits[0] &&
              chosenHabits.map((habit) => <p key={habit.id}>{habit.title}</p>)}
            {chosenHabits[0] ? (
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
          <DialogTitle>Calendar of your habits!</DialogTitle>
          <DialogDescription>Showing off</DialogDescription>

          <PopUpMenu
            chosenHabits={chosenHabits}
            setChosenHabits={setChosenHabits}
          />

          {chosenHabits[0] &&
            chosenHabits.map((habit) => <p key={habit.id}>{habit.title}</p>)}
        </DrawerHeader>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
