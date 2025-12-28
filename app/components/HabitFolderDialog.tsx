import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Habit } from "@/lib/types";
import useHabitStore from "../habitStore";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { useHabitToFolderAddition } from "../hooks/folders/useHabitToFolderAddition";
import { useHabitToFolderDeletion } from "../hooks/folders/useHabitToFolderDeletion";

type Props = {
  habit: Habit;
};

export default function HabitFolderDialog({ habit }: Props) {
  //store consts
  const folders = useHabitStore((s) => s.folders);
  // const for hooks
  const addHabitToFolder = useHabitToFolderAddition();
  const deleteHabitFromFolder = useHabitToFolderDeletion();

  function isHabitInFolder(folderId: string): boolean {
    const existingFolder = folders.find((folder) => folder.id === folderId);
    if (!existingFolder) return false;
    return existingFolder.habitIds.includes(habit.id);
  }

  function handleAdditionToFolder(folderId: string) {
    const existingFolder = folders.find((folder) => folder.id === folderId);
    if (!existingFolder) return;
    if (existingFolder.habitIds.includes(habit.id)) return;
    addHabitToFolder(habit, folderId);
  }

  function handleDeletionFromFolder(folderId: string) {
    deleteHabitFromFolder(habit, folderId);
    toast.success("Habit removed from folder");
  }

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer p-0 m-0 items-center justify-center">
        <FolderOpen />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Habit to Folder</DialogTitle>
          <DialogDescription>
            Organize your habits by adding them to folders.
          </DialogDescription>
        </DialogHeader>
        {/* Component with inputs */}
        <div className="flex flex-col gap-1">
          {folders.map((folder) => {
            return (
              <div
                key={folder.id}
                className="flex flex-row items-center justify-between"
              >
                <p>{folder.name}</p>
                <div className="flex flex-row">
                  <Button
                    onClick={() => handleAdditionToFolder(folder.id)}
                    variant={isHabitInFolder(folder.id) ? "ghost" : "default"}
                  >
                    Add to folder
                  </Button>
                  <Button
                    onClick={() => handleDeletionFromFolder(folder.id)}
                    variant={isHabitInFolder(folder.id) ? "default" : "ghost"}
                  >
                    Delete from folder
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
