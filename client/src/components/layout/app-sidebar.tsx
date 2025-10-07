import Home from "lucide-solid/icons/home"
import AlertTriangle from "lucide-solid/icons/alert-triangle"
// import { A } from "@solidjs/router"
import { For } from "solid-js"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const ITEMS = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "Not Found",
        url: "/not-found",
        icon: AlertTriangle,
    },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader class="border-b border-sidebar-border">
                <div class="flex items-center gap-2 px-2 py-2">
                    <div class="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <span class="text-sm font-bold">A</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm font-semibold">Acme Inc</span>
                        <span class="text-xs text-sidebar-foreground/70">Template</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <For each={ITEMS}>
                                {(item) => (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton>
                                            <a href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                            </For>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
