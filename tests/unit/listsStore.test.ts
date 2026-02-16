import { act } from "@testing-library/react";
import type { List, ListItem } from "@/lib/types";

// Fresh store for every test – isolateModules + explicit reset prevents cross-test leakage
function getStore() {
  let mod: typeof import("@/app/listsStore");
  jest.isolateModules(() => {
    mod = require("@/app/listsStore");
  });
  const store = mod!.default;
  // Zustand persist may rehydrate from a shared in-memory storage;
  // force a clean slate so tests never see leftover state.
  store.setState({ lists: [] });
  return store;
}

const makeList = (overrides: Partial<List> = {}): List => ({
  id: "list-1",
  name: "Groceries",
  description: "Weekly groceries",
  items: [],
  type: "shopping",
  createdAt: 1000,
  updatedAt: 1000,
  isArchived: false,
  ...overrides,
});

const makeItem = (overrides: Partial<ListItem> = {}): ListItem => ({
  id: "item-1",
  listId: "list-1",
  name: "Milk",
  description: "2% milk",
  position: 0,
  completed: false,
  priority: "medium",
  dueDate: null,
  quantity: 2,
  unit: "L",
  createdAt: 1000,
  updatedAt: 1000,
  ...overrides,
});

describe("listsStore", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ──────────────────────────── List CRUD ────────────────────────────

  describe("addList", () => {
    it("adds a list to an empty store", () => {
      const useStore = getStore();
      const list = makeList();

      act(() => useStore.getState().addList(list));

      expect(useStore.getState().lists).toHaveLength(1);
      expect(useStore.getState().lists[0]).toEqual(list);
    });

    it("appends without removing existing lists", () => {
      const useStore = getStore();
      const list1 = makeList({ id: "list-1" });
      const list2 = makeList({ id: "list-2", name: "Tasks" });

      act(() => {
        useStore.getState().addList(list1);
        useStore.getState().addList(list2);
      });

      expect(useStore.getState().lists).toHaveLength(2);
    });
  });

  describe("updateList", () => {
    it("replaces the matching list by id", () => {
      const useStore = getStore();
      const list = makeList();
      act(() => useStore.getState().addList(list));

      const updated = { ...list, name: "Updated Groceries" };
      act(() => useStore.getState().updateList(updated));

      expect(useStore.getState().lists[0].name).toBe("Updated Groceries");
    });

    it("does not affect other lists", () => {
      const useStore = getStore();
      const list1 = makeList({ id: "list-1", name: "A" });
      const list2 = makeList({ id: "list-2", name: "B" });
      act(() => {
        useStore.getState().addList(list1);
        useStore.getState().addList(list2);
      });

      act(() => useStore.getState().updateList({ ...list1, name: "A+" }));

      expect(useStore.getState().lists[1].name).toBe("B");
    });
  });

  describe("deleteList", () => {
    it("removes the list by id", () => {
      const useStore = getStore();
      act(() => useStore.getState().addList(makeList()));
      expect(useStore.getState().lists).toHaveLength(1);

      act(() => useStore.getState().deleteList("list-1"));

      expect(useStore.getState().lists).toHaveLength(0);
    });

    it("is a no-op when the id doesn't exist", () => {
      const useStore = getStore();
      act(() => useStore.getState().addList(makeList()));

      act(() => useStore.getState().deleteList("non-existent"));

      expect(useStore.getState().lists).toHaveLength(1);
    });
  });

  // ──────────────────────────── Archive ────────────────────────────

  describe("archiveList / unarchiveList", () => {
    it("sets isArchived to true", () => {
      const useStore = getStore();
      act(() => useStore.getState().addList(makeList()));

      act(() => useStore.getState().archiveList("list-1"));

      expect(useStore.getState().lists[0].isArchived).toBe(true);
    });

    it("sets isArchived back to false", () => {
      const useStore = getStore();
      act(() => useStore.getState().addList(makeList({ isArchived: true })));

      act(() => useStore.getState().unarchiveList("list-1"));

      expect(useStore.getState().lists[0].isArchived).toBe(false);
    });
  });

  // ──────────────────────────── ListItem mutations ────────────────────────────

  describe("updateListItem", () => {
    it("updates an existing item inside the correct list", () => {
      const useStore = getStore();
      const item = makeItem();
      const list = makeList({ items: [item] });
      act(() => useStore.getState().addList(list));

      const updatedItem = { ...item, name: "Oat Milk", completed: true };
      act(() => useStore.getState().updateListItem(updatedItem));

      const result = useStore.getState().lists[0].items[0];
      expect(result.name).toBe("Oat Milk");
      expect(result.completed).toBe(true);
    });

    it("does NOT add a new item if it doesn't already exist (current behaviour)", () => {
      const useStore = getStore();
      const list = makeList({ items: [] });
      act(() => useStore.getState().addList(list));

      const newItem = makeItem({ id: "item-new" });
      act(() => useStore.getState().updateListItem(newItem));

      // BUG: updateListItem only maps, never pushes — so item count stays 0
      expect(useStore.getState().lists[0].items).toHaveLength(0);
    });
  });

  describe("deleteListItem", () => {
    it("removes the item from all lists", () => {
      const useStore = getStore();
      const item = makeItem();
      const list = makeList({ items: [item] });
      act(() => useStore.getState().addList(list));

      act(() => useStore.getState().deleteListItem("item-1"));

      expect(useStore.getState().lists[0].items).toHaveLength(0);
    });

    it("leaves other items intact", () => {
      const useStore = getStore();
      const item1 = makeItem({ id: "item-1" });
      const item2 = makeItem({ id: "item-2", name: "Bread" });
      const list = makeList({ items: [item1, item2] });
      act(() => useStore.getState().addList(list));

      act(() => useStore.getState().deleteListItem("item-1"));

      expect(useStore.getState().lists[0].items).toHaveLength(1);
      expect(useStore.getState().lists[0].items[0].id).toBe("item-2");
    });
  });

  describe("toggleListItem", () => {
    it("flips completed from false to true", () => {
      const useStore = getStore();
      const item = makeItem({ completed: false });
      const list = makeList({ items: [item] });
      act(() => useStore.getState().addList(list));

      act(() => useStore.getState().toggleListItem(item));

      expect(useStore.getState().lists[0].items[0].completed).toBe(true);
    });

    it("flips completed from true to false", () => {
      const useStore = getStore();
      const item = makeItem({ completed: true });
      const list = makeList({ items: [item] });
      act(() => useStore.getState().addList(list));

      act(() => useStore.getState().toggleListItem(item));

      expect(useStore.getState().lists[0].items[0].completed).toBe(false);
    });

    it("does not affect items in other lists", () => {
      const useStore = getStore();
      const item1 = makeItem({ id: "item-1", listId: "list-1", completed: false });
      const item2 = makeItem({ id: "item-2", listId: "list-2", completed: false });
      const list1 = makeList({ id: "list-1", items: [item1] });
      const list2 = makeList({ id: "list-2", items: [item2] });
      act(() => {
        useStore.getState().addList(list1);
        useStore.getState().addList(list2);
      });

      act(() => useStore.getState().toggleListItem(item1));

      expect(useStore.getState().lists[0].items[0].completed).toBe(true);
      expect(useStore.getState().lists[1].items[0].completed).toBe(false);
    });
  });

  // ──────────────────────────── addListItem action ────────────────────────

  describe("addListItem", () => {
    it("store exposes addListItem action", () => {
      const useStore = getStore();
      const state = useStore.getState();

      expect(typeof state.addListItem).toBe("function");
    });

    it("adds a new item to the correct list", () => {
      const useStore = getStore();
      const list = makeList({ items: [] });
      act(() => useStore.getState().addList(list));

      const newItem = makeItem({ id: "brand-new" });
      act(() => useStore.getState().addListItem(newItem));

      expect(useStore.getState().lists[0].items).toHaveLength(1);
      expect(useStore.getState().lists[0].items[0].id).toBe("brand-new");
    });

    it("bumps the list's updatedAt", () => {
      const useStore = getStore();
      const list = makeList({ items: [], updatedAt: 1000 });
      act(() => useStore.getState().addList(list));

      const newItem = makeItem({ id: "new-item" });
      act(() => useStore.getState().addListItem(newItem));

      expect(useStore.getState().lists[0].updatedAt).toBeGreaterThan(1000);
    });

    it("does not affect other lists", () => {
      const useStore = getStore();
      const list1 = makeList({ id: "iso-list-a", items: [] });
      const list2 = makeList({ id: "iso-list-b", items: [] });
      act(() => {
        useStore.getState().addList(list1);
        useStore.getState().addList(list2);
      });

      const newItem = makeItem({ id: "iso-item", listId: "iso-list-a" });
      act(() => useStore.getState().addListItem(newItem));

      const listA = useStore.getState().lists.find((l) => l.id === "iso-list-a")!;
      const listB = useStore.getState().lists.find((l) => l.id === "iso-list-b")!;
      expect(listA.items).toHaveLength(1);
      expect(listB.items).toHaveLength(0);
    });

    it("updateListItem still only maps (does not add new items)", () => {
      const useStore = getStore();
      const list = makeList({ id: "iso-map-test", items: [] });
      act(() => useStore.getState().addList(list));

      const newItem = makeItem({ id: "iso-nonexistent", listId: "iso-map-test" });
      act(() => useStore.getState().updateListItem(newItem));

      // updateListItem only maps over existing items — correct behavior
      const target = useStore.getState().lists.find((l) => l.id === "iso-map-test")!;
      expect(target.items).toHaveLength(0);
    });
  });

  // ──────────────────────────── updatedAt consistency ────────────────────

  describe("updatedAt tracking", () => {
    it("toggleListItem bumps the list's updatedAt", () => {
      const useStore = getStore();
      const item = makeItem({ completed: false });
      const list = makeList({ items: [item], updatedAt: 1000 });
      act(() => useStore.getState().addList(list));

      act(() => useStore.getState().toggleListItem(item));

      expect(useStore.getState().lists[0].updatedAt).toBeGreaterThan(1000);
    });

    it("archiveList bumps updatedAt", () => {
      const useStore = getStore();
      const list = makeList({ updatedAt: 1000 });
      act(() => useStore.getState().addList(list));

      act(() => useStore.getState().archiveList("list-1"));

      expect(useStore.getState().lists[0].updatedAt).toBeGreaterThan(1000);
    });

    it("deleteListItem bumps the list's updatedAt", () => {
      const useStore = getStore();
      const item = makeItem();
      const list = makeList({ items: [item], updatedAt: 1000 });
      act(() => useStore.getState().addList(list));

      act(() => useStore.getState().deleteListItem("item-1"));

      expect(useStore.getState().lists[0].updatedAt).toBeGreaterThan(1000);
    });

    it("updateListItem bumps the list's updatedAt", () => {
      const useStore = getStore();
      const item = makeItem();
      const list = makeList({ items: [item], updatedAt: 1000 });
      act(() => useStore.getState().addList(list));

      const updated = { ...item, name: "Updated" };
      act(() => useStore.getState().updateListItem(updated));

      expect(useStore.getState().lists[0].updatedAt).toBeGreaterThan(1000);
    });

    it("unarchiveList bumps updatedAt", () => {
      const useStore = getStore();
      const list = makeList({ isArchived: true, updatedAt: 1000 });
      act(() => useStore.getState().addList(list));

      act(() => useStore.getState().unarchiveList("list-1"));

      expect(useStore.getState().lists[0].updatedAt).toBeGreaterThan(1000);
    });
  });

  // ──────────────────────────── getList helper ────────────────────────────

  describe("getList", () => {
    it("returns the correct list", () => {
      const useStore = getStore();
      const list = makeList();
      act(() => useStore.getState().addList(list));

      expect(useStore.getState().getList("list-1")).toEqual(list);
    });

    it("returns undefined for unknown id", () => {
      const useStore = getStore();
      expect(useStore.getState().getList("nope")).toBeUndefined();
    });
  });
});
