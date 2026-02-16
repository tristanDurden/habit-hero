import { useEffect, useRef, useState } from "react";
import { dbListWithItems as DbListWithItems } from "@/lib/dbformatting";
import { useOnlineStatus } from "@/app/providers/online-status";
import useHabitStore from "@/app/habitStore";
import useListsStore from "@/app/listsStore";
import { dbListToUi } from "@/lib/dbformatting";
import { mergeServerListsToLocal } from "@/lib/onlineFunc";

export default function useListSync() {
    const { isOnline } = useOnlineStatus();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const isFirstMount = useRef(true);

    // Fetch lists from API and merge/replace into store
    useEffect(() => {
        const fetchData = async () => {
            if (!isOnline) {
                console.log("Offline - using localStorage list data");
                return;
            }

            try {
                const res = await fetch("/api/lists", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (res.ok) {
                    const dbLists: DbListWithItems[] = await res.json();

                    if (isFirstMount.current) {
                        const localLists = useListsStore.getState().lists || [];
                        const queue = useHabitStore.getState().queue || [];

                        const mergedLists = mergeServerListsToLocal(
                            dbLists,
                            localLists,
                            queue
                        );
                        useListsStore.setState({ lists: mergedLists });
                        isFirstMount.current = false;
                    } else {
                        const uiLists = dbLists.map((dbList) => dbListToUi(dbList));
                        useListsStore.setState({ lists: uiLists });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch lists:", error);
            }
        };

        fetchData();
    }, [isOnline, refreshTrigger]);

    // Listen for "listUpdated" events dispatched by useListMutations
    useEffect(() => {
        const handleListUpdate = () => {
            setTimeout(() => {
                setRefreshTrigger((prev) => prev + 1);
            }, 300);
        };

        window.addEventListener("listUpdated", handleListUpdate);
        return () => {
            window.removeEventListener("listUpdated", handleListUpdate);
        };
    }, []);
}
