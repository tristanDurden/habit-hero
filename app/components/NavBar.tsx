import React from "react";
import { ModeToggle } from "./ModeToggle";
import { SquareStar } from "lucide-react";

type Props = {};

export default function NavBar({}: Props) {
  return (
    <div className="flex justify-between items-center py-4 px-6 border-b-2">
      <div className="flex gap-1 items-center">
        <SquareStar size={32} />
        <h1 className="text-2xl font-bold">Habit Hero</h1>
      </div>
      <ModeToggle />
    </div>
  );
}
