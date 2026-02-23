"use client"
import PushNotificationPicker from "@/app/components/calendars/PushNotificationPicker";
import PushNotificationManager from "@/app/pwa/PushNotificationManager";



export default function SettingsPage() {
    return (
        <div className="p-6 gap-3 flex flex-col">
            <h1 className="text-2xl font-bold">Settings</h1>
            <div className="flex flex-col gap-2">
                <PushNotificationManager/>
                <PushNotificationPicker />
            </div>
        </div>
    )
}