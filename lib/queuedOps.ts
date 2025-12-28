import { HabitQueuedOp } from "./queuedHabitOps";
import { FolderQueuedOp } from "./queuedFolderOps";

export type QueuedOp = HabitQueuedOp | FolderQueuedOp;
