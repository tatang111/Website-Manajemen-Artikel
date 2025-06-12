"use client"

import Link from "next/link"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar"
import { Newspaper, Tag, Upload } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { DropdownMenuItem } from "./ui/dropdown-menu"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"

export const AppSidebar = () => {
    const pathname = usePathname()
    const router = useRouter();

    return (
        <Sidebar className="text-white">
            <SidebarHeader className="pl-8 pt-4 bg-blue-600"><img src="/images/imagewhite.png" className="w-[134px] h-6" /></SidebarHeader>
            <SidebarContent className="bg-blue-600">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem >
                                <SidebarMenuButton asChild className={` hover:bg-blue-500 hover:text-white ${pathname === "/article" ? "bg-blue-500" : ""}`}>
                                    <Link href="/article" >
                                        <Newspaper />
                                        <span>Articles</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton className={` hover:bg-blue-500 hover:text-white ${pathname === "/category" ? "bg-blue-500" : ""}`} asChild>
                                    <Link href="/category" >
                                        <Tag />
                                        <span>Category</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Dialog>
                                    <DialogTrigger className="w-full">
                                        <SidebarMenuButton className={`cursor-pointer hover:bg-blue-500 hover:text-white`} asChild>
                                            <div>
                                                <Upload className="rotate-90" />
                                                <span>Logout</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </DialogTrigger>
                                    <DialogContent className="w-100 flex flex-col gap-10">
                                        <DialogHeader>
                                            <DialogTitle>Logout</DialogTitle>
                                            <DialogDescription>
                                                Are you sure want to logout?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="flex justify-center items-center">
                                            <DialogClose asChild>
                                                <Button variant="outline" className="cursor-pointer">Cancel</Button>
                                            </DialogClose>
                                            <Button onClick={() => {
                                                localStorage.removeItem("accessToken")
                                                router.push("/login")
                                            }} className="bg-red-600 hover:bg-red-700 cursor-pointer  rounded-lg text-white">Logout</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}