import {
  howManyDaysLeftFromLast,
  todayKey,
} from "@/lib/timeCounter";

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
});

