"use client"
import { useEffect, useState } from "react"
import { subscribeUser, unsubscribeUser, sendTestNotification } from '../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function getIsIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
}

function getIsStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true) // iOS Safari
}

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [permissionState, setPermissionState] = useState<NotificationPermission | null>(null)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
      const ios = getIsIOS()
      const standalone = getIsStandalone()
      setIsIOS(ios)
      setIsStandalone(standalone)

      // On iOS, push is only supported in standalone mode (installed PWA)
      if (ios && !standalone) {
        // Don't even try to register SW — push won't work in iOS Safari browser
        return
      }

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return
      }

      if ('Notification' in window) {
        setPermissionState(Notification.permission)
      }

      // Use navigator.serviceWorker.ready instead of manually re-registering
      // (Serwist already registers the SW via next.config)
      navigator.serviceWorker.ready
        .then((registration) => {
          setIsSupported(true)
          return registration.pushManager.getSubscription()
        })
        .then((sub) => {
          if (sub) setSubscription(sub)
        })
        .catch((err) => {
          console.error('Service worker ready failed:', err)
        })
    }, [])

    async function subscribeToPush() {
      setError(null)
      setLoading(true)

      try {
        // Check notification permission first
        if ('Notification' in window) {
          const permission = await Notification.requestPermission()
          setPermissionState(permission)

          if (permission === 'denied') {
            setError('Notification permission was denied. Please enable notifications in your browser/device settings and try again.')
            return
          }

          if (permission !== 'granted') {
            setError('Notification permission is required to subscribe to push notifications.')
            return
          }
        }

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidKey) {
          setError('Push notification configuration error. Please contact support.')
          console.error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set.')
          return
        }

        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })

        setSubscription(sub)
        const serializedSub = JSON.parse(JSON.stringify(sub))
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        await subscribeUser({
          endpoint: serializedSub.endpoint,
          p256dh: serializedSub.keys.p256dh,
          auth: serializedSub.keys.auth,
          timezone,
        })
      } catch (err: unknown) {
        console.error('Push subscription failed:', err)
        const error = err instanceof Error ? err : new Error('Unknown error')

        if (error.name === 'NotAllowedError') {
          setError('Notification permission was denied. Please enable notifications in your browser/device settings.')
        } else if (error.name === 'AbortError') {
          setError('Push subscription was cancelled. Please try again.')
        } else {
          setError(`Failed to subscribe: ${error.message}. Make sure notifications are allowed in your device settings.`)
        }
      } finally {
        setLoading(false)
      }
    }

    async function unsubscribeFromPush() {
      if (subscription) {
        try {
          const endpoint = subscription.endpoint
          await subscription.unsubscribe()
          setSubscription(null)
          await unsubscribeUser(endpoint)
        } catch (err: unknown) {
          console.error('Unsubscribe failed:', err)
          const error = err instanceof Error ? err : new Error('Unknown error')
          setError(`Failed to unsubscribe: ${error.message}`)
        }
      }
    }

    async function handleSendTestNotification() {
      if (subscription) {
        const result = await sendTestNotification(message)
        if (result?.error) {
          console.error('Failed to send notification:', result.error)
          alert(result.error)
          return
        }
        setMessage('')
      }
    }

    // iOS in browser (not installed as PWA) — show install instructions
    if (isIOS && !isStandalone) {
      return (
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Push Notifications</h2>
          <p className="text-sm text-muted-foreground">
            To receive push notifications on iOS, you need to install this app first:
          </p>
          <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
            <li>Tap the Share button <span role="img" aria-label="share">⎋</span> in Safari</li>
            <li>Select &ldquo;Add to Home Screen&rdquo; <span role="img" aria-label="plus">➕</span></li>
            <li>Open the app from your home screen</li>
            <li>Come back here to enable notifications</li>
          </ol>
        </div>
      )
    }

    // Notification permission denied — show how to fix
    if (permissionState === 'denied') {
      return (
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Push Notifications</h2>
          <p className="text-sm text-destructive">
            Notification permission is blocked. To enable push notifications:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {isIOS ? (
              <>
                <li>Open Settings → Habit Tracker → Notifications</li>
                <li>Enable &ldquo;Allow Notifications&rdquo;</li>
              </>
            ) : (
              <>
                <li>Tap the lock/info icon in your browser&apos;s address bar</li>
                <li>Find &ldquo;Notifications&rdquo; and change to &ldquo;Allow&rdquo;</li>
                <li>Reload the page and try again</li>
              </>
            )}
          </ul>
        </div>
      )
    }

    if (!isSupported) {
      return (
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Push Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Push notifications are not supported in this browser.
            {!isStandalone && ' Try installing the app or using Chrome/Edge.'}
          </p>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Push Notifications</h2>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {subscription ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">You are subscribed to push notifications.</p>
            <Button onClick={unsubscribeFromPush}>Unsubscribe</Button>
            <Input
              type="text"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={handleSendTestNotification}>Send Test</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">You are not subscribed to push notifications.</p>
            <Button onClick={subscribeToPush} disabled={loading}>
              {loading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </div>
        )}
      </div>
    )
  }
