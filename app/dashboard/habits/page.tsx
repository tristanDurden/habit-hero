"use client";
import Tabs from "@/app/components/tabs/Tabs";
import NewHabitFlowButton from "@/app/components/habits/NewHabitFlowButton";


export default function HabitsPage() {
    return (
        <>
            <main className="flex-1 p-6">
                <Tabs />
            </main>
            <NewHabitFlowButton />
        </>
    )
}