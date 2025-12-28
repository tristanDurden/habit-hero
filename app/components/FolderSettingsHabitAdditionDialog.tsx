import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useHabitStore from "../habitStore";
import { Button } from "@/components/ui/button";
import { Folder } from "@/lib/types";
import { useHabitToFolderAddition } from "../hooks/folders/useHabitToFolderAddition";
import { useHabitToFolderDeletion } from "../hooks/folders/useHabitToFolderDeletion";

type Props = {
  folder: Folder;
};

export default function FolderSettingsHabitAdditionDialog({ folder }: Props) {
  // store consts
  const habits = useHabitStore((s) => s.habits);
  const addHabitToFolder = useHabitToFolderAddition();
  const removeHabitFromFolder = useHabitToFolderDeletion();

  function isHabitInFolder(habitId: string): boolean {
    return folder.habitIds.includes(habitId);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Manage Habits</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Habit To Folder</DialogTitle>
          <DialogDescription>
            Select a habit to add to the folder.
          </DialogDescription>
        </DialogHeader>
        {/* Content with habbits array */}
        <div className="flex flex-col gap-2">
          {habits.map((habit) => (
            <div key={habit.id} className="flex flex-row gap-2 justify-between">
              <p>{habit.title}</p>
              <div className="flex justify-items-end-safe gap-2">
                <Button
                  onClick={() => addHabitToFolder(habit, folder.id)}
                  variant={isHabitInFolder(habit.id) ? "ghost" : "default"}
                >
                  Add
                </Button>
                <Button
                  onClick={() => removeHabitFromFolder(habit, folder.id)}
                  variant={isHabitInFolder(habit.id) ? "default" : "ghost"}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
