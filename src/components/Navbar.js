import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"

export const Navbar = () => {
    const router = useRouter()

    return (
        <nav className="bg-white md:bg-transparent md:shadow-none md:absolute z-30 h-16 w-full shadow px-5 py-4 flex items-center justify-between">
            <DropdownMenu className="relative w-full">
                <DropdownMenuTrigger className="w-full">
                    <div className="flex justify-between w-full items-center">
                        <img src="/images/image.png" className="h-[22px] w-[122px] md:hidden" />
                        <img src="/images/imagewhite.png" className="h-[22px] w-[122px] hidden md:block" />
                        <div className="flex items-center gap-2 justify-center ">
                            <div className="bg-blue-200 rounded-full text-lg w-8 h-8 text-center">J</div>
                            <p className="underline text-white hidden md:block mb-1.5">James Dean</p>
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="relative w-50 ">
                    <Link href="/profile">
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
                                }} className="bg-blue-600 hover:bg-blue-700 cursor-pointer w-18 ">Logout</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    )
}