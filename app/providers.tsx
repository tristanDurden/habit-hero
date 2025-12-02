"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "sonner";
import { OnlineStatusProvider } from "./providers/online-status";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OnlineStatusProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </OnlineStatusProvider>
    </SessionProvider>
  );
}
