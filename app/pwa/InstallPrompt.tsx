import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export default function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
   
    useEffect(() => {
      setIsIOS(
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      )
   
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
      }

      window.addEventListener("beforeinstallprompt", handler)

      // Hide the install button if app gets installed
      const installedHandler = () => {
        setDeferredPrompt(null)
        setIsStandalone(true)
      }

      window.addEventListener("appinstalled", installedHandler)

      return () => {
        window.removeEventListener("beforeinstallprompt", handler)
        window.removeEventListener("appinstalled", installedHandler)
      }
    }, [])

    const handleInstallClick = useCallback(async () => {
      if (!deferredPrompt) return

      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        setDeferredPrompt(null)
      }
    }, [deferredPrompt])
   
    if (isStandalone) {
      return null // Don't show install button if already installed
    }
   
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold">Install App</h3>
        {deferredPrompt && (
          <Button onClick={handleInstallClick}>
            Add to Home Screen
          </Button>
        )}
        {isIOS && (
          <p className="text-sm text-muted-foreground">
            To install this app on your iOS device, tap the share button
            <span role="img" aria-label="share icon">
              {' '}⎋{' '}
            </span>
            and then &ldquo;Add to Home Screen&rdquo;
            <span role="img" aria-label="plus icon">
              {' '}➕{' '}
            </span>
            .
          </p>
        )}
        {!deferredPrompt && !isIOS && (
          <p className="text-sm text-muted-foreground">
            To install this app, open it in Chrome on Android or a supported desktop browser.
          </p>
        )}
      </div>
    )
  }
