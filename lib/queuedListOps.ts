import { List, ListItem } from "./types"


export type ListOpPayloadMap = {
    LIST_CREATE: List
    LIST_UPDATE: List
    LIST_DELETE: { id: string }
    LIST_ARCHIVE: { id: string }
    LIST_UNARCHIVE: { id: string }
    LIST_ITEM_CREATE: { item: ListItem }
    LIST_ITEM_UPDATE: { item: ListItem }
    LIST_ITEM_DELETE: { id: string }
    LIST_ITEM_TOGGLE: { item: ListItem }
}

export type ListQueuedOp = {
    [K in keyof ListOpPayloadMap]: {
        type: K;
        payload: ListOpPayloadMap[K];
        timestamp: string;
    }
}[keyof ListOpPayloadMap];