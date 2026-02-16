"use client"

import useListsStore from "@/app/listsStore";
import useListMutations from "@/app/hooks/lists/useListMutations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListItem } from "@/lib/types";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";

type AddProps = {
    mode: "add";
    listId: string;
    item?: never;
}

type EditProps = {
    mode: "edit";
    listId: string;
    item: ListItem;
}

type Props = AddProps | EditProps;

export default function ListItemAddUpdateModal(props: Props) {
    const { mode, listId } = props;
    const isEdit = mode === "edit";

    const { addListItem, updateListItem } = useListMutations();
    const list = useListsStore((s) => s.getList(listId));

    const defaultForm: ListItem = {
        id: crypto.randomUUID(),
        listId: listId,
        name: "",
        description: "",
        completed: false,
        position: 0,
        dueDate: null,
        quantity: undefined,
        unit: undefined,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
    };

    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState<ListItem>(
        isEdit ? { ...props.item } : { ...defaultForm }
    );

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && isEdit) {
            setForm({ ...props.item });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        let parsed: string | number | undefined | null = value;
        if (name === "dueDate") {
            parsed = value ? new Date(value + "T00:00:00").getTime() : null;
        } else if (type === "number") {
            parsed = value === "" ? undefined : Number(value);
        }
        setForm((prev) => ({ ...prev, [name]: parsed }));
    };

    const handlePriorityChange = (value: string) => {
        setForm((prev) => ({ ...prev, priority: value as "low" | "medium" | "high" }));
    };

    const handleSubmit = () => {
        if (!list) return;
        const now = Math.floor(Date.now() / 1000);

        if (isEdit) {
            updateListItem({ ...form, updatedAt: now });
        } else {
            addListItem({ ...form, id: crypto.randomUUID(), createdAt: now, updatedAt: now });
            setForm({ ...defaultForm, id: crypto.randomUUID() });
        }
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Pencil className="size-4" /> Edit
                    </DropdownMenuItem>
                ) : (
                    <Button><Plus /></Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Item" : `Add Item to ${list?.name}`}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update the details of this item." : "Add a new item to the list."}
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label>Item Name</Label>
                        <Input name="name" type="text" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label>Item Description</Label>
                        <Input name="description" type="text" value={form.description ?? ""} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label>Item Priority</Label>
                        <Select value={form.priority} onValueChange={handlePriorityChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {list?.type === "shopping" && (
                        <div className="space-y-2">
                            <Label>Item Quantity</Label>
                            <Input name="quantity" type="number" value={form.quantity ?? ""} onChange={handleChange} />
                        </div>
                    )}
                    {list?.type === "shopping" && (
                        <div className="space-y-2">
                            <Label>Item Unit</Label>
                            <Input name="unit" type="text" value={form.unit ?? ""} onChange={handleChange} />
                        </div>
                    )}
                    {list?.type === "tasks" && (
                        <div className="space-y-2">
                            <Label>Item Due Date</Label>
                            <Input name="dueDate" type="date" value={form.dueDate ? new Date(form.dueDate).toISOString().slice(0, 10) : ""} onChange={handleChange} />
                        </div>
                    )}
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" onClick={handleSubmit}>
                            {isEdit ? "Save Changes" : "Add Item"}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
