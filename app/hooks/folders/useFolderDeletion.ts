import useHabitStore from "@/app/habitStore";
import { useOnlineStatus } from "@/app/providers/online-status";
import { nowDate } from "@/lib/timeCounter";
import { toast } from "sonner";



export function useFolderDeletion() {
    // online const
    const { isOnline } = useOnlineStatus();
    // store consts
    const pushQueue = useHabitStore((s) => s.pushQueue);
    const removeFolder = useHabitStore((s) => s.deleteFolder);

    return async function deleteFolder(id:string) {
        if (isOnline) {
            try {
                const response = await fetch("/api/folders", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json"},
                    body: JSON.stringify({id: id}),
                });
                if (!response.ok) {
                    throw new Error("Failed to delete folder");
                }
                removeFolder(id);
                toast.success("Folder deleted successfully", {
                    description: "You can now create a new folder",
                    position: "top-center",
                });
            } catch {
                toast.error("Failed to delete folder", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "FOLDER_DELETE",
                payload: {id:id},
                timestamp: nowDate().toISOString(),
            });
            removeFolder(id);
            toast.success("Folder deleted successfully", {
                description: "You can now create a new folder",
                position: "top-center",
            });
        }
    }
}