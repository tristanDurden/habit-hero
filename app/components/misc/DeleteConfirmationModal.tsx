import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import useHabitMutations from "../../hooks/habits/useHabitMutations";
import { CircleX, Trash } from "lucide-react";
import { useFolderDeletion } from "../../hooks/folders/useFolderDeletion";
import { useHabitToFolderDeletion } from "../../hooks/folders/useHabitToFolderDeletion";
import { Habit } from "@/lib/types";
import useListMutations from "../../hooks/lists/useListMutations";

type Props = {
    job: {
        type: "habit";
        id: string;
        habit?: never;
        listId?: never;
    } | {
        type: "folder";
        id: string;
        habit?: never;
        listId?: never;
    } | {
        type: "habitFromFolder";
        id: string;
        habit: Habit;
        listId?: never;
    } | {
        type: "list";
        id: string;
        habit?: never;
        listId?: never;
    } | {
        type: "listItem";
        listId: string;
        id: string;
        habit?: never;
    }
}

const labels: Record<Props["job"]["type"], string> = {
    habit: "Habit",
    folder: "Folder",
    habitFromFolder: "Habit From Folder",
    list: "List",
    listItem: "List Item",
};

export default function DeleteConfirmationModal({ job }: Props) {
    const { deleteHabit } = useHabitMutations();
    const deleteFolder = useFolderDeletion();
    const deleteHabitFromFolder = useHabitToFolderDeletion();
    const { deleteList, deleteListItem } = useListMutations();
    const label = labels[job.type];

    const deletions: Record<Props["job"]["type"], () => void> = {
        habit: () => deleteHabit(job.id),
        folder: () => deleteFolder(job.id),
        habitFromFolder: () => deleteHabitFromFolder((job as Extract<Props["job"], { type: "habitFromFolder" }>).habit, job.id),
        list: () => deleteList(job.id),
        listItem: () => deleteListItem((job as Extract<Props["job"], { type: "listItem" }>).listId, job.id),
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="cursor-pointer">
                    {job.type === "habitFromFolder" ? <CircleX size={20} /> : <Trash size={20} />}
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {label}</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this {label.toLowerCase()}?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={deletions[job.type]} className="cursor-pointer" variant="destructive">
                        Delete {label}
                    </Button>
                    <DialogClose asChild>
                        <Button className="cursor-pointer" variant="secondary">
                            Cancel
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}