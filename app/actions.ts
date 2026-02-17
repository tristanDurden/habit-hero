'use server'

import { prisma } from '@/lib/prisma';
import webpush, { PushSubscription } from 'web-push'
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

webpush.setVapidDetails(
    '<mailto:thelossofsight@gmail.com>',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)


export async function subscribeUser(sub: { endpoint: string, p256dh: string, auth: string }) {
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
    await prisma.pushSubscription.delete({
        where: { endpoint },
    })
    return { success: true }
}
export async function sendNotification(userId: string, message: string) {
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId },
    })

    if (subscriptions.length === 0) {
        throw new Error('No subscriptions available')
    }

    const results = await Promise.allSettled(
        subscriptions.map((sub) =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                },
                JSON.stringify({
                    title: 'Habit Hero',
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