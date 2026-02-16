import { mergeServerListsToLocal } from "@/lib/onlineFunc";
import type { List, ListItem } from "@/lib/types";
import type { dbListWithItems } from "@/lib/dbformatting";

// ── helpers ──────────────────────────────────────────────────────────────────

const makeUiList = (overrides: Partial<List> = {}): List => ({
    id: "list-1",
    name: "Groceries",
    description: "Weekly groceries",
    items: [],
    type: "shopping",
    createdAt: 1_000_000, // millis
    updatedAt: 1_000_000,
    isArchived: false,
    ...overrides,
});

const makeDbList = (overrides: Partial<dbListWithItems> = {}): dbListWithItems => ({
    id: "list-1",
    name: "Groceries",
    description: "Weekly groceries",
    type: "shopping",
    isArchived: false,
    createdAt: 1000, // seconds (DB stores seconds)
    updatedAt: 1000,
    userId: "user-1",
    items: [],
    ...overrides,
});

const makeUiItem = (overrides: Partial<ListItem> = {}): ListItem => ({
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
    createdAt: 1_000_000,
    updatedAt: 1_000_000,
    ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────

describe("mergeServerListsToLocal", () => {
    // ── Basic merging ──

    it("returns server lists when local is empty", () => {
        const serverLists = [makeDbList({ id: "list-1" })];
        const result = mergeServerListsToLocal(serverLists, [], []);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("list-1");
    });

    it("returns local lists when server is empty and no queue ops", () => {
        const localLists = [makeUiList({ id: "list-1" })];
        const result = mergeServerListsToLocal([], localLists, []);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("list-1");
    });

    it("returns empty when both are empty", () => {
        const result = mergeServerListsToLocal([], [], []);
        expect(result).toHaveLength(0);
    });

    it("merges non-overlapping lists from server and local", () => {
        const serverLists = [makeDbList({ id: "server-list" })];
        const localLists = [makeUiList({ id: "local-list" })];
        const result = mergeServerListsToLocal(serverLists, localLists, []);

        expect(result).toHaveLength(2);
        const ids = result.map((l) => l.id);
        expect(ids).toContain("server-list");
        expect(ids).toContain("local-list");
    });

    // ── Timestamp comparison (BUG: current implementation doesn't compare!) ──

    it("prefers server version when server is newer", () => {
        const serverLists = [
            makeDbList({ id: "list-1", name: "Server Version", updatedAt: 5000 }), // 5000 seconds → 5_000_000 millis
        ];
        const localLists = [
            makeUiList({ id: "list-1", name: "Local Version", updatedAt: 1_000_000 }), // 1_000_000 millis
        ];
        const result = mergeServerListsToLocal(serverLists, localLists, []);

        expect(result).toHaveLength(1);
        // Server is newer (5_000_000 > 1_000_000) so server wins
        expect(result[0].name).toBe("Server Version");
    });

    it("should keep local version when local is newer", () => {
        const serverLists = [
            makeDbList({ id: "list-1", name: "Server Old", updatedAt: 1 }), // 1 second → 1000 millis
        ];
        const localLists = [
            makeUiList({ id: "list-1", name: "Local New", updatedAt: 9_000_000 }),
        ];
        const result = mergeServerListsToLocal(serverLists, localLists, []);

        expect(result).toHaveLength(1);
        // Local is newer, should keep local — this actually works by accident
        // because the server version is only set when local doesn't exist
        expect(result[0].name).toBe("Local New");
    });

    // ── Queue-aware merging ──

    it("keeps local-only list that is queued for CREATE", () => {
        const localLists = [makeUiList({ id: "pending-list" })];
        const queue = [
            {
                type: "LIST_CREATE" as const,
                payload: makeUiList({ id: "pending-list" }),
                timestamp: new Date().toISOString(),
            },
        ];
        const result = mergeServerListsToLocal([], localLists, queue);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("pending-list");
    });

    it("removes local-only list that is queued for DELETE", () => {
        const localLists = [makeUiList({ id: "deleted-list" })];
        const queue = [
            {
                type: "LIST_DELETE" as const,
                payload: { id: "deleted-list" },
                timestamp: new Date().toISOString(),
            },
        ];
        const result = mergeServerListsToLocal([], localLists, queue);

        expect(result).toHaveLength(0);
    });

    it("keeps orphaned local list (no queue, not on server)", () => {
        const localLists = [makeUiList({ id: "orphan" })];
        const result = mergeServerListsToLocal([], localLists, []);

        // Current behavior: kept (will sync later if needed)
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("orphan");
    });

    // ── Items pass-through ──

    it("converts server list items to UI format", () => {
        const serverLists = [
            makeDbList({
                id: "list-1",
                items: [
                    {
                        id: "item-1",
                        listId: "list-1",
                        name: "Milk",
                        description: "2%",
                        position: 0,
                        completed: false,
                        priority: "high",
                        dueDate: null,
                        quantity: 1,
                        unit: "L",
                        createdAt: 1000,
                        updatedAt: 1000,
                    },
                ],
            }),
        ];
        const result = mergeServerListsToLocal(serverLists, [], []);

        expect(result[0].items).toHaveLength(1);
        expect(result[0].items[0].name).toBe("Milk");
        // Verify seconds → millis conversion happened
        expect(result[0].items[0].updatedAt).toBe(1_000_000);
    });

    // ── Multiple lists ──

    it("handles mix of new server, existing overlap, and local-only correctly", () => {
        const serverLists = [
            makeDbList({ id: "shared", name: "Shared", updatedAt: 1 }),
            makeDbList({ id: "server-only", name: "Server Only" }),
        ];
        const localLists = [
            makeUiList({ id: "shared", name: "Shared Local", updatedAt: 5000 }),
            makeUiList({ id: "local-only", name: "Local Only" }),
        ];
        const result = mergeServerListsToLocal(serverLists, localLists, []);

        expect(result).toHaveLength(3);
        const ids = result.map((l) => l.id);
        expect(ids).toContain("shared");
        expect(ids).toContain("server-only");
        expect(ids).toContain("local-only");
    });
});
