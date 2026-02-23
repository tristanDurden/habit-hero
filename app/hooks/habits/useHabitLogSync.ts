import { useEffect, useRef, useState } from "react";
import { HabitLog as dbHabitLog } from "@prisma/client";
import { dbHabitLogToUi } from "@/lib/dbformatting";
import { mergeServerHabitLogToLocal } from "@/lib/onlineFunc";
import useHabitStore from "@/app/habitStore";
import { useOnlineStatus } from "@/app/providers/online-status";

export default function useHabitLogSync() {
    const { isOnline } = useOnlineStatus();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const isFirstMount = useRef(true);

    // Fetch habit logs from API and merge/replace into store
    useEffect(() => {
        const fetchData = async () => {
            if (!isOnline) {
                console.log("Offline - using localStorage habit log data");
                return;
            }

            try {
                const response = await fetch("/api/habitlog", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (response.ok) {
                    const serverLog: dbHabitLog[] = await response.json();

                    if (isFirstMount.current) {
                        // Get current local state
                        const store = useHabitStore.getState();
                        const localLog = store.habitLog;
                        const queue = store.queue || [];

                        // Merge server data with local data
                        const mergedLog = mergeServerHabitLogToLocal(
                            serverLog,
                            localLog,
                            queue
                        );

                        useHabitStore.setState({ habitLog: mergedLog });
                        isFirstMount.current = false;
                    } else {
                        // On refresh, just replace with server data
                        const formattedLog = dbHabitLogToUi(serverLog);
                        useHabitStore.setState({ habitLog: formattedLog });
                    }
                }
            } catch (error) {
                console.log("Failed to fetch habit log:", error);
            }
        };

        fetchData();
    }, [isOnline, refreshTrigger]);

    // Listen for "habitLogUpdated" events
    useEffect(() => {
        const handleHabitLogUpdate = () => {
            setTimeout(() => {
                setRefreshTrigger((prev) => prev + 1);
            }, 300);
        };

        window.addEventListener("habitLogUpdated", handleHabitLogUpdate);
        return () => {
            window.removeEventListener("habitLogUpdated", handleHabitLogUpdate);
        };
    }, []);
}
