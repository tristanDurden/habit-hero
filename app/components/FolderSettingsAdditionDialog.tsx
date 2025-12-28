import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import useHabitStore from "../habitStore";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Folder } from "@/lib/types";
import { useFolderCreation } from "../hooks/folders/useFolderCreation";
import { useFolderUpdate } from "../hooks/folders/useFolderUpdate";
import { useFolderDeletion } from "../hooks/folders/useFolderDeletion";
import { now, nowInSeconds } from "@/lib/timeCounter";

type Props =
  | {
      folder: Folder;
      mode: "rename";
    }
  | {
      mode: "add";
      folder?: never;
    };

export default function FolderSettingsAdditionDialog(props: Props) {
  // props consts
  const { mode } = props;
  // const for hooks
  const createFolder = useFolderCreation();
  const updateFolder = useFolderUpdate();
  // input state and dialog title and trigger
  const [folderName, setFolderName] = useState<string>(
    props.folder?.name || ""
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dialogTitle = mode === "add" ? "Add New Folder" : "Rename Folder";
  const dialogTrigger = mode === "add" ? "Add Folder" : "Rename Folder";
  // helper function to assert never
  function assertNever(x: never): never {
    throw new Error("unnexpected mode");
  }

  function handleRename(name: string) {
    if (mode === "add") return;
    updateFolder(props.folder);
  }

  function handleAddition(name: string) {
    const id: string = uuidv4();
    createFolder({ id: id, name: name, habitIds: [], updatedAt: now() });
  }

  function handleSubmit(name: string) {
    switch (mode) {
      case "add":
        handleAddition(name);
        break;

      case "rename":
        handleRename(name);
        break;

      default:
        assertNever(mode);
        break;
    }
    toast.success(name + " folder " + (mode === "add" ? "added" : "renamed"));
    setFolderName("");
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex flex-row gap-2 cursor-pointer p-0 m-0 items-center justify-center">
          {dialogTrigger}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Enter a name for your new folder."
              : "Enter a new name for this folder."}
          </DialogDescription>
        </DialogHeader>
        {/* Component with inputs */}
        <div className="flex w-full max-w-sm items-center gap-2">
          <Input
            type="text"
            value={folderName}
            placeholder="Enter the name of folder.."
            onChange={(e) => setFolderName(e.target.value)}
          />
          <Button type="submit" onClick={() => handleSubmit(folderName)}>
            {dialogTrigger}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
