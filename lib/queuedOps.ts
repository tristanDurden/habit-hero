import { HabitQueuedOp } from "./queuedHabitOps";
import { FolderQueuedOp } from "./queuedFolderOps";
import { ListQueuedOp } from "./queuedListOps";

export type QueuedOp = HabitQueuedOp | FolderQueuedOp | ListQueuedOp;
