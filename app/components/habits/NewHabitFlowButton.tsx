"use client";

import { Plus } from "lucide-react";
import { AddDefaultHabit } from "@/lib/types";
import NewHabit from "./NewHabit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function NewHabitFlowButton() {
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Dialog>
        <DialogTrigger className="cursor-pointer flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
          <Plus size={28} />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Habit</DialogTitle>
            <DialogDescription>
              Create a new habit to track your progress.
            </DialogDescription>
          </DialogHeader>
          <NewHabit habit={AddDefaultHabit} mode="add" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
