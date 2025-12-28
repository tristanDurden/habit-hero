import { act, renderHook } from "@testing-library/react";
import { useCountdown } from "@/hooks/use-countdown";

describe("useCountdown (functional)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Ensure any timer-driven state updates are wrapped in act to avoid warnings.
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("increments until reaching the stop value then halts", () => {
    const { result } = renderHook(() =>
      useCountdown({
        countStart: 0,
        countStop: 2,
        intervalMs: 1000,
        isIncrement: true,
      })
    );

    act(() => {
      result.current[1].startCountdown();
    });

    // advance just enough time for two ticks (0 -> 1 -> 2)
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current[0]).toBe(2);
  });

  it("resets back to the initial count and stops the timer", () => {
    const { result } = renderHook(() =>
      useCountdown({
        countStart: 10,
        countStop: 0,
        intervalMs: 1000,
        isIncrement: false,
      })
    );

    act(() => {
      result.current[1].startCountdown();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
      result.current[1].resetCountdown();
    });

    expect(result.current[0]).toBe(10);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // timer should remain paused after reset
    expect(result.current[0]).toBe(10);
  });
});
