"use client";

import useHabitStore from "../../habitStore";
import { nowDate, todayKey } from "@/lib/timeCounter";
import {
  activityReducerDurationForDay,
  activityReducerCounterForDay,
} from "@/lib/habitlogFunc";
import useHabitLogSync from "@/app/hooks/habits/useHabitLogSync";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { ChevronDown, Activity, Clock, CheckCircle } from "lucide-react";

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export default function ActivityTable() {
  // Sync habit log data (replaces inline fetch logic)
  useHabitLogSync();

  // Store
  const habitLog = useHabitStore((state) => state.habitLog);

  const [isOpen, setIsOpen] = useState(true);

  // Date calculations
  const now = nowDate();
  const yesterday = nowDate();
  yesterday.setDate(now.getDate() - 1);

  const todayString = todayKey(now);
  const yesterdayString = todayKey(yesterday);

  // Computed stats
  const counterForToday = activityReducerCounterForDay(habitLog, todayString);
  const counterForYesterday = activityReducerCounterForDay(
    habitLog,
    yesterdayString
  );
  const durationForToday =
    activityReducerDurationForDay(habitLog, todayString) / 1000;
  const durationForYesterday =
    activityReducerDurationForDay(habitLog, yesterdayString) / 1000;

  // Trend indicator
  const trend =
    counterForToday > counterForYesterday
      ? "up"
      : counterForToday < counterForYesterday
      ? "down"
      : "same";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Activity Summary</CardTitle>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            {/* Today */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Today
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <StatItem
                  icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                  label="Completions"
                  value={counterForToday}
                  trend={trend}
                />
                <StatItem
                  icon={<Clock className="h-4 w-4 text-blue-500" />}
                  label="Time spent"
                  value={formatDuration(durationForToday)}
                />
              </div>
            </div>

            <Separator className="my-5" />

            {/* Yesterday */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Yesterday
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <StatItem
                  icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
                  label="Completions"
                  value={counterForYesterday}
                />
                <StatItem
                  icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                  label="Time spent"
                  value={formatDuration(durationForYesterday)}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function StatItem({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "same";
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-semibold tabular-nums">{value}</span>
          {trend && trend !== "same" && (
            <span
              className={`text-xs font-medium ${
                trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend === "up" ? "↑" : "↓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
