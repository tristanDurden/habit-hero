'use server'

import { prisma } from '@/lib/prisma';
import webpush from 'web-push'
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

let vapidConfigured = false;

function ensureVapidConfigured() {
    if (!vapidConfigured) {
        webpush.setVapidDetails(
            'mailto:thelossofsight@gmail.com',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
            process.env.VAPID_PRIVATE_KEY!
        );
        vapidConfigured = true;
    }
}


export async function subscribeUser(sub: { endpoint: string, p256dh: string, auth: string, timezone?: string, notificationTime?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { success: false, error: 'Unauthorized' }
    }
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });
    if (!user) {
        return { success: false, error: 'User not found' }
    }

    // Update timezone and/or notificationTime if provided
    const userData: { timezone?: string; notificationTime?: string } = {};
    if (sub.timezone) userData.timezone = sub.timezone;
    if (sub.notificationTime) userData.notificationTime = sub.notificationTime;

    if (Object.keys(userData).length > 0) {
        await prisma.user.update({
            where: { id: user.id },
            data: userData,
        });
    }

    await prisma.pushSubscription.upsert({
        where: { endpoint: sub.endpoint },
        update: {
            p256dh: sub.p256dh,
            auth: sub.auth,
        },
        create: {
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth,
            userId: user.id,
            createdAt: new Date(),
        }
    })

    return { success: true }
}

export async function unsubscribeUser(endpoint: string) {
    await prisma.pushSubscription.deleteMany({
        where: { endpoint },
    })
    return { success: true }
}
export async function sendNotification(userId: string, message: string, title: string = 'Habit Hero') {
    ensureVapidConfigured();
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId },
    })

    if (subscriptions.length === 0) {
        return { success: false, error: 'No subscriptions available. Please subscribe first.' }
    }

    const results = await Promise.allSettled(
        subscriptions.map((sub) =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                },
                JSON.stringify({
                    title,
                    body: message,
                    icon: '/icons-habit-tracker/android-chrome-192x192.png',
                })
            )
        )
    )

    // Clean up expired/invalid subscriptions (410 Gone)
    for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'rejected') {
            await prisma.pushSubscription.delete({
                where: { id: subscriptions[i].id },
            }).catch(() => { })
        }
    }

    return { success: true }
}

export async function sendTestNotification(message: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { success: false, error: 'Unauthorized' }
    }
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });
    if (!user) {
        return { success: false, error: 'User not found' }
    }
    return sendNotification(user.id, message)
}

export async function getNotificationPreferences() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { success: false, error: 'Unauthorized' }
    }
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { timezone: true, notificationTime: true },
    });
    if (!user) {
        return { success: false, error: 'User not found' }
    }
    return {
        success: true,
        timezone: user.timezone,
        notificationTime: user.notificationTime,
    };
}

export async function updateNotificationPreferences(timezone?: string, notificationTime?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { success: false, error: 'Unauthorized' }
    }
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });
    if (!user) {
        return { success: false, error: 'User not found' }
    }
    const userData: { timezone?: string; notificationTime?: string } = {};
    if (timezone) userData.timezone = timezone;
    if (notificationTime) userData.notificationTime = notificationTime;
    if (Object.keys(userData).length > 0) {
        await prisma.user.update({
            where: { id: user.id },
            data: userData,
        });
    }
    return { success: true };
}