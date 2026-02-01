import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { useHabitDeletion } from "../hooks/habits/useHabitDeletion";
import { Trash } from "lucide-react";

type Props = {
    habitId: string;
}

export default function DeleteHabitConfirmationModal({ habitId}: Props) {
    const deleteHabit = useHabitDeletion();

    const handleDeletion = () => {
        deleteHabit(habitId);
    }
    
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="cursor-pointer">
              <Trash size={20} />
            </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Delete Habit
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this habit?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleDeletion} className="cursor-pointer" variant="destructive">
                        Delete
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