import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"

export const NavbarDetail = () => {
    const router = useRouter()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <nav className="bg-white md:bg-transparent z-30 h-16 w-full shadow px-5 py-4 flex items-center justify-between">
                    <Image src="/images/image.png" width={100} height={100} alt="Logo" className="h-[22px] w-[122px]" />
                    <div className="flex items-center gap-2 justify-center">
                        <div className="bg-blue-200 rounded-full text-lg w-8 h-8 text-center">J</div>
                        <p className="underline text-black hidden md:block">James Dean</p>
                    </div>
                </nav>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <Link href="/profile">
                    <DropdownMenuItem>My Account</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Dialog>
                    <DropdownMenuItem onSelect={e => e.preventDefault()} variant="destructive">
                        <DialogTrigger className="flex items-center justify-center gap-2">
                            <LogOut />
                            <p className="pb-0.5">Log Out</p>
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
    )
}