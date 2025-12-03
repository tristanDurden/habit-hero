"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCountdown } from "@/hooks/use-countdown";

export function Timer() {
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: 0,
      countStop: 60,
      intervalMs: 1000,
      isIncrement: true,
    });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="col-span-1">
          T
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Timer title</DialogTitle>
          <DialogDescription>timer description</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div>Time: {count}</div>
          <Button onClick={startCountdown}>Start</Button>
          <Button onClick={stopCountdown}>Stop</Button>
          <Button onClick={resetCountdown}>Reset</Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
