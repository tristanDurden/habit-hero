"use client"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { List } from "@/lib/types"
import ItemsTable from "./ItemsTable";
import ListItemAddUpdateModal from "./ListItemAddUpdateModal";
import DeleteConfirmationModal from "../misc/DeleteConfirmationModal";
import useListMutations from "@/app/hooks/lists/useListMutations";
import NewEditList from "./NewEditList";

type Props = {
    list: List;
}
  export default function ListCard({ list }: Props) {
    const { editList, deleteList, archiveList, unarchiveList } = useListMutations();
    return (
        <Card className="h-full flex flex-col justify-between w-full">
            <CardHeader>
                <CardTitle>{list.name},{list.type}</CardTitle>
                <CardDescription>{list.description}</CardDescription>
                <CardAction className="flex flex-row gap-2">
                    <NewEditList mode="edit" list={list} />
                    <DeleteConfirmationModal job={{ type: "list", id: list.id }} />
                </CardAction>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 flex-1">
                    <ItemsTable list={list} />
                    <ListItemAddUpdateModal mode="add" listId={list.id} />
                </div>
            </CardContent>
            <CardFooter>
                <p>{list.isArchived ? "Archived" : "Not archived"}</p>
            </CardFooter>
        </Card>
    )
  }