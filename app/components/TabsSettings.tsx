import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import useHabitStore from "../habitStore";
import { CircleX } from "lucide-react";
import { Habit } from "@/lib/types";
import FolderSettingsAdditionDialog from "./FolderSettingsAdditionDialog";
import { toast } from "sonner";
import FolderSettingsHabitAdditionDialog from "./FolderSettingsHabitAdditionDialog";
import { useFolderDeletion } from "../hooks/folders/useFolderDeletion";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export default function TabsSettings() {
  //  store consts
  const folders = useHabitStore((s) => s.folders);
  const habits = useHabitStore((s) => s.habits);
  const deleteFolder = useFolderDeletion();
  const removeHabitFromFolder = useHabitStore((s) => s.removeHabitFromFolder);

  function handleDeletionFromFolder(habit: Habit, folderId: string) {
    removeHabitFromFolder(habit, folderId);
    toast.success("Folder deleted successfully");
  }

  function handleFolderDelete(folderId: string) {
    deleteFolder(folderId);
  }

  // Helper to get habit by ID
  function getHabitById(habitId: string): Habit | undefined {
    return habits.find((h) => h.id === habitId);
  }

  return (
    <>
      <FolderSettingsAdditionDialog mode="add" />
      <Table>
        <TableCaption>A list of your folders.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="">habits inside</TableHead>
            <TableHead className="w-[100px]">Manage Habits</TableHead>
            <TableHead className="w-[100px]">Rename</TableHead>
            <TableHead className="w-[100px]">Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {folders.map((folder) => {
            return (
              <TableRow key={folder.id}>
                <TableCell>{folder.name}</TableCell>
                <TableCell>
                  {folder.habitIds.map((habitId, i) => {
                    const habit = getHabitById(habitId);
                    if (!habit) return null; // Habit might have been deleted
                    return (
                      <div
                        key={habitId}
                        className="flex flex-row gap-2 items-center"
                      >
                        <p>
                          {i + 1}) {habit.title}
                        </p>
                        <DeleteConfirmationModal job={{ type: "habitFromFolder", habit: habit, id: folder.id}} />
                      </div>
                    );
                  })}
                </TableCell>
                {/* add habit to folder */}
                <TableCell>
                  <FolderSettingsHabitAdditionDialog folder={folder} />
                </TableCell>
                {/* rename folder */}
                <TableCell>
                  <FolderSettingsAdditionDialog mode="rename" folder={folder} />
                </TableCell>
                {/* delete folder */}
                <TableCell>
                  <DeleteConfirmationModal job={{ type: "folder", id: folder.id}} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
