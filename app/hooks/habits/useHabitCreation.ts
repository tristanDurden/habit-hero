import useHabitStore from '@/app/habitStore';
import { useOnlineStatus } from '@/app/providers/online-status';
import { nowDate } from '@/lib/timeCounter';
import {Habit as uiHabit} from '@/lib/types'
import { toast } from 'sonner';



export function useHabitCreation() {
    // online const
    const { isOnline } = useOnlineStatus();
    // store consts
    const pushQueue = useHabitStore((s) => s.pushQueue);
    const addHabit = useHabitStore((s) => s.addHabit);

    return async function createHabit(habit:uiHabit) {
        if (isOnline) {
            try {
              const response = await fetch("/api/habits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...habit,
                }),
              });
    
              if (!response.ok) {
                throw new Error("Failed to create habit");
              }
            } catch {
              toast.error("Failed to save habit", {
                description: "Please try again later",
                position: "top-center",
              });
              return;
            }
          } else {
            pushQueue({
              type: "CREATE",
              payload: habit,
              timestamp: nowDate().toISOString(),
            });
          }
    
          addHabit(habit);
          toast(`You've added "${habit.title}" to your habits list`, {
            description: `Start to accomplish it`,
            position: "top-center",
          });
          // Dispatch custom event to trigger refetch in dashboard
          window.dispatchEvent(new CustomEvent("habitUpdated"));
    }
}