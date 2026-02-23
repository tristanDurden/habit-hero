"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit, Plus } from "lucide-react"
import NewListForm from "./NewEditListForm"
import { List } from "@/lib/types"
import { useState } from "react"

type Props = {
    mode: "add" | "edit"
    list?: List
    onCreated?: () => void
}

  export default function NewEditList({ mode, list, onCreated }: Props) {
    const [open, setOpen] = useState(false)
    const isEdit = mode === "edit"

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {isEdit ? (
                <Button variant="outline" className="cursor-pointer">
                    <Edit />
                </Button>
            ) : (
                <Button variant="outline" className="cursor-pointer p-0 m-0 items-center justify-center border-2 border-gray-300 rounded-md px-2 py-1">
                    <Plus /> New List
                </Button>
            )}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{isEdit ? "Edit List" : "New List"}</DialogTitle>
            <DialogDescription>
                {isEdit ? "Edit the details of your list." : "Create a new list to organize your tasks."}
            </DialogDescription>
            </DialogHeader>
            <NewListForm mode={mode} list={list} onDone={() => { setOpen(false); if (mode === "add") onCreated?.(); }} />
        </DialogContent>
    </Dialog>
    )
  }
