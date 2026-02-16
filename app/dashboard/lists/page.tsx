"use client"
import ListCard from "@/app/components/lists/ListCard"
import useListsStore from "@/app/listsStore"
import { Button } from "@/components/ui/button"
import NewEditList from "@/app/components/lists/NewEditList"
import useListSync from "@/app/hooks/lists/useListSync"



export default function ListsPage() {
    useListSync();
    const lists = useListsStore((s) => s.lists)
    return (
        <div className="p-6 gap-3 flex flex-col">
            <NewEditList mode="add" />
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 justify-items-center md:justify-items-stretch">
                {lists.map((list) => (
                    <ListCard key={list.id} list={list} />
                ))}
            </div>
            
        </div>
    )
}