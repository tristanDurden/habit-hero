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
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{habit.title}</DrawerTitle>
          <DrawerDescription>{habit.description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto">
          <p className="mb-4">{!log && "You have not completed it yet"}</p>
          {log ? (
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
              No activity data yet. Start completing your habit!
            </div>
          )}
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
