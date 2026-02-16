import { mergeServerListsToLocal } from "@/lib/onlineFunc";
import type { List } from "@/lib/types";
import type { QueuedOp } from "@/lib/queuedOps";

// ─── helpers ───────────────────────────────────────────────────────

/** Build a fake dbListWithItems (matches Prisma shape returned by include: { items: true }) */
function makeDbList(overrides: Record<string, unknown> = {}) {
  return {
    id: "list-1",
    name: "Server List",
    description: "desc",
    type: "tasks",
    isArchived: false,
    createdAt: 100,       // seconds in DB
    updatedAt: 100,       // seconds in DB
    userId: "user-1",
    items: [],
    ...overrides,
  } as any;              // cast – we don't need the full Prisma type
}

function makeUiList(overrides: Partial<List> = {}): List {
  return {
    id: "list-1",
    name: "Local List",
    description: "desc",
    type: "tasks",
    isArchived: false,
    createdAt: 100_000,   // millis in UI
    updatedAt: 100_000,   // millis in UI
    items: [],
    ...overrides,
  };
}

function makeQueuedOp(type: string, payload: unknown): QueuedOp {
  return { type, payload, timestamp: new Date().toISOString() } as QueuedOp;
}

// ─── tests ─────────────────────────────────────────────────────────

describe("mergeServerListsToLocal", () => {

  // ── basic merging ────────────────────────────────────────────────

  it("returns server lists when local is empty", () => {
    const server = [makeDbList({ id: "s1", name: "Server" })];
    const result = mergeServerListsToLocal(server, [], []);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("s1");
    expect(result[0].name).toBe("Server");
  });

  it("returns local lists when server is empty and no queue", () => {
    const local = [makeUiList({ id: "l1", name: "Local" })];
    const result = mergeServerListsToLocal([], local, []);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("l1");
  });

  it("returns empty when both are empty", () => {
    const result = mergeServerListsToLocal([], [], []);
    expect(result).toHaveLength(0);
  });

  it("merges non-overlapping server and local lists", () => {
    const server = [makeDbList({ id: "s1" })];
    const local = [makeUiList({ id: "l1" })];
    const result = mergeServerListsToLocal(server, local, []);

    expect(result).toHaveLength(2);
    const ids = result.map((l) => l.id).sort();
    expect(ids).toEqual(["l1", "s1"]);
  });

  // ── BUG: timestamp comparison missing ────────────────────────────

  it("prefers server when server updatedAt (converted to ms) is newer", () => {
    // Server has updatedAt = 999 seconds → 999_000 millis after conversion
    const server = [makeDbList({ id: "shared", name: "Server Version", updatedAt: 999 })];
    // Local has older updatedAt (1_000 ms < 999_000 ms)
    const local = [makeUiList({ id: "shared", name: "Local Version", updatedAt: 1_000 })];
    const result = mergeServerListsToLocal(server, local, []);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Server Version"); // server wins (999_000 > 1_000)
  });

  // ── queue-aware merging ──────────────────────────────────────────

  it("keeps a local-only list if it has a queued CREATE", () => {
    const local = [makeUiList({ id: "new-list" })];
    const queue = [makeQueuedOp("LIST_CREATE", { id: "new-list", name: "New" })];
    const result = mergeServerListsToLocal([], local, queue);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("new-list");
  });

  it("removes a local-only list if it has a queued DELETE", () => {
    const local = [makeUiList({ id: "doomed" })];
    const queue = [makeQueuedOp("LIST_DELETE", { id: "doomed" })];
    const result = mergeServerListsToLocal([], local, queue);

    expect(result).toHaveLength(0);
  });

  it("keeps a local-only list if it has a queued UPDATE (not yet synced)", () => {
    const local = [makeUiList({ id: "edited" })];
    const queue = [makeQueuedOp("LIST_UPDATE", { id: "edited", name: "Edited" })];
    const result = mergeServerListsToLocal([], local, queue);

    // No CREATE in queue, no DELETE — so it's kept as-is (orphan rule)
    expect(result).toHaveLength(1);
  });

  it("keeps orphaned local lists with no queue ops (graceful keep)", () => {
    const local = [makeUiList({ id: "orphan" })];
    const result = mergeServerListsToLocal([], local, []);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("orphan");
  });

  // ── items pass through ───────────────────────────────────────────

  it("converts server list items to UI format", () => {
    const dbItem = {
      id: "item-1",
      listId: "list-1",
      name: "Milk",
      description: null,
      completed: false,
      position: 0,
      priority: null,
      dueDate: null,
      quantity: null,
      unit: null,
      createdAt: 50,
      updatedAt: 50,
    };
    const server = [makeDbList({ id: "list-1", items: [dbItem] })];
    const result = mergeServerListsToLocal(server, [], []);

    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].name).toBe("Milk");
    // createdAt should be converted from seconds to millis
    expect(result[0].items[0].createdAt).toBe(50_000);
  });
});
