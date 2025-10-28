"use client";

import * as React from "react";

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
      numberOfMonths={frequencyTime === "week" ? 1 : 2}
      className="rounded-lg border shadow-sm"
    />
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
