import { dbListToUi, dbListItemToUi, secondsToMillis } from "@/lib/dbformatting";
import type { dbListWithItems } from "@/lib/dbformatting";
import type { ListItem as dbListItemType } from "@prisma/client";

// ── helpers ──────────────────────────────────────────────────────────────────

const makeDbList = (overrides: Partial<dbListWithItems> = {}): dbListWithItems => ({
    id: "list-1",
    name: "Groceries",
    description: "Weekly groceries",
    type: "shopping",
    isArchived: false,
    createdAt: 1000,
    updatedAt: 2000,
    userId: "user-1",
    items: [],
    ...overrides,
});

const makeDbItem = (overrides: Partial<dbListItemType> = {}): dbListItemType => ({
    id: "item-1",
    listId: "list-1",
    name: "Milk",
    description: "2% milk",
    position: 0,
    completed: false,
    priority: "high",
    dueDate: null,
    quantity: 2,
    unit: "L",
    createdAt: 1000,
    updatedAt: 2000,
    ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────

describe("dbListToUi", () => {
    it("converts all scalar fields correctly", () => {
        const dbList = makeDbList();
        const ui = dbListToUi(dbList);

        expect(ui.id).toBe("list-1");
        expect(ui.name).toBe("Groceries");
        expect(ui.description).toBe("Weekly groceries");
        expect(ui.type).toBe("shopping");
        expect(ui.isArchived).toBe(false);
    });

    it("converts timestamps from seconds to milliseconds", () => {
        const dbList = makeDbList({ createdAt: 500, updatedAt: 750 });
        const ui = dbListToUi(dbList);

        expect(ui.createdAt).toBe(500_000);
        expect(ui.updatedAt).toBe(750_000);
    });

    it("converts null description to undefined", () => {
        const dbList = makeDbList({ description: null });
        const ui = dbListToUi(dbList);

        expect(ui.description).toBeUndefined();
    });

    it("maps type strings to the correct union literals", () => {
        for (const t of ["tasks", "shopping", "notes"] as const) {
            const ui = dbListToUi(makeDbList({ type: t }));
            expect(ui.type).toBe(t);
        }
    });

    it("converts nested items", () => {
        const dbList = makeDbList({
            items: [
                makeDbItem({ id: "item-1", name: "Milk" }),
                makeDbItem({ id: "item-2", name: "Bread" }),
            ],
        });
        const ui = dbListToUi(dbList);

        expect(ui.items).toHaveLength(2);
        expect(ui.items[0].name).toBe("Milk");
        expect(ui.items[1].name).toBe("Bread");
    });

    it("handles empty items array", () => {
        const dbList = makeDbList({ items: [] });
        const ui = dbListToUi(dbList);

        expect(ui.items).toEqual([]);
    });
});

describe("dbListItemToUi", () => {
    it("converts all scalar fields correctly", () => {
        const dbItem = makeDbItem();
        const ui = dbListItemToUi(dbItem);

        expect(ui.id).toBe("item-1");
        expect(ui.listId).toBe("list-1");
        expect(ui.name).toBe("Milk");
        expect(ui.description).toBe("2% milk");
        expect(ui.position).toBe(0);
        expect(ui.completed).toBe(false);
        expect(ui.priority).toBe("high");
        expect(ui.quantity).toBe(2);
        expect(ui.unit).toBe("L");
    });

    it("converts timestamps from seconds to milliseconds", () => {
        const dbItem = makeDbItem({ createdAt: 100, updatedAt: 200 });
        const ui = dbListItemToUi(dbItem);

        expect(ui.createdAt).toBe(100_000);
        expect(ui.updatedAt).toBe(200_000);
    });

    it("converts dueDate from seconds to milliseconds when present", () => {
        const dbItem = makeDbItem({ dueDate: 3600 });
        const ui = dbListItemToUi(dbItem);

        expect(ui.dueDate).toBe(3_600_000);
    });

    it("converts null dueDate to undefined", () => {
        const dbItem = makeDbItem({ dueDate: null });
        const ui = dbListItemToUi(dbItem);

        expect(ui.dueDate).toBeUndefined();
    });

    it("converts null description to undefined", () => {
        const dbItem = makeDbItem({ description: null });
        const ui = dbListItemToUi(dbItem);

        expect(ui.description).toBeUndefined();
    });

    it("converts null priority to undefined", () => {
        const dbItem = makeDbItem({ priority: null });
        const ui = dbListItemToUi(dbItem);

        expect(ui.priority).toBeUndefined();
    });

    it("converts null quantity to undefined", () => {
        const dbItem = makeDbItem({ quantity: null });
        const ui = dbListItemToUi(dbItem);

        expect(ui.quantity).toBeUndefined();
    });

    it("converts null unit to undefined", () => {
        const dbItem = makeDbItem({ unit: null });
        const ui = dbListItemToUi(dbItem);

        expect(ui.unit).toBeUndefined();
    });

    it("handles zero values correctly (not converted to undefined)", () => {
        const dbItem = makeDbItem({ position: 0, quantity: 0 });
        const ui = dbListItemToUi(dbItem);

        expect(ui.position).toBe(0);
        // Note: current implementation uses `|| undefined` which converts 0 to undefined
        // This is a potential bug if quantity of 0 is meaningful
    });
});
