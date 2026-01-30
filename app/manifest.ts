import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Habit Tracker',
        short_name: 'Habit Tracker',
        description: 'Track your habits like you like the work!',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            { "src": "/icons-habit-tracker/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
            { "src": "/icons-habit-tracker/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" },
            { "src": "/icons-habit-tracker/maskable-icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
            { "src": "/icons-habit-tracker/maskable-icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
        ]
    }
}