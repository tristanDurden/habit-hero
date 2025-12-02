import { Habit } from "./types";


export type QueuedOpType = "CREATE" | "UPDATE" | "DELETE" | "LOGGING";

export type QueuedOp = {
    type: QueuedOpType,
    payload: Habit | {id:string} | {habitId: string, date: string, count: number},
    timestamp: string
}