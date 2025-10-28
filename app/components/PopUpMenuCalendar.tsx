"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Habit } from "@/lib/types";
import useHabitStore from "../habitStore";

type Props = {
  chosenHabits: Habit[];
  setChosenHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
};

export function PopUpMenu({ chosenHabits, setChosenHabits }: Props) {
  const habits = useHabitStore((state) => state.habits);

  function handleClick(habit: Habit) {
    const exists = chosenHabits.find((h) => h.id === habit.id);

    if (exists) {
      setChosenHabits(chosenHabits.filter((h) => h.id !== habit.id));
    } else {
      setChosenHabits([...chosenHabits, habit]);
    }
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Choose habits</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col gap-5">
          {habits.map((item) => {
            return (
              <Button
                variant={
                  chosenHabits.some((h) => h.id === item.id)
                    ? "outline"
                    : "ghost"
                }
                key={item.id}
                onClick={() => handleClick(item)}
              >
                {item.title}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
