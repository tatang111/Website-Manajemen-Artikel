"use client"

import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query"
import { NavbarAdmin } from "./NavbarAdmin"
import axiosInstance from "@/lib/axios"
import { Search } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useRef, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import dayjs from "dayjs"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination"


export const CategoryAdmin = () => {
    const [searchValue, setSearchValue] = useState("")
    const [category, setCategory] = useState("")
    const [editCategory, setEditCategory] = useState("")
    const queryClient = useQueryClient()
    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get("page")) || 1
    const router = useRouter()
    const dialogRef = useRef()

    const { data: dataCategories, isLoading, error } = useQuery({
        queryKey: ["categoryAdmin"],
        queryFn: async () => {
            const response = await axiosInstance.get("/categories", {
                params: {
                    limit: 10,
                    page: page
                }
            })
            return response.data
        }
    })

    const handleAddCategory = async () => {
        try {
            if (!category) return toast.error("Please enter category")
            const response = await axiosInstance.post("/categories", {
                name: category
            })
            queryClient.invalidateQueries(["categoryAdmin"])
            toast.success("Success Add Category")
            setCategory("")
        } catch (error) {
            console.log(error.message)

        }
    }

    const handleEditCategory = async (id) => {
        try {
            if (editCategory.length == 0) return toast.error("Please enter category")
            const response = await axiosInstance.put(`/categories/${id}`, {
                name: editCategory
            })
            queryClient.invalidateQueries(["categoryAdmin"])
            toast.success("Success Edit Category")
            dialogRef.current.click()
            setEditCategory("")
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleDeleteCategory = async (id) => {
        try {
            const response = await axiosInstance.delete(`/categories/${id}`)
            queryClient.invalidateQueries(["categoryAdmin"])
            toast.error("Success Delete Category")
            dialogRef.current.click()
        } catch (error) {
            console.log(error.message)
        }
    }


    // For handle dynamic pagination
    const totalPages = 5;
    const visiblePages = 3;

    let startPage = Math.max(1, page - Math.floor(visiblePages / 2))
    let endPage = startPage + visiblePages - 1

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - visiblePages + 1)
    }

    const pageToShow = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

    return (
        <div className="w-full">
            <header>
                <NavbarAdmin />
            </header>
            <main className="pt-6 px-6 pb-6 bg-gray-100 min-h-screen ">
                <div className="flex flex-col ">
                    <div className="bg-gray-50 p-6 rounded-t-lg">
                        <h2 className="text-base font-[500]">Total Category : {dataCategories?.totalData}</h2>
                    </div>
                    <div className="border-b border-gray-200" />
                    <div className="flex p-6 bg-gray-50 rounded-b-lg justify-between">
                        <div className="relative">
                            <Search className="absolute top-1.5 text-gray-500 left-2" />
                            <Input name="search" value={searchValue} onChange={e => setSearchValue(e.target.value)} className="pl-10" placeholder="Search by title" />
                        </div>
                        <Dialog >
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">+ Add Category</Button>
                            </DialogTrigger>
                            <DialogContent className="w-100">
                                <DialogHeader>
                                    <DialogTitle>Add Category</DialogTitle>
                                </DialogHeader>
                                <div>
                                    <Label htmlFor="category" >Category</Label>
                                    <Input id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-3" name="category" />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button ref={dialogRef} type="button" variant="outline" className="cursor-pointer">Cancel</Button>
                                    </DialogClose>
                                    <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">Add</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">Category</TableHead>
                                <TableHead className="text-center">Created At</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dataCategories?.data.map(category => (
                                <TableRow className="bg-gray-50" key={category.id}>
                                    <TableCell className="text-center">{category.name}</TableCell>
                                    <TableCell className="text-center">{dayjs(category.createdAt).format("MMMM D, YYYY hh:mm:ss")}</TableCell>
                                    <TableCell className="text-center ">
                                        <Dialog >
                                            <DialogTrigger asChild>
                                                <Button onClick={() => setEditCategory(category.name)} variant="link" className="text-blue-600 -mr-5 hover:text-blue-700 underline cursor-pointer ">Edit</Button>
                                            </DialogTrigger>
                                            <DialogContent className="w-100">
                                                <DialogHeader>
                                                    <DialogTitle>Edit Category</DialogTitle>
                                                </DialogHeader>
                                                <div>
                                                    <Label htmlFor="category" >Category</Label>
                                                    <Input id="category" value={editCategory} onChange={e => setEditCategory(e.target.value)} className="mt-3" name="category" />
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button ref={dialogRef} type="button" variant="outline" className="cursor-pointer">Cancel</Button>
                                                    </DialogClose>
                                                    <Button onClick={() => handleEditCategory(category.id)} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">Save Changes</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <Dialog >
                                            <DialogTrigger asChild>
                                                <Button variant="link" className="text-red-600 hover:text-red-700 underline cursor-pointer">Delete</Button>
                                            </DialogTrigger>
                                            <DialogContent className="w-100">
                                                <DialogHeader>
                                                    <DialogTitle>Delete Category</DialogTitle>
                                                </DialogHeader>
                                                <p className="font-[400] text-base mb-2">Delete category “{category.name}”? This will remove it from master data permanently.</p>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button ref={dialogRef} type="button" variant="outline" className="cursor-pointer">Cancel</Button>
                                                    </DialogClose>
                                                    <Button variant="destructive" onClick={() => handleDeleteCategory(category.id)} className=" cursor-pointer">Delete</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Pagination className="py-3 bg-gray-50">
                    <PaginationContent>
                        <PaginationItem className="md:hidden">
                            <PaginationPrevious href={`?page=${Math.max(page - 1, 1)}`}
                                onClick={e => {
                                    e.preventDefault();
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set("page", Math.max(page - 1, 1))
                                    router.push(`?${params.toString()}`)
                                }
                                } />
                        </PaginationItem>
                        {pageToShow.map(p => (
                            <PaginationItem key={p}>
                                <PaginationLink
                                    href={`?page=${p}`}
                                    isActive={p === page}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.set("page", p);
                                        router.push(`?${params.toString()}`);
                                    }}
                                >
                                    {p}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem className="md:hidden">
                            <PaginationNext href={`?page=${Math.min(page + 1, totalPages)}`}
                                onClick={e => {
                                    e.preventDefault();
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set("page", Math.min(page + 1, totalPages))
                                    router.push(`?${params.toString()}`)
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </main>
        </div>
    )
}