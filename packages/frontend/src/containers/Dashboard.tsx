import { useTheme } from "@/components/theme-provider"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { BookHeart, Moon, Sun, User2 } from "lucide-react"
import { useEffect } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import glorpLogo from "@/assets/glorp.avif"
import { toast } from "sonner"
import { useAppContext } from "@/lib/context"

export default function Dashboard({ onSignout }: { onSignout: () => void }) {
    const { isAuthenticated } = useAppContext();
    const nav = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            nav("/")
            toast.success("Logged out")
        }
    }, [isAuthenticated])

    return (
        <SidebarProvider>
            <AppSidebar onSignout={onSignout} />
            <main className="w-full">
                <SidebarTrigger />
                <Outlet />
            </main>
        </SidebarProvider>
    )
}

const items = [
    {
        title: "Journal",
        url: "/dashboard/journal",
        icon: BookHeart,
    },
]

function AppSidebar({ onSignout }: { onSignout: () => void }) {
    const { theme, setTheme } = useTheme()

    function toggleTheme() {
        if (theme === "light") {
            setTheme("dark")
        } else {
            setTheme("light")
        }
    }

    function currentThemeButton() {
        return <>
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            Toggle theme
        </>
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
                            <NavLink to="/dashboard">
                                <img src={glorpLogo} className="size-5!" />
                                <span className="text-base font-semibold">glorpcloud</span>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Applications</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLink to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={toggleTheme}>
                            {currentThemeButton()}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={onSignout}>
                            <User2 /> Logout
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}