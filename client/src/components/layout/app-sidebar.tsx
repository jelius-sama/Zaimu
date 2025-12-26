import Home from "lucide-solid/icons/home"
import BarChart3 from "lucide-solid/icons/bar-chart-3"
import { useLocation, A } from "@solidjs/router"
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
    useSidebar,
    useIsMobile
} from "@/components/ui/sidebar"
import { setUsableScreenSize } from "@/contexts/app"

const ITEMS = [
    {
        title: "Dashboard",
        url: "/",
        icon: BarChart3,
    },
    {
        title: "Ledger",
        url: "/ledger",
        icon: Home,
    },
    {
        title: "Insights",
        url: "/insights",
        icon: Home,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Home,
    },
]

export function AppSidebar() {
    // INFO: Setting usable screen size should preferably done in `main.tsx` but since `useSidebar` must be within `Sidebar` we keep it here.
    setUsableScreenSize()
    const location = useLocation()
    const sidebarCtx = useSidebar()
    const isMobile = useIsMobile()

    const handleClose = () => {
        if (isMobile()) {
            if (sidebarCtx.openMobile()) sidebarCtx.setOpenMobile(false)
        }
    }

    return (
        <Sidebar>
            <SidebarHeader class="border-b border-sidebar-border">
                <div class="flex items-center gap-2 px-2 py-2">
                    <img src="/assets/zaimu.png" class="flex size-8 items-center justify-center rounded-sm bg-sidebar-primary" />
                    <div class="flex flex-col">
                        <span class="text-sm font-semibold">Zaimu</span>
                        <span class="text-xs text-sidebar-foreground/70">財務</span>
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
                                        <SidebarMenuButton onClick={handleClose} isActive={location.pathname === item.url} as={A} href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
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
