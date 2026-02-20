import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/app/actions';
import { frequencySplit, scheduleSplit } from '@/lib/dbformatting';
import { getWeekDay, getMonthDay } from '@/lib/types';

// Protect the cron endpoint with a secret
function isAuthorized(req: NextRequest): boolean {
    const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
    return secret === process.env.CRON_SECRET;
}

// Check if a habit is scheduled for today based on its frequency/schedule
function isScheduledForToday(frequency: string, schedule: string): boolean {
    const [, unit] = frequencySplit(frequency);
    const today = new Date();

    if (unit === 'day') return true;

    if (unit === 'week') {
        const scheduleDates = scheduleSplit(schedule);
        const scheduledWeekdays = scheduleDates.map((d) => getWeekDay(d));
        return scheduledWeekdays.includes(getWeekDay(today));
    }

    if (unit === 'month') {
        const scheduleDates = scheduleSplit(schedule);
        const scheduledMonthDays = scheduleDates.map((d) => getMonthDay(d));
        return scheduledMonthDays.includes(getMonthDay(today));
    }

    return false;
}

// Check if a streak is at risk (not completed today and streak > 0)
function isStreakAtRisk(habit: { streak: number; doneToday: boolean }): boolean {
    return habit.streak > 0 && !habit.doneToday;
}

type NotificationMessage = {
    title: string;
    body: string;
};

// Build notification messages for a user based on their habits
function buildNotifications(habits: {
    id: string;
    title: string;
    frequency: string;
    schedule: string;
    streak: number;
    doneToday: boolean;
    lastCompleted: number;
}[]): NotificationMessage[] {
    const notifications: NotificationMessage[] = [];

    // Filter habits scheduled for today
    const todaysHabits = habits.filter((h) => isScheduledForToday(h.frequency, h.schedule));
    const incompleteHabits = todaysHabits.filter((h) => !h.doneToday);
    const streaksAtRisk = incompleteHabits.filter((h) => isStreakAtRisk(h));

    // Priority 1: Streak at risk (most urgent)
    if (streaksAtRisk.length > 0) {
        if (streaksAtRisk.length === 1) {
            const h = streaksAtRisk[0];
            notifications.push({
                title: '🔥 Streak at risk!',
                body: `Don't lose your ${h.streak}-day streak on "${h.title}"! Complete it today.`,
            });
        } else {
            const names = streaksAtRisk.map((h) => h.title).join(', ');
            notifications.push({
                title: '🔥 Streaks at risk!',
                body: `You have ${streaksAtRisk.length} habits with streaks at risk: ${names}`,
            });
        }
        return notifications;
    }

    // Priority 2: Daily reminder for incomplete habits
    if (incompleteHabits.length > 0) {
        if (incompleteHabits.length === 1) {
            notifications.push({
                title: '📋 Habit reminder',
                body: `Don't forget to complete "${incompleteHabits[0].title}" today!`,
            });
        } else {
            notifications.push({
                title: '📋 Habit reminder',
                body: `You have ${incompleteHabits.length} habits to complete today. Let's go! 💪`,
            });
        }
        return notifications;
    }

    // Priority 3: All done! (only send if user has habits for today)
    if (todaysHabits.length > 0 && incompleteHabits.length === 0) {
        notifications.push({
            title: '🎉 All done!',
            body: `You've completed all your habits for today. Amazing work!`,
        });
        return notifications;
    }

    return notifications;
}

export async function GET(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get all users that have push subscriptions (no point checking users without them)
        const usersWithSubscriptions = await prisma.user.findMany({
            where: {
                pushSubscriptions: { some: {} },
            },
            include: {
                habits: true,
            },
        });

        let sent = 0;
        let skipped = 0;

        for (const user of usersWithSubscriptions) {
            const notifications = buildNotifications(user.habits);

            if (notifications.length === 0) {
                skipped++;
                continue;
            }

            // Send the first (highest priority) notification
            const notif = notifications[0];
            await sendNotification(user.id, notif.body, notif.title);
            sent++;
        }

        return NextResponse.json({
            success: true,
            sent,
            skipped,
            totalUsers: usersWithSubscriptions.length,
        });
    } catch (error) {
        console.error('Cron notification error:', error);
        return NextResponse.json(
            { error: 'Failed to send notifications' },
            { status: 500 }
        );
    }
}
