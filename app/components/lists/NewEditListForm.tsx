"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddDefaultList, List } from "@/lib/types";
import { useState } from "react";
import useListMutations from "@/app/hooks/lists/useListMutations";

type Props = {
    mode: "add" | "edit";
    list?: List;
    onDone?: () => void;
}

export default function NewEditListForm({ mode, list, onDone }: Props) {

    const { createList, editList } = useListMutations();
    const [form, setForm] = useState<List>(
        mode === "edit" && list ? { ...list } : { ...AddDefaultList }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    const handleTypeChange = (value: string) => {
        setForm((prev) => ({ ...prev, type: value as "tasks" | "shopping" | "notes" }));
    }

    const handleSubmit = () => {
        const now = Math.floor(Date.now() / 1000);
        if (mode === "edit") {
            editList({
                ...form,
                updatedAt: now,
            });
        } else {
            createList({
                ...form,
                id: crypto.randomUUID(),
                createdAt: now,
                updatedAt: now,
            });
        }
        onDone?.();
    }
    
    return (
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
                <Label>List Name</Label>
                <Input name="name" type="text" value={form.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label>List Description</Label>
                <Input name="description" type="text" value={form.description} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label>List Type</Label>
                <Select value={form.type} onValueChange={handleTypeChange} disabled={mode === "edit"}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select List Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="tasks">Tasks</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="notes">Notes</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button type="button" onClick={handleSubmit}>
                {mode === "edit" ? "Save Changes" : "Create List"}
            </Button>
        </form>
    )
}
