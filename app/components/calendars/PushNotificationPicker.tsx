"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getNotificationPreferences, updateNotificationPreferences } from "@/app/actions";

export default function PushNotificationPicker() {
    const [notificationTime, setNotificationTime] = useState<string>("20:00");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getNotificationPreferences().then((res) => {
            if (res.success && res.notificationTime) {
                setNotificationTime(res.notificationTime);
            }
        });
    }, []);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNotificationTime(e.target.value);
    }

    const onSave = async () => {
        setLoading(true);
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const result = await updateNotificationPreferences(timezone, notificationTime);
            if (result.success) {
                toast.success("Notification time saved", {
                    description: `You will receive notifications at ${notificationTime}`,
                    position: "top-center",
                });
            } else {
                toast.error("Failed to save notification time", {
                    description: result.error,
                    position: "top-center",
                });
            }
        } catch {
            toast.error("Failed to save notification time", {
                position: "top-center",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Push Notification Time</h2>
            <div className="flex flex-col gap-2">
                <Label htmlFor="notificationTime">Notification Time</Label>
                <Input id="notificationTime" 
                name="notificationTime" type="time" 
                value={notificationTime} onChange={onChange} 
                min="00:00" max="23:59" />
            </div>
            <Button onClick={onSave} disabled={loading}>
                {loading ? "Saving..." : "Save"}
            </Button>
        </div>
    )
}