"use client"

import { Loader2, Search } from "lucide-react"
import { NavbarAdmin } from "./NavbarAdmin"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axios"
import dayjs from "dayjs"
import { useEffect, useRef, useState } from "react"
import { CreateArticle } from "./CreateArticle"
import _ from "lodash"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebounce } from "@/lib/useDebounce"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination"
import Link from "next/link"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { toast } from "sonner"
import Image from "next/image"

const queryClient = new QueryClient()
export const ArticleAdmin = ({ children }) => {
    const [isCreate, setIsCreate] = useState(false)
    const [category, setCategory] = useState("")
    const [categories, setCategories] = useState([])
    const [searchValue, setSearchValue] = useState("")
    const [deletingId, setDeletingId] = useState(null)
    const searchParams = useSearchParams()
    const dialogRef = useRef()
    const router = useRouter()
    const debouncedSearch = useDebounce(searchValue, 400)
    const page = parseInt(searchParams.get("page")) || 1

    const filterId = categories.filter(c => c.name === category)
    let idCategory = filterId.length > 0 ? filterId[0].id : null

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", "1")
        params.set("search", debouncedSearch)
        router.push(`?${params.toString()}`)
    }, [debouncedSearch])

    // For get all Articles
    const { data, isLoading, error } = useQuery({
        queryKey: ["articles", idCategory, page, isCreate, deletingId, debouncedSearch],
        queryFn: async () => {
            const response = await axiosInstance.get("/articles", {
                params: {
                    limit: 10,
                    category: idCategory,
                    title: debouncedSearch,
                    page: page
                }
            })
            return response.data
        },
    })

    // For get the category and show in select 
    const { data: articleCategory } = useQuery({
        queryKey: ["getCategory"],
        queryFn: async () => {
            const response = await axiosInstance("/articles", {
                params: {
                    limit: 30
                }
            })
            return response.data
        }
    })
    const dataCategories = articleCategory?.data.map(article => ({
        id: article.categoryId,
        name: article.category.name
    }))
    const uniqCategories = _.uniqBy(dataCategories, "id")

    useEffect(() => {
        setCategories(uniqCategories)
    }, [articleCategory])

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (articleId) => {
            await axiosInstance.delete(`/articles/${articleId}`)
        },
        onSuccess: () => {
            toast.error("Deleting article")
            queryClient.invalidateQueries({
                queryKey: ["articles"]
            })
        }
    })

    useEffect(() => {
        const search = searchParams.get("search") || ""
        if (search !== searchValue) {
            setSearchValue(search)
        }
    }, [searchParams])

    const handleDeleteArticle = async (articleId) => {
        setDeletingId(articleId)
        await mutateAsync(articleId)
        await new Promise(r => setTimeout(r, 5000))
        dialogRef?.current.click()
        setDeletingId(null)
    }

    // For handle dynamic pagination
    const totalPages = 3;
    const visiblePages = 3;

    let startPage = Math.max(1, page - Math.floor(visiblePages / 2))
    let endPage = startPage + visiblePages - 1

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - visiblePages + 1)
    }

    const pageToShow = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

    if (error) return <p>{error.message}</p>

    return (
        <div className="w-full">
            {children}
            <div className="">
                <NavbarAdmin />
                {isCreate ? <CreateArticle setIsCreate={setIsCreate} /> :
                    <main className="pt-6 px-4 sm:px-6 pb-6 bg-gray-100 min-h-screen">
                        <div className="flex flex-col">
                            <div className="bg-gray-50 p-4 sm:p-6 rounded-t-lg">
                                <h2 className="text-sm sm:text-base font-[500]">Total Articles: {articleCategory?.data.length}</h2>
                            </div>
                            <div className="border-b border-gray-200" />
                            <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6 bg-gray-50 rounded-b-lg justify-between">
                                <form onSubmit={(e) => {
                                    e.preventDefault()
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set("search", searchValue);
                                    params.set("page", "1");
                                    router.push(`?${params.toString()}`)
                                }} className="flex flex-col sm:flex-row gap-2 w-full">
                                    <Select value={category} onValueChange={value => {
                                        setCategory(value)
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.set("category", value);
                                        params.set("page", "1");
                                        router.push(`?${params.toString()}`);
                                    }}>
                                        <SelectTrigger className="w-full sm:w-[250px] bg-white text-black">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel className="text-black">Category</SelectLabel>
                                                {categories.map(category => (
                                                    <SelectItem key={category.id} className="text-black" value={category.name}>{category.name}</SelectItem>
                                                ))}
                                                <SelectItem className="text-black" value="Semua">Semua Kategory</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <div className="relative w-full">
                                        <Search className="absolute top-1.5 text-gray-500 left-2" />
                                        <Input
                                            name="search"
                                            value={searchValue}
                                            onChange={e => setSearchValue(e.target.value)}
                                            className="pl-10 w-full md:w-50"
                                            placeholder="Search by title"
                                        />
                                    </div>
                                </form>
                                <Button
                                    onClick={() => setIsCreate(true)}
                                    className="bg-blue-600 hover:bg-blue-700 cursor-pointer w-full sm:w-auto mt-2 sm:mt-0"
                                >
                                    + Add Articles
                                </Button>
                            </div>
                            {isLoading ? (
                                <div className="flex justify-center mt-5">
                                    <Loader2 className="text-2xl animate-spin" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-center px-2 sm:px-4">Thumbnails</TableHead>
                                                <TableHead className="text-center px-2 sm:px-4">Title</TableHead>
                                                <TableHead className="text-center px-2 sm:px-4 hidden sm:table-cell">Category</TableHead>
                                                <TableHead className="text-center px-2 sm:px-4 hidden md:table-cell">Created at</TableHead>
                                                <TableHead className="text-center px-2 sm:px-4">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="bg-gray-50">
                                            {data?.data.map(article => (
                                                <TableRow key={article.id} className="bg-gray-50">
                                                    <TableCell className="px-2 sm:px-4">
                                                        <div className="flex justify-center">
                                                            <Image
                                                                className="w-12 h-12 sm:w-15 sm:h-15 rounded-lg"
                                                                src={article.imageUrl || "/images/article3.jpg"}
                                                                width={100} height={100} alt="Logo"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center px-2 sm:px-4 text-sm sm:text-base">
                                                        {article.title.length > 30 ? `${article.title.substring(0, 30)}...` : article.title}
                                                    </TableCell>
                                                    <TableCell className="text-center px-2 sm:px-4 hidden sm:table-cell">
                                                        {article.category.name}
                                                    </TableCell>
                                                    <TableCell className="text-center px-2 sm:px-4 hidden md:table-cell">
                                                        {dayjs(article.createdAt).format("MMM D, YYYY")}
                                                    </TableCell>
                                                    <TableCell className="text-center px-2 sm:px-4">
                                                        <div className="flex flex-col sm:flex-row gap-1 justify-center items-center">
                                                            <Link href={`/preview/${article.id}`} className="w-full sm:w-auto">
                                                                <Button variant="link" className="text-blue-600 cursor-pointer p-0 sm:px-4 text-xs sm:text-sm">
                                                                    Preview
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/edit/${article.id}`} className="w-full sm:w-auto">
                                                                <Button variant="link" className="text-blue-600 cursor-pointer p-0 sm:px-4 text-xs sm:text-sm">
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Dialog>
                                                                <DialogTrigger asChild className="w-full sm:w-auto">
                                                                    <Button
                                                                        variant="link"
                                                                        className="text-red-600 cursor-pointer p-0 sm:px-4 text-xs sm:text-sm"
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="sm:max-w-md">
                                                                    <DialogHeader>
                                                                        <DialogTitle>Delete Article</DialogTitle>
                                                                        <DialogDescription>
                                                                            Deleting this article is permanent and cannot be undone. All related content will be removed.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                                                                        <DialogClose asChild>
                                                                            <Button
                                                                                ref={dialogRef}
                                                                                variant="outline"
                                                                                disabled={article.id === deletingId}
                                                                                className="w-full sm:w-auto"
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                                        </DialogClose>
                                                                        <Button
                                                                            variant="destructive"
                                                                            disabled={article.id === deletingId}
                                                                            onClick={() => handleDeleteArticle(article.id)}
                                                                            className="w-full sm:w-auto"
                                                                        >
                                                                            {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Delete"}
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
                            )}
                        </div>
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
                    </main>
                }
            </div>
        </div>
    )
}