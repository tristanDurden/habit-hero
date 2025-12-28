"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimerConfigForm, TimerType } from "../../types/timer";

type Props = {
  form: TimerConfigForm;
  setForm: React.Dispatch<React.SetStateAction<TimerConfigForm>>;
};

export default function TimerInputs({ form, setForm }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Timer Type</Label>
        <Select
          value={form.type}
          onValueChange={(val) =>
            setForm((prev) => ({ ...prev, type: val as TimerType }))
          }
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select timer type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="count_up">Count up</SelectItem>
            <SelectItem value="count_down">Count down</SelectItem>
            <SelectItem value="pomodoro">Pomodoro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.type !== "count_up" && (
        <div className="space-y-2">
          <Label htmlFor="duration">Work duration (minutes)</Label>
          <Input
            id="duration"
            name="durationMin"
            type="number"
            min={1}
            placeholder={form.durationMin?.toString() ?? "25"}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                durationMin: Number(e.target.value),
              }))
            }
          />
        </div>
      )}

      {form.type === "pomodoro" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="breakDuration">Break duration (minutes)</Label>
            <Input
              id="breakDuration"
              name="breakDurationMin"
              type="number"
              min={1}
              placeholder={form.breakDurationMin?.toString() ?? "5"}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  breakDurationMin: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycles">Cycles</Label>
            <Input
              id="cycles"
              type="number"
              name="cycles"
              min={1}
              placeholder={form.cycles?.toString() ?? "4"}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, cycles: Number(e.target.value) }))
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
