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
                  <SidebarMenuButton tooltip="Home" >
                    <Home />
                    <span>Home</span>
                  </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
    
                <SidebarMenuItem>
                  <Link href="/dashboard/habits">
                  <SidebarMenuButton tooltip="Habits">
                  <TreePalm />
                    <span>Habits</span>
                  </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
    
                <SidebarMenuItem>
                  <Link href="/dashboard/lists">
                  <SidebarMenuButton tooltip="Lists">
                  <ClipboardList />
                    <span>Lists</span>
                  </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
    
    )
  }