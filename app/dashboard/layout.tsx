"use client";
import NavBar from "../components/misc/NavBar";
import { useSession } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/misc/App-Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <SidebarProvider>
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            
            {children}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
