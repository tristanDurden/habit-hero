"use client";

import * as React from "react";
import { useMediaQuery } from "react-responsive";
import { Calendar } from "@/components/ui/calendar";
import { getWeekDay, numberTranslater } from "@/lib/types";

type Props = {
  date: number;
  frequency: [string, string];
  onSendSchedule: (value: Date[]) => void;
};

export function Calendar04({ date, frequency, onSendSchedule }: Props) {
  // frequency consts
  const frequencyNumber = numberTranslater[frequency[0]];
  const frequencyTime = frequency[1];
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  // consts
  const nowDate = new Date(date);
  const firstDay = new Date(date);
  //firstDay.setDate(firstDay.getDate() - 2);
  const lastDay = new Date(date);
  frequencyTime === "week"
    ? lastDay.setDate(lastDay.getDate() + 6)
    : lastDay.setDate(lastDay.getDate() + 31);
  // console.log(firstDay, lastDay, date);

  //  state changing
  //const updateHabit = useHabitStore((state) => state.updateHabit);
  const [pickedDates, setPickedDates] = React.useState<Date[]>([nowDate]);

  React.useEffect(() => {
    const sortedPickedDates = pickedDates.sort(
      (a, b) => a.getDay() - b.getDay()
    );
    onSendSchedule(sortedPickedDates);
  }, [pickedDates]);

  //   if (frequencyTime === "week") {
  return (
    <div className="w-full overflow-hidden">
      <Calendar
        mode="multiple"
        defaultMonth={nowDate}
        required
        selected={pickedDates}
        onSelect={setPickedDates}
        disabled={{
          before: firstDay,
          after: lastDay,
        }}
        max={frequencyNumber}
        numberOfMonths={
          isMobile
            ? 1 // Always show 1 month on mobile for better UX
            : frequencyTime === "week"
            ? 1
            : 2
        }
        className={`rounded-lg border shadow-sm ${isMobile ? "text-sm" : ""}`}
      />
    </div>
  );
  //   } else if (frequencyTime === "month") {
  //     <Calendar
  //       mode="multiple"
  //       defaultMonth={nowDate}
  //       numberOfMonths={2}
  //       required
  //       selected={pickedDates}
  //       onSelect={setPickedDates}
  //       disabled={{
  //         before: firstDay,
  //         after: lastDay,
  //       }}
  //       max={frequencyNumber}
  //       className="rounded-lg border shadow-sm"
  //     />;
  //   }
}
