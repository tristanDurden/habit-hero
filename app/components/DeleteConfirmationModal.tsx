import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { useHabitDeletion } from "../hooks/habits/useHabitDeletion";
import { CircleX, Trash } from "lucide-react";
import { useFolderDeletion } from "../hooks/folders/useFolderDeletion";
import { useHabitToFolderDeletion } from "../hooks/folders/useHabitToFolderDeletion";
import { Habit } from "@/lib/types";

type Props = {
    job: {
        type: "habit";
        id: string;
        habit?: never;
    } | {
        type: "folder";
        id: string;
        habit?: never;
    } | {
        type: "habitFromFolder";
        id: string;
        habit: Habit;
    }
}

export default function DeleteConfirmationModal({ job }: Props) {
    const deleteHabit = useHabitDeletion();
    const deleteFolder = useFolderDeletion();
    const deleteHabitFromFolder = useHabitToFolderDeletion();
    const handleDeletion = () => {
        if (job.type === "habit") {
            deleteHabit(job.id);
        } else if (job.type === "folder") {
            deleteFolder(job.id);
        } else if (job.type === "habitFromFolder") {
            deleteHabitFromFolder(job.habit, job.id);
        }
    }
    
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="cursor-pointer">
                    {job.type === "habitFromFolder" ? <CircleX size={20} /> : <Trash size={20} />}
            </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Delete {job.type === "habit" ? "Habit" : job.type === "folder" ? "Folder" : "Habit From Folder"}
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this {job.type === "habit" ? "habit" : job.type === "folder" ? "folder" : "habit from folder"}?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleDeletion} className="cursor-pointer" variant="destructive">
                        Delete {job.type === "habit" ? "Habit" : job.type === "folder" ? "Folder" : "Habit From Folder"}
                    </Button>
                    <DialogClose asChild>
                        <Button className="cursor-pointer" variant="secondary">
                        Cancel
                    </Button>
                    </DialogClose>
                    
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}