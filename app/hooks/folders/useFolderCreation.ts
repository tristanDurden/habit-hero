import useHabitStore from "@/app/habitStore";
import { useOnlineStatus } from "@/app/providers/online-status";
import { nowDate } from "@/lib/timeCounter";
import { Folder as uiFolder } from "@/lib/types";
import { toast } from "sonner";


export function useFolderCreation() {
    // online const
    const { isOnline } = useOnlineStatus();
    // store consts
    const addFolder = useHabitStore((s) => s.addFolder);
    const pushQueue = useHabitStore((s) => s.pushQueue);

    return async function createFolder(folder: uiFolder) {
        if (isOnline) {
            try {
                const response = await fetch("/api/folders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...folder }),
                });
                if (!response.ok) {
                    throw new Error("Failed to create folder");
                }
                addFolder(folder);
                toast.success("Folder created successfully", {
                    description: "You can now add habits to this folder",
                    position: "top-center",
                });
                return;
            } catch {
                toast.error("Failed to create folder", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "FOLDER_CREATE",
                payload: folder,
                timestamp: nowDate().toISOString(),
            });
            addFolder(folder);
        }
    }
}