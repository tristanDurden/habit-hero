import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"
import { ClipboardList, Home, Settings, TreePalm, User } from "lucide-react"
import Link from "next/link"
  
  export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
    
              <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/dashboard">
                  <SidebarMenuButton tooltip="Home" className="[&>svg]:size-5 text-base p-1">
                    <Home />
                    <span>Home</span>
                  </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
    
                <SidebarMenuItem>
                  <Link href="/dashboard/habits">
                  <SidebarMenuButton tooltip="Habits" className="[&>svg]:size-5 text-base p-1">
                  <TreePalm />
                    <span>Habits</span>
                  </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
    
                <SidebarMenuItem>
                  <Link href="/dashboard/lists">
                  <SidebarMenuButton tooltip="Lists" className="[&>svg]:size-5 text-base p-1">
                  <ClipboardList />
                    <span>Lists</span>
                  </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard/settings">
                  <SidebarMenuButton tooltip="Settings" className="[&>svg]:size-5 text-base p-1">
                  <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
    
    )
  }