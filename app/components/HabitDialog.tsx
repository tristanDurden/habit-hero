import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Habit } from "../habitStore";
import HabitCard from "./HabitCard";
import NewHabit from "./NewHabit";
import { SquarePen } from "lucide-react";

type Props = {
  mode: "add" | "update";
  habit?: Habit;
};

export default function HabitDialog({ mode, habit }: Props) {
  const nameTrigger = mode === "add" ? "Add Habit" : <SquarePen size={20} />;
  return (
    <div>
      <Dialog>
        <DialogTrigger className="bg-slate-200 p-2 rounded-full cursor-pointer hover:bg-slate-400">
          {nameTrigger}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{nameTrigger}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <NewHabit />
        </DialogContent>
      </Dialog>
    </div>
  );
}
