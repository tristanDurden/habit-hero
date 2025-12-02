import React from "react";
import { ModeToggle } from "./ModeToggle";
import { SquareStar } from "lucide-react";
import { CalendarDrawer } from "./CalendarDrawer";
import { AuthButtons } from "./AuthButtons";
import { useOnlineStatus } from "../providers/online-status";

export default function NavBar() {
  const { isOnline } = useOnlineStatus();
  return (
    <div className="flex justify-between items-center py-4 px-6 border-b-2">
      <div className="flex gap-1 items-center">
        <SquareStar size={32} />
        <h1 className="text-2xl font-bold">Habit Hero</h1>
      </div>
      <div className="flex items-center gap-5">
        <p>Status: {isOnline ? "🟢 Online" : "🔴 Offline"}</p>
        <AuthButtons />
        <CalendarDrawer />
        <ModeToggle />
      </div>
    </div>
  );
}
