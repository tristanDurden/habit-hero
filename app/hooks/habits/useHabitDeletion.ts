import useHabitStore from "@/app/habitStore";
import { useOnlineStatus } from "@/app/providers/online-status";
import { nowDate } from "@/lib/timeCounter";
import { toast } from "sonner";


export function useHabitDeletion() {
    // online const
    const { isOnline } = useOnlineStatus();
    // store const
    const pushQueue = useHabitStore((state) => state.pushQueue);
    const removeHabit = useHabitStore((state) => state.removeHabit);
    
    return async function deleteHabit(id: string) {
        // Get the habit from store before deletion to retrieve title for toast
        const habit = useHabitStore.getState().habits.find(h => h.id === id);
        const habitTitle = habit?.title || "habit";
        
        if (isOnline) {
            // If online: call API, then remove from store
            // The backend now handles both habit and habitlog deletion atomically
            try {
              const response = await fetch(`/api/habits/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
              });
              if (!response.ok) {
                throw new Error("Failed to delete habit");
              }
            } catch {
              toast.error("Failed to delete habit", {
                description: "Please try again later",
                position: "top-center",
              });
              return;
            }
          } else {
            pushQueue({
              type: "DELETE",
              payload: { id: id },
              timestamp: nowDate().toISOString(),
            });
          }
          removeHabit(id);
      
          toast(`You deleted your "${habitTitle}"`, {
            position: "bottom-left",
            description: `I guess we will never know what you made of!`,
          });
          // Dispatch custom event to trigger refetch in dashboard
          window.dispatchEvent(new CustomEvent("habitUpdated"));
    }
}