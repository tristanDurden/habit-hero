import useHabitStore from "@/app/habitStore";
import { useOnlineStatus } from "@/app/providers/online-status";
import { nowDate } from "@/lib/timeCounter";
import { Habit } from "@/lib/types";
import { toast } from "sonner";


export function useHabitToFolderDeletion() {
    // online const
    const { isOnline } = useOnlineStatus();
    // store consts
    const pushQueue = useHabitStore((s) => s.pushQueue);
    const removeHabitFromFolder = useHabitStore((s) => s.removeHabitFromFolder);

    return async function deleteHabitFromFolder(habit:Habit, folderId: string) {
        if (isOnline) {
            try {
                const response = await fetch(`/api/folders/${folderId}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ habitId: habit.id }),
                });
                if (!response.ok) {
                    throw new Error("Failed to delete habit from folder");
                }
                removeHabitFromFolder(habit, folderId);
                toast.success("Habit deleted from folder successfully", {
                    description: "You can now remove this habit from this folder",
                    position: "top-center",
                });
                return;
            } catch {
                toast.error("Failed to delete habit from folder", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "FOLDER_REMOVE_HABIT",
                payload: { habitId: habit.id, id: folderId },
                timestamp: nowDate().toISOString(),
            });
        }
        removeHabitFromFolder(habit, folderId);
        toast.success("Habit deleted from folder successfully", {
        description: "You can now remove this habit from this folder",
        position: "top-center",
      });
    };
    
}