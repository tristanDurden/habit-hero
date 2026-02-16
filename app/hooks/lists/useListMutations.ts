import useHabitStore from "@/app/habitStore";
import useListsStore from "@/app/listsStore";
import { useOnlineStatus } from "@/app/providers/online-status";
import { nowDate } from "@/lib/timeCounter";
import { List, ListItem } from "@/lib/types";
import { toast } from "sonner";

export default function useListMutations() {
    const { isOnline } = useOnlineStatus();
    const pushQueue = useHabitStore((s) => s.pushQueue);

    const addList = useListsStore((s) => s.addList);
    const storeUpdateList = useListsStore((s) => s.updateList);
    const storeDeleteList = useListsStore((s) => s.deleteList);
    const storeAddListItem = useListsStore((s) => s.addListItem);
    const storeUpdateListItem = useListsStore((s) => s.updateListItem);
    const storeDeleteListItem = useListsStore((s) => s.deleteListItem);
    const storeToggleListItem = useListsStore((s) => s.toggleListItem);
    const storeArchiveList = useListsStore((s) => s.archiveList);
    const storeUnarchiveList = useListsStore((s) => s.unarchiveList);
    const getList = useListsStore((s) => s.getList);

    const notify = new CustomEvent("listUpdated");

    // List CRUD

    async function createList(list: List) {
        if (isOnline) {
            try {
                const response = await fetch("/api/lists", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...list }),
                });
                if (!response.ok) {
                    throw new Error("Failed to create list");
                }
            } catch {
                toast.error("Failed to create list", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "LIST_CREATE",
                payload: list,
                timestamp: nowDate().toISOString(),
            });
        }
        addList(list);
        toast.success("List created successfully", {
            description: "You can now add items to this list",
            position: "top-center",
        });
        window.dispatchEvent(notify);
    }

    async function deleteList(id: string) {
        if (isOnline) {
            try {
                const response = await fetch(`/api/lists/${id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) {
                    throw new Error("Failed to delete list");
                }
            } catch {
                toast.error("Failed to delete list", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "LIST_DELETE",
                payload: { id },
                timestamp: nowDate().toISOString(),
            });
        }
        storeDeleteList(id);
        toast.success("List deleted successfully", {
            description: "You can now create a new list",
            position: "top-center",
        });
        window.dispatchEvent(notify);
    }

    async function editList(list: List) {
        if (isOnline) {
            try {
                const response = await fetch(`/api/lists/${list.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...list }),
                });
                if (!response.ok) {
                    throw new Error("Failed to update list");
                }
            } catch {
                toast.error("Failed to update list", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "LIST_UPDATE",
                payload: list,
                timestamp: nowDate().toISOString(),
            });
        }
        storeUpdateList(list);
        toast.success("List updated successfully", {
            description: "You can now use this list",
            position: "top-center",
        });
        window.dispatchEvent(notify);
    }

    // Archive / Unarchive

    async function archiveList(id: string) {
        const list = getList(id);
        if (!list) return;

        if (isOnline) {
            try {
                const response = await fetch(`/api/lists/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...list, isArchived: true }),
                });
                if (!response.ok) {
                    throw new Error("Failed to archive list");
                }
            } catch {
                toast.error("Failed to archive list", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "LIST_ARCHIVE",
                payload: { id },
                timestamp: nowDate().toISOString(),
            });
        }
        storeArchiveList(id);
        toast.success("List archived", { position: "top-center" });
        window.dispatchEvent(notify);
    }

    async function unarchiveList(id: string) {
        const list = getList(id);
        if (!list) return;

        if (isOnline) {
            try {
                const response = await fetch(`/api/lists/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...list, isArchived: false }),
                });
                if (!response.ok) {
                    throw new Error("Failed to unarchive list");
                }
            } catch {
                toast.error("Failed to unarchive list", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "LIST_UNARCHIVE",
                payload: { id },
                timestamp: nowDate().toISOString(),
            });
        }
        storeUnarchiveList(id);
        toast.success("List unarchived", { position: "top-center" });
        window.dispatchEvent(notify);
    }

    // ListItem CRUD

    async function addListItem(item: ListItem) {
        if (isOnline) {
            try {
                const response = await fetch(`/api/lists/${item.listId}/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...item }),
                });
                if (!response.ok) {
                    throw new Error("Failed to add item");
                }
            } catch {
                toast.error("Failed to add item", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "LIST_ITEM_CREATE",
                payload: { item },
                timestamp: nowDate().toISOString(),
            });
        }
        storeAddListItem(item);
        toast.success("Item added", { position: "top-center" });
        window.dispatchEvent(notify);
    }

    async function updateListItem(item: ListItem) {
        if (isOnline) {
            try {
                const response = await fetch(`/api/lists/${item.listId}/items/${item.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...item }),
                });
                if (!response.ok) {
                    throw new Error("Failed to update item");
                }
            } catch {
                toast.error("Failed to update item", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "LIST_ITEM_UPDATE",
                payload: { item },
                timestamp: nowDate().toISOString(),
            });
        }
        storeUpdateListItem(item);
        toast.success("Item updated", { position: "top-center" });
        window.dispatchEvent(notify);
    }

    async function deleteListItem(listId: string, itemId: string) {
        if (isOnline) {
            try {
                const response = await fetch(`/api/lists/${listId}/items/${itemId}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) {
                    throw new Error("Failed to delete item");
                }
            } catch {
                toast.error("Failed to delete item", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "LIST_ITEM_DELETE",
                payload: { id: itemId },
                timestamp: nowDate().toISOString(),
            });
        }
        storeDeleteListItem(itemId);
        toast.success("Item deleted", { position: "top-center" });
        window.dispatchEvent(notify);
    }

    async function toggleListItem(item: ListItem) {
        const toggled = { ...item, completed: !item.completed };
        if (isOnline) {
            try {
                const response = await fetch(`/api/lists/${item.listId}/items/${item.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(toggled),
                });
                if (!response.ok) {
                    throw new Error("Failed to toggle item");
                }
            } catch {
                toast.error("Failed to toggle item", {
                    description: "Please try again later",
                    position: "top-center",
                });
                return;
            }
        } else {
            pushQueue({
                type: "LIST_ITEM_TOGGLE",
                payload: { item },
                timestamp: nowDate().toISOString(),
            });
        }
        storeToggleListItem(item);
        window.dispatchEvent(notify);
    }

    return {
        // List
        createList,
        deleteList,
        editList,
        archiveList,
        unarchiveList,
        getList,
        // ListItem
        addListItem,
        updateListItem,
        deleteListItem,
        toggleListItem,
    };
}
