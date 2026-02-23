import { useEffect, useRef, useState } from "react";
import { Habit as DbHabit, Folder as DbFolder } from "@prisma/client";
import { dbHabitToUi, dbFolderToUi } from "@/lib/dbformatting";
import {
    mergeServerHabitsToLocal,
    mergeServerFoldersToLocal,
} from "@/lib/onlineFunc";
import useHabitStore from "@/app/habitStore";
import { useOnlineStatus } from "@/app/providers/online-status";

export default function useHabitSync() {
    const { isOnline } = useOnlineStatus();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const isFirstMount = useRef(true);

    // Fetch habits and folders from API and merge/replace into store
    useEffect(() => {
        const fetchData = async () => {
            if (!isOnline) {
                console.log("Offline - using localStorage habit data");
                return;
            }

            try {
                const store = useHabitStore.getState();
                const localHabits = store.habits || [];
                const localFolders = store.folders || [];
                const queue = store.queue || [];

                // Fetch habits
                const habitsRes = await fetch("/api/habits", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (habitsRes.ok) {
                    const dbHabits: DbHabit[] = await habitsRes.json();

                    if (isFirstMount.current) {
                        const mergedHabits = mergeServerHabitsToLocal(
                            dbHabits,
                            localHabits,
                            queue
                        );
                        useHabitStore.setState({ habits: mergedHabits });
                    } else {
                        const uiHabits = dbHabits.map((dbHabit) => dbHabitToUi(dbHabit));
                        useHabitStore.setState({ habits: uiHabits });
                    }
                }

                // Fetch folders
                const foldersRes = await fetch("/api/folders", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (foldersRes.ok) {
                    const dbFolders: DbFolder[] = await foldersRes.json();

                    if (isFirstMount.current) {
                        const mergedFolders = mergeServerFoldersToLocal(
                            dbFolders,
                            localFolders,
                            queue
                        );
                        useHabitStore.setState({ folders: mergedFolders });
                    } else {
                        const uiFolders = dbFolders.map((dbFolder) =>
                            dbFolderToUi(dbFolder)
                        );
                        useHabitStore.setState({ folders: uiFolders });
                    }
                }

                if (isFirstMount.current) {
                    isFirstMount.current = false;
                }
            } catch (error) {
                console.error("Failed to fetch habits:", error);
            }
        };

        fetchData();
    }, [isOnline, refreshTrigger]);

    // Listen for "habitUpdated" events dispatched by useHabitCreation etc.
    useEffect(() => {
        const handleHabitUpdate = () => {
            setTimeout(() => {
                setRefreshTrigger((prev) => prev + 1);
            }, 300);
        };

        window.addEventListener("habitUpdated", handleHabitUpdate);
        return () => {
            window.removeEventListener("habitUpdated", handleHabitUpdate);
        };
    }, []);
}
