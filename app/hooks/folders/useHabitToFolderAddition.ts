import useHabitStore from "@/app/habitStore";
import { useOnlineStatus } from "@/app/providers/online-status";
import { nowDate } from "@/lib/timeCounter";
import { Habit } from "@/lib/types";
import { toast } from "sonner";



export function useHabitToFolderAddition() {
    // online const
    const { isOnline } = useOnlineStatus();
    // store consts
    const pushQueue = useHabitStore((s) => s.pushQueue);
    const addHabit = useHabitStore((s) => s.addHabitToFolder);
    return async function addHabitToFolder(habit:Habit, folderId: string) {
        if (isOnline) {
            try {
                const response = await fetch(`/api/folders/${folderId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ habitId: habit.id }),
                });
                if (!response.ok) {
                    throw new Error("Failed to add habit to folder");
                }
                addHabit(habit, folderId);
                toast.success("Habit added to folder successfully", {
                    description: "You can now track this habit in this folder",
                    position: "top-center",
                });
                return;
            } catch {
                toast.error("Failed to add habit to folder", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "FOLDER_ADD_HABIT",
                payload: {habitId: habit.id, id: folderId},
                timestamp: nowDate().toISOString(),
            });
        }
        addHabit(habit, folderId);
        toast.success("Habit added to folder successfully", {
            description: "You can now track this habit in this folder",
            position: "top-center",
        });
    }
}