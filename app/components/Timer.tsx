"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { TimerConfigForm } from "../types/timer";
import useHabitStore from "../habitStore";
import useTimerStore from "../timerStore";
import TimerInputs from "./timer/TimerInputs";
import TimerButtons from "./timer/TimerButtons";
import TimerStatus from "./timer/TimerStatus";

type Props = {
  habitId: string;
};

export function Timer({ habitId }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TimerConfigForm>({ type: "count_up" });
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === habitId));
  const timer = habit?.timer;
  const openTimerDialogId = useTimerStore((s) => s.openTimerDialogId);
  const closeTimerDialog = useTimerStore((s) => s.closeTimerDialog);

  // Sync local state with store
  useEffect(() => {
    setOpen(openTimerDialogId === habitId);
  }, [openTimerDialogId, habitId]);

  // Update store when local state changes (from DialogTrigger)
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      useTimerStore.getState().openTimerDialog(habitId);
    } else {
      closeTimerDialog();
    }
  };

  // Note: useTimerTick removed - GlobalTimerTick handles all timers to avoid multiple intervals

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>T</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
          <DialogDescription>
            Configure and manage your timer for this habit.
          </DialogDescription>
        </DialogHeader>

        <TimerInputs form={form} setForm={setForm} />
        <TimerButtons
          habitId={habitId}
          form={form}
          timer={timer}
          onHide={() => {
            setOpen(false);
            closeTimerDialog();
          }}
        />
        {timer && <TimerStatus timer={timer} />}
      </DialogContent>
    </Dialog>
  );
}
