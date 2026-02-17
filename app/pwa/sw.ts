/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope &
    typeof globalThis &
    SerwistGlobalConfig & {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    };

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache,
});

// Push notification handler
self.addEventListener("push", (event: PushEvent) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || "/icon.png",
            badge: "/badge.png",
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: "2",
            },
        } satisfies NotificationOptions & { vibrate: number[] };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener("notificationclick", (event: NotificationEvent) => {
    console.log("Notification click received.");
    event.notification.close();
    event.waitUntil(self.clients.openWindow(self.location.origin || "/"));
});

// Register all Serwist event listeners (install, activate, fetch)
serwist.addEventListeners();
