import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabsSettings from "./TabsSettings";
import useHabitStore from "../../habitStore";
import HabitCard from "../habits/HabitCard";
import useHabitSync from "@/app/hooks/habits/useHabitSync";

export default function MyTabs() {
  //  store consts
  const habits = useHabitStore((s) => s.habits);
  const folders = useHabitStore((s) => s.folders) || [];
  const getHabitsForFolder = useHabitStore((s) => s.getHabitsForFolder);

  // Sync habits & folders from DB
  useHabitSync();

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
