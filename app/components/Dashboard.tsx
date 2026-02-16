"use client";

import React, { useState } from "react";
import useHabitStore from "../habitStore";
import HabitCard from "./habits/HabitCard";
import HabitDialog from "./habits/HabitDialog";
import { AddDefaultHabit } from "@/lib/types";
import ActivityTable from "./misc/ActivityTable";
import { Session } from "next-auth";
import Tabs from "@/app/components/tabs/Tabs";

interface DashboardProps {
  session: Session; // or type from next-auth
}

export default function Dashboard({ session }: DashboardProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row gap-5 items-center py-3">
        <h1>
          Welcome, {session.user?.name}! Your habit journey starts here 💪
        </h1>

        <HabitDialog mode="add" habit={AddDefaultHabit} />
      </div>

      {/* TABS component */}
      <Tabs />

      {/* Activity table for tracking your productivity */}
      <ActivityTable />
    </div>
  );
}
