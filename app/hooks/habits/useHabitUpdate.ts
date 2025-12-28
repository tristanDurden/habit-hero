import useHabitStore from '@/app/habitStore';
import { useOnlineStatus } from '@/app/providers/online-status';
import { nowDate } from '@/lib/timeCounter';
import {Habit as uiHabit} from '@/lib/types'
import { toast } from 'sonner';



export function useHabitUpdate() {
    const {isOnline} = useOnlineStatus();
    const pushQueue = useHabitStore((s) => s.pushQueue);
    const updateHabit = useHabitStore((s) => s.updateHabit);
    
    return async function updateHabit(habit:uiHabit) {
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
                throw new Error("Failed to update habit");
              }
            } catch {
              toast.error("Failed to update habit", {
                description: "Please try again later",
                position: "top-center",
              });
              return;
            }
          } else {
            pushQueue({
              type: "UPDATE",
              payload: habit,
              timestamp: nowDate().toISOString(),
            });
          }
          updateHabit(habit);
          toast(`You've updated your "${habit.title}" habit`, {
            description: `Proceed to accomplishing your dream`,
            position: "top-center",
          });
          // Dispatch custom event to trigger refetch in dashboard
          window.dispatchEvent(new CustomEvent("habitUpdated"));
    }
}
