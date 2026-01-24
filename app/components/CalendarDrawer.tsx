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
        <CalendarDays className=" cursor-pointer" width={24} height={24} />
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Calendar of your habits!</DrawerTitle>
          <DrawerDescription>Track your progress over time</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto">
          <div className="mb-4">
            <PopUpMenu
              chosenHabits={chosenHabits}
              setChosenHabits={setChosenHabits}
            />
          </div>

          {chosenHabits[0] && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Selected Habits:</h3>
              <div className="flex flex-wrap gap-2">
                {chosenHabits.map((habit) => (
                  <span
                    key={habit.id}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {habit.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {chosenHabits[0] ? (
            <div className="w-full overflow-x-auto">
              <CalendarHeatmap
                startDate={startDate}
                endDate={new Date()}
                showWeekdayLabels
                values={log}
                titleForValue={(log) =>
                  `You completed ${log?.count} time(s) on ${log?.date}`
                }
                classForValue={(value) => {
                  if (!value) return "color-empty";
                  return `color-scale-${Math.min(value.count, 4)}`;
                }}
              />
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              Select habits above to view their calendar
            </div>
          )}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
