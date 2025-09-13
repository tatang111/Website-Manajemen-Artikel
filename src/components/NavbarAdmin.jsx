import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"

export const NavbarAdmin = () => {
    const pathname = usePathname()
    const router = useRouter()
    let title = pathname.includes("/article") ? "Article" : "Category"

    const { data, isLoading, error } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const response = await axiosInstance(`/auth/profile`)
            return response.data
        }
    })

    return (
        <nav className="bg-white md:bg-transparent md:shadow-none z-30 h-16 w-full shadow px-5 py-4 flex items-center justify-between">
            <DropdownMenu className="relative w-full">
                <DropdownMenuTrigger className="w-full">
                    <div className="flex justify-between w-full items-center">
                        <h2 className="font-semibold text-xl ml-3">{title}</h2>
                        <div className="flex items-center gap-2 justify-center ">
                            <div className="bg-blue-200 rounded-full text-lg w-8 h-8 text-center">J</div>
                            <p className="underline text-black hidden md:block mb-1.5">{data?.username}</p>
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="relative w-50 ">
                    <Link href="/admin/profile">
                        <DropdownMenuItem className="cursor-pointer">My Account</DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <Dialog>
                        <DropdownMenuItem asChild onSelect={e => e.preventDefault()} variant="destructive" className="w-full cursor-pointer">
                            <DialogTrigger className="w-full">
                                <div className="flex items-center gap-2">
                                    <LogOut color="red" />
                                    <p className="pb-0.5">Log Out</p>
                                </div>
                            </DialogTrigger>
                        </DropdownMenuItem>
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
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    )
}