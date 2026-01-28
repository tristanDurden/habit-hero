import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabsSettings from "./TabsSettings";
import useHabitStore from "../habitStore";
import HabitCard from "./HabitCard";
import { useEffect, useState, useRef } from "react";
import { Habit as DbHabit, Folder as DbFolder } from "@prisma/client";
import { dbHabitToUi, dbFolderToUi } from "@/lib/dbformatting";
import {
  mergeServerHabitsToLocal,
  mergeServerFoldersToLocal,
} from "@/lib/onlineFunc";

export default function MyTabs() {
  //  store consts
  const habits = useHabitStore((s) => s.habits);
  const folders = useHabitStore((s) => s.folders) || [];
  const getHabitsForFolder = useHabitStore((s) => s.getHabitsForFolder);
  const isOnline = useHabitStore((s) => s.isOnline);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isFirstMount = useRef(true);

  // Fetch habits and folders from API (or use localStorage if offline)
  useEffect(() => {
    const fetchData = async () => {
      // If offline, use localStorage (already handled by Zustand persist)
      if (!isOnline) {
        console.log("Offline - using localStorage data");
        return;
      }

      try {
        // Get current local state
        const store = useHabitStore.getState();
        const localHabits = store.habits || [];
        const localFolders = store.folders || [];
        const queue = store.queue || [];

        // Fetch habits
        const habitsRes = await fetch("/api/habits", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (habitsRes.ok) {
          const dbHabits: DbHabit[] = await habitsRes.json();

          // Hybrid approach: Merge on initial mount, replace on subsequent refreshes
          if (isFirstMount.current) {
            const mergedHabits = mergeServerHabitsToLocal(
              dbHabits,
              localHabits,
              queue
            );
            useHabitStore.setState({ habits: mergedHabits });
          } else {
            // On refresh, just replace with server data (online-status handles merging on reconnect)
            const uiHabits = dbHabits.map((dbHabit) => dbHabitToUi(dbHabit));
            useHabitStore.setState({ habits: uiHabits });
          }
        }

        // Fetch folders
        const foldersRes = await fetch("/api/folders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (foldersRes.ok) {
          const dbFolders: DbFolder[] = await foldersRes.json();

          // Hybrid approach: Merge on initial mount, replace on subsequent refreshes
          if (isFirstMount.current) {
            const mergedFolders = mergeServerFoldersToLocal(
              dbFolders,
              localFolders,
              queue
            );
            useHabitStore.setState({ folders: mergedFolders });
          } else {
            // On refresh, just replace with server data
            const uiFolders = dbFolders.map((dbFolder) =>
              dbFolderToUi(dbFolder)
            );
            useHabitStore.setState({ folders: uiFolders });
          }
        }

        // Mark that initial mount is complete
        if (isFirstMount.current) {
          isFirstMount.current = false;
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // On error, fall back to localStorage (already in store)
      }
    };

    fetchData();
  }, [refreshTrigger, isOnline]);

  // Listen for custom event when habits are updated
  useEffect(() => {
    const handleHabitUpdate = () => {
      // Add a small delay to ensure API has processed the update
      setTimeout(() => {
        setRefreshTrigger((prev) => prev + 1);
      }, 300);
    };

    window.addEventListener("habitUpdated", handleHabitUpdate);
    return () => {
      window.removeEventListener("habitUpdated", handleHabitUpdate);
    };
  }, []);

  return (
    <Tabs defaultValue="all" className="w-full gap-3">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        {folders.map((folder) => {
          return (
            <TabsTrigger key={folder.id} value={folder.name}>
              {folder.name}
            </TabsTrigger>
          );
        })}
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      {/* tab with all habits */}
      <TabsContent value="all">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center md:justify-items-stretch">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      </TabsContent>
      {/* folders mapping */}
      {folders.map((folder) => {
        // Derive habits from IDs - always gets latest from main habits array
        const folderHabits = getHabitsForFolder(folder.id);
        return (
          <TabsContent
            key={folder.id}
            value={folder.name}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center md:justify-items-stretch"
          >
            {folderHabits.map((habit) => {
              return <HabitCard key={habit.id} habit={habit} />;
            })}
          </TabsContent>
        );
      })}
      {/* setting tab */}
      <TabsContent value="settings">
        <TabsSettings />
      </TabsContent>
    </Tabs>
  );
}
