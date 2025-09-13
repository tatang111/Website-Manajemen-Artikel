"use client"

import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query"
import { NavbarAdmin } from "./NavbarAdmin"
import axiosInstance from "@/lib/axios"
import { Search } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useEffect, useRef, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import dayjs from "dayjs"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination"
import { useDebounce } from "@/lib/useDebounce"

export const CategoryAdmin = () => {
    const [searchValue, setSearchValue] = useState("")
    const [category, setCategory] = useState("")
    const [editCategory, setEditCategory] = useState("")
    const queryClient = useQueryClient()
    const searchParams = useSearchParams();
    const debouncedSearch = useDebounce(searchValue, 400)
    const page = parseInt(searchParams.get("page")) || 1
    const router = useRouter()
    const dialogRef = useRef()

    const { data: dataCategories, isLoading, error } = useQuery({
        queryKey: ["categoryAdmin", page],
        queryFn: async () => {
            const response = await axiosInstance.get("/categories", {
                params: {
                    limit: 10,
                    page: page,
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
            dialogRef.current.click()
            queryClient.invalidateQueries(["categoryAdmin"])
            toast.success("Success Add Category")
            setCategory("")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add category")
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
            toast.error(error.response?.data?.message || "Failed to edit category")
        }
    }

    const handleDeleteCategory = async (id) => {
        try {
            const response = await axiosInstance.delete(`/categories/${id}`)
            queryClient.invalidateQueries(["categoryAdmin"])
            toast.error("Success Delete Category")
            dialogRef.current.click()
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete category")
        }
    }

    // For handle dynamic pagination
    const totalPages = dataCategories?.totalPages || 1;
    const visiblePages = 3;

    let startPage = Math.max(1, page - Math.floor(visiblePages / 2))
    let endPage = startPage + visiblePages - 1

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - visiblePages + 1)
    }

    const pageToShow = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    )

    if (error) return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-red-500">Error loading categories: {error.message}</p>
        </div>
    )

    return (
        <div className="w-full">
            <header>
                <NavbarAdmin />
            </header>
            <main className="pt-4 md:pt-6 px-4 md:px-6 pb-4 md:pb-6 bg-gray-100 min-h-screen">
                <div className="flex flex-col">
                    {/* Header Section */}
                    <div className="bg-gray-50 p-4 md:p-6 rounded-t-lg">
                        <h2 className="text-sm md:text-base font-medium">Total Category: {dataCategories?.totalData || 0}</h2>
                    </div>

                    {/* Search and Add Button */}
                    <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6 bg-gray-50 rounded-b-lg justify-between">
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute top-3 left-3 text-gray-500" size={18} />
                            <Input
                                name="search"
                                value={searchValue}
                                onChange={e => setSearchValue(e.target.value)}
                                className="pl-10 w-full"
                                placeholder="Search category"
                            />
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
                                    + Add Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-full max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add Category</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="mt-1"
                                        name="category"
                                    />
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <DialogClose asChild>
                                        <Button ref={dialogRef} type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700">
                                        Add
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center px-2 md:px-4">Category</TableHead>
                                    <TableHead className="text-center px-2 md:px-4">Created At</TableHead>
                                    <TableHead className="text-center px-2 md:px-4">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dataCategories?.data?.filter(cate => cate.name.toLowerCase().includes(debouncedSearch.toLowerCase())).map(category => (
                                    <TableRow className="bg-gray-50" key={category.id}>
                                        <TableCell className="text-center px-2 md:px-4">
                                            {category.name}
                                        </TableCell>
                                        <TableCell className="text-center px-2 md:px-4">
                                            <div className="flex flex-col">
                                                <span className="sm:hidden">
                                                    {dayjs(category.createdAt).format("MMM D")}
                                                </span>
                                                <span className="hidden sm:inline">
                                                    {dayjs(category.createdAt).format("MMM D, YYYY")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center px-2 md:px-4">
                                            <div className="flex flex-col sm:flex-row gap-1 justify-center">
                                                {/* Edit Dialog */}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            onClick={() => setEditCategory(category.name)}
                                                            variant="link"
                                                            className="text-blue-600 hover:text-blue-700 underline p-0 sm:px-2 text-sm"
                                                        >
                                                            Edit
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="w-full max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Category</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="category">Category</Label>
                                                            <Input
                                                                id="category"
                                                                value={editCategory}
                                                                onChange={e => setEditCategory(e.target.value)}
                                                                className="mt-1"
                                                                name="category"
                                                            />
                                                        </div>
                                                        <DialogFooter className="gap-2 sm:gap-0">
                                                            <DialogClose asChild>
                                                                <Button ref={dialogRef} type="button" variant="outline">
                                                                    Cancel
                                                                </Button>
                                                            </DialogClose>
                                                            <Button
                                                                onClick={() => handleEditCategory(category.id)}
                                                                className="bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                Save Changes
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>

                                                {/* Delete Dialog */}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="link"
                                                            className="text-red-600 hover:text-red-700 underline p-0 sm:px-2 text-sm"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="w-full max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle>Delete Category</DialogTitle>
                                                        </DialogHeader>
                                                        <p className="text-base mb-4">
                                                            Delete category {"'"}{category.name}{"'"}? This will remove it from master data permanently.
                                                        </p>
                                                        <DialogFooter className="gap-2 sm:gap-0">
                                                            <DialogClose asChild>
                                                                <Button ref={dialogRef} type="button" variant="outline">
                                                                    Cancel
                                                                </Button>
                                                            </DialogClose>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() => handleDeleteCategory(category.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <Pagination className="py-3 bg-gray-50">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={`?page=${Math.max(page - 1, 1)}`}
                                    onClick={e => {
                                        e.preventDefault();
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.set("page", Math.max(page - 1, 1))
                                        router.push(`?${params.toString()}`)
                                    }}
                                />
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

                            <PaginationItem>
                                <PaginationNext
                                    href={`?page=${Math.min(page + 1, totalPages)}`}
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
                </div>
            </main>
        </div>
    )
}