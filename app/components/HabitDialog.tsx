import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Habit } from "@/lib/types";
import NewHabit from "./NewHabit";
import { SquarePen } from "lucide-react";

type Props = {
  mode: "add" | "update";
  habit: Habit;
  className?: string;
};

export default function HabitDialog({ mode, habit, className }: Props) {
  const nameTrigger =
    mode === "add" ? "Add Habit" : <SquarePen size={20} className="p-0" />;
  const dialogTitle = mode === "add" ? "Add Habit" : "Update Habit";
  return (
    <Dialog>
      <DialogTrigger className={className || "cursor-pointer p-0 m-0 items-center justify-center"}>
        {nameTrigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new habit to track your progress."
              : "Update your habit details and settings."}
          </DialogDescription>
        </DialogHeader>
        {/* Component with inputs */}
        <NewHabit habit={habit} mode={mode} />
      </DialogContent>
    </Dialog>
  );
}
