import {
  howManyDaysLeftFromLast,
  todayKey,
  keepDayStreak,
  keepWeekStreak,
} from "@/lib/timeCounter";
import type { Habit } from "@/lib/types";
import type * as TimeCounterModule from "@/lib/timeCounter";

describe("timeCounter helpers", () => {
  describe("howManyDaysLeftFromLast", () => {
    it("reports 'today' when dates match", () => {
      const reference = new Date("2024-08-10T10:00:00Z");
      expect(howManyDaysLeftFromLast(reference, reference)).toBe("today");
    });

    it("reports 'yesterday' when dates are one calendar day apart", () => {
      const previous = new Date("2024-08-09T10:00:00Z");
      const now = new Date("2024-08-10T10:00:00Z");
      expect(howManyDaysLeftFromLast(previous, now)).toBe("yesterday");
    });

    it("reports number of days for longer gaps", () => {
      const previous = new Date("2024-08-01T00:00:00Z");
      const now = new Date("2024-08-10T00:00:00Z");
      expect(howManyDaysLeftFromLast(previous, now)).toBe("9 days ago");
    });
  });

  describe("todayKey", () => {
    it("returns an ISO date string (YYYY-MM-DD)", () => {
      const isoKey = todayKey(new Date("2024-01-20T15:30:45.000Z"));
      expect(isoKey).toBe("2024-01-20");
    });
  });

  describe("streak helpers", () => {
    const makeHabit = (overrides: Partial<Habit> = {}): Habit => ({
      id: "habit-1",
      title: "Test habit",
      description: "",
      frequency: ["one", "day"],
      schedule: [],
      counter: 0,
      streak: 1,
      lastCompleted: Date.now(),
      doneToday: false,
      updatedAt: Math.floor(Date.now() / 1000),
      ...overrides,
    });

    describe("keepDayStreak", () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it("keeps daily streak when last completion was yesterday", () => {
        const now = new Date("2024-08-10T12:00:00Z");
        jest.setSystemTime(now);

        const yesterdayEvening = new Date("2024-08-09T20:00:00Z").getTime();
        const habit = makeHabit({ lastCompleted: yesterdayEvening });

        expect(keepDayStreak(habit)).toBe(true);
      });

      it("breaks daily streak when last completion was more than one day before today's midnight", () => {
        const now = new Date("2024-08-10T12:00:00Z");
        jest.setSystemTime(now);

        const twoDaysAgo = new Date("2024-08-08T10:00:00Z").getTime();
        const habit = makeHabit({ lastCompleted: twoDaysAgo });

        expect(keepDayStreak(habit)).toBe(false);
      });
    });

    describe("keepWeekStreak", () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it("keeps weekly streak when last completion was within the last week", () => {
        const now = new Date("2024-08-10T12:00:00Z");
        jest.setSystemTime(now);

        const threeDaysAgo = new Date("2024-08-07T12:00:00Z").getTime();
        const habit = makeHabit({ lastCompleted: threeDaysAgo });

        expect(keepWeekStreak(habit)).toBe(true);
      });

      it("breaks weekly streak when last completion was more than a week ago", () => {
        const now = new Date("2024-08-10T12:00:00Z");
        jest.setSystemTime(now);

        const eightDaysAgo = new Date("2024-08-02T12:00:00Z").getTime();
        const habit = makeHabit({ lastCompleted: eightDaysAgo });

        expect(keepWeekStreak(habit)).toBe(false);
      });

      it("treats exactly 7 days ago as breaking the weekly streak (per current implementation)", () => {
        const now = new Date("2024-08-10T12:00:00Z");
        jest.setSystemTime(now);

        const sevenDaysAgo = new Date("2024-08-03T12:00:00Z").getTime();
        const habit = makeHabit({ lastCompleted: sevenDaysAgo });

        expect(keepWeekStreak(habit)).toBe(false);
      });
    });
  });

  describe("msUntilNextScheduledDay", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const makeHabit = (overrides: Partial<Habit> = {}): Habit => ({
      id: "habit-1",
      title: "Test habit",
      description: "",
      frequency: ["one", "day"],
      schedule: [],
      counter: 0,
      streak: 1,
      lastCompleted: Date.now(),
      doneToday: false,
      updatedAt: Math.floor(Date.now() / 1000),
      ...overrides,
    });

    const loadModuleAtTime = (isoDate: string): typeof TimeCounterModule => {
      const fixedNow = new Date(isoDate);
      jest.setSystemTime(fixedNow);

      let mod: typeof TimeCounterModule;
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        mod = require("@/lib/timeCounter");
      });
      // @ts-expect-no-error - assigned in isolateModules
      return mod!;
    };

    it("returns msUntilMidnight for daily habits", () => {
      const mod = loadModuleAtTime("2024-08-05T10:00:00Z"); // Monday

      const dailyHabit = makeHabit({ frequency: ["one", "day"], schedule: [] });
      const result = mod.msUntilNextScheduledDay(dailyHabit);

      expect(result).toBe(mod.msUntilMidnight);
    });

    it("returns msUntilMidnight when next scheduled day is tomorrow", () => {
      const mod = loadModuleAtTime("2024-08-05T10:00:00Z"); // Monday, getDay() = 1

      const tomorrow = new Date("2024-08-06T00:00:00Z"); // Tuesday, getDay() = 2
      const weeklyHabit = makeHabit({
        frequency: ["one", "week"],
        schedule: [tomorrow],
      });

      const result = mod.msUntilNextScheduledDay(weeklyHabit);

      expect(result).toBe(mod.msUntilMidnight);
    });

    it("adds full days when the next scheduled day is more than one day away", () => {
      const mod = loadModuleAtTime("2024-08-05T10:00:00Z"); // Monday, getDay() = 1

      const twoDaysAhead = new Date("2024-08-07T00:00:00Z"); // Wednesday, getDay() = 3
      const weeklyHabit = makeHabit({
        frequency: ["one", "week"],
        schedule: [twoDaysAhead],
      });

      const result = mod.msUntilNextScheduledDay(weeklyHabit);

      expect(result).toBe(mod.msUntilMidnight + mod.DAYDURATION);
    });
  });
});