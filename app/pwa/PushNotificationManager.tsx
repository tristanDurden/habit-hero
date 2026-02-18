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

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(
      null
    )
    const [message, setMessage] = useState('')
   
    
    useEffect(() => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return
      }

      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })
        .then((registration) => {
          setIsSupported(true)
          return registration.pushManager.getSubscription()
        })
        .then((sub) => {
          if (sub) setSubscription(sub)
        })
        .catch((err) => {
          console.error('Service worker registration failed:', err)
        })
    }, [])
   
    async function subscribeToPush() {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        console.error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set. Push subscription will fail.')
        return
      }
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      setSubscription(sub)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser({
        endpoint: serializedSub.endpoint,
        p256dh: serializedSub.keys.p256dh,
        auth: serializedSub.keys.auth,
      })
    }
   
    async function unsubscribeFromPush() {
      if (subscription) {
        const endpoint = subscription.endpoint
        await subscription.unsubscribe()
        setSubscription(null)
        await unsubscribeUser(endpoint)
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
   
    if (!isSupported) {
      return <p className="text-sm text-muted-foreground">Push notifications are not supported in this browser.</p>
    }
   
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Push Notifications</h2>
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
            <Button onClick={subscribeToPush}>Subscribe</Button>
          </div>
        )}
      </div>
    )
  }
