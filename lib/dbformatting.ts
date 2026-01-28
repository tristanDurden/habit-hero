import { Habit as dbHabit, Folder as dbFolder, HabitLog as dbHabitLog } from "@prisma/client";
import { frequencyTuple, Habit as HabitUi, Folder as uiFolder, HabitLog as uiHabitLog} from "@/lib/types";

export function scheduleConcat(array: Date[]): string {
    return Array.isArray(array) ? array.map((d: unknown) => {
          const dateObj = typeof d === "string" ? new Date(d) : new Date(d as Date);
          return dateObj.toISOString();
        })
        .join("/")
    : "";
}

export function frequencyConcat(frequency: frequencyTuple): string {
    return frequency.join("/");
}

export function millisToSeconds(millis: number): number {
    return Math.floor(millis / 1000);
}

export function scheduleSplit(schedule: string): Date[] {
    return schedule.split('/').map((item) => new Date(item));
}

export function frequencySplit(frequency: string): frequencyTuple {
    const parts = frequency.split('/');
    return [parts[0] as frequencyTuple[0], parts[1] as frequencyTuple[1]];
}

export function secondsToMillis(seconds: number): number {
    return seconds * 1000;
}

export function dbHabitToUi(dbHabit: dbHabit): HabitUi {
    const arraySchedule = scheduleSplit(dbHabit.schedule);
    const tupleFrequency = frequencySplit(dbHabit.frequency);
    const uiLastCompleted = secondsToMillis(dbHabit.lastCompleted);
    const uiUpdatedAt = secondsToMillis(dbHabit.updatedAt);
    return {
        id: dbHabit.id,
        title: dbHabit.title,
        description: dbHabit.description,
        frequency: tupleFrequency,
        schedule: arraySchedule,
        counter: dbHabit.counter,
        streak: dbHabit.streak,
        lastCompleted: uiLastCompleted,
        doneToday: dbHabit.doneToday,
        updatedAt: uiUpdatedAt
    }
}

export function uiHabitToDb(uiHabit: HabitUi, userId: string): dbHabit {
    const dbSchedule = scheduleConcat(uiHabit.schedule);
    const dbFrequency = frequencyConcat(uiHabit.frequency);
    const dbLastCompleted = millisToSeconds(uiHabit.lastCompleted);
    const dbUpdatedAt = millisToSeconds(uiHabit.updatedAt);
    
    return {
        id: uiHabit.id,
        title: uiHabit.title,
        description: uiHabit.description,
        frequency: dbFrequency,
        schedule: dbSchedule,
        counter: uiHabit.counter,
        streak: uiHabit.streak,
        lastCompleted: dbLastCompleted,
        doneToday: uiHabit.doneToday,
        userId: userId,
        updatedAt: dbUpdatedAt,
    };
}
export function dbFolderToUi(dbfolder: dbFolder): uiFolder {
    const uiHabitIds = dbfolder.habitIds;
    const uiUpdatedAt = secondsToMillis(dbfolder.updatedAt);
    return {
        id: dbfolder.id,
        name: dbfolder.name,
        habitIds: uiHabitIds as string[],
        updatedAt: uiUpdatedAt
    }
}
export function dbHabitLogToUi(dbHabitLog: dbHabitLog[]): uiHabitLog {
    const formattedLog: uiHabitLog = {};
    for (const entry of dbHabitLog) {
        if (!formattedLog[entry.habitId]) {
            formattedLog[entry.habitId] = [];
        }
        formattedLog[entry.habitId].push({
            date: entry.date,
            count: entry.count,
            duration: entry.duration,
        });
    }
    return formattedLog;
}