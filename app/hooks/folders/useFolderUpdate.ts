import useHabitStore from "@/app/habitStore";
import { useOnlineStatus } from "@/app/providers/online-status";
import { nowDate } from "@/lib/timeCounter";
import { Folder as uiFolder } from "@/lib/types";
import { toast } from "sonner";


export function useFolderUpdate() {
    // online const
    const { isOnline } = useOnlineStatus();
    // store consts
    const pushQueue = useHabitStore((s) => s.pushQueue);
    const renameFolder = useHabitStore((s) => s.renameFolder);

    return async function updateFolder(folder: uiFolder) {
        if (isOnline) {
            try {
                const response = await fetch("/api/folders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...folder }),
                });
                if (!response.ok) {
                    throw new Error("Failed to update folder");
                }
                renameFolder(folder);
                toast.success("Folder renamed successfully", {
                    description: "You can now use this folder",
                    position: "top-center",
                });
                return;
            } catch {
                toast.error("Failed to rename folder", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "FOLDER_UPDATE",
                payload: folder,
                timestamp: nowDate().toISOString(),
            });
            renameFolder(folder);
        }
    }
}