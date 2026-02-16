import { List, ListItem } from "@/lib/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const nowTs = () => Math.floor(Date.now() / 1000);

type ListsState = {
    lists: List[];
}

type ListsActions = {
    getList: (id: string) => List | undefined;
    addList: (list: List) => void;
    updateList: (list: List) => void;
    addListItem: (item: ListItem) => void;
    updateListItem: (item: ListItem) => void;
    deleteList: (id: string) => void;
    deleteListItem: (id: string) => void;
    toggleListItem: (item: ListItem) => void;
    archiveList: (id: string) => void;
    unarchiveList: (id: string) => void;
}

type ListsStore = ListsState & ListsActions;

const useListsStore = create<ListsStore>()(
    persist<ListsStore>(
        (set, get) => ({
            lists: [],
            addList: (list: List) => set((state) => ({ lists: [...state.lists, list] })),
            updateList: (list: List) => set((state) => ({
                lists: state.lists.map((l) => l.id === list.id ? { ...list, updatedAt: nowTs() } : l),
            })),
            addListItem: (item: ListItem) => set((state) => ({
                lists: state.lists.map((l) =>
                    l.id === item.listId
                        ? { ...l, items: [...l.items, item], updatedAt: nowTs() }
                        : l
                ),
            })),
            updateListItem: (item: ListItem) => set((state) => ({
                lists: state.lists.map((l) =>
                    l.id === item.listId
                        ? { ...l, items: l.items.map((i) => i.id === item.id ? item : i), updatedAt: nowTs() }
                        : l
                ),
            })),
            deleteList: (id: string) => set((state) => ({ lists: state.lists.filter((l) => l.id !== id) })),
            deleteListItem: (id: string) => set((state) => ({
                lists: state.lists.map((l) => {
                    const filtered = l.items.filter((i) => i.id !== id);
                    if (filtered.length === l.items.length) return l; // item wasn't in this list
                    return { ...l, items: filtered, updatedAt: nowTs() };
                }),
            })),
            toggleListItem: (item: ListItem) => set((state) => ({
                lists: state.lists.map((l) =>
                    l.id === item.listId
                        ? {
                            ...l,
                            items: l.items.map((i) => i.id === item.id ? { ...i, completed: !i.completed } : i),
                            updatedAt: nowTs(),
                        }
                        : l
                ),
            })),
            archiveList: (id: string) => set((state) => ({
                lists: state.lists.map((l) => l.id === id ? { ...l, isArchived: true, updatedAt: nowTs() } : l),
            })),
            unarchiveList: (id: string) => set((state) => ({
                lists: state.lists.map((l) => l.id === id ? { ...l, isArchived: false, updatedAt: nowTs() } : l),
            })),
            getList: (id: string) => get().lists.find((l) => l.id === id),
        }),
        {
            name: "lists-store",
        }
    )
);

export default useListsStore;