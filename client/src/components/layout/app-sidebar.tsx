import { Home, AlertTriangle } from "lucide-react"
import { Link } from "react-router-dom"
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

const items = [
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
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <span className="text-sm font-bold">A</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">Acme Inc</span>
                        <span className="text-xs text-sidebar-foreground/70">Template</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
