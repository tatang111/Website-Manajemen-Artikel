"use client"

import { Loader, Loader2, Search } from "lucide-react"
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
                    <main className="pt-6 px-6 pb-6 bg-gray-100 min-h-screen ">
                        <div className="flex flex-col ">
                            <div className="bg-gray-50 p-6 rounded-t-lg">
                                <h2 className="text-base font-[500]">Total Articles : {articleCategory?.data.length}</h2>
                            </div>
                            <div className="border-b border-gray-200" />
                            <div className="flex p-6 bg-gray-50 rounded-b-lg justify-between ">
                                <div className="flex gap-2">
                                    <Select value={category} onValueChange={value => {
                                        setCategory(value)
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.set("category", value);
                                        params.set("page", "1");
                                        router.push(`?${params.toString()}`);
                                    }}>
                                        <SelectTrigger className="w-[250px] bg-white text-black">
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
                                    <div className="relative">
                                        <Search className="absolute top-1.5 text-gray-500 left-2" />
                                        <Input name="search" value={searchValue} onChange={e => setSearchValue(e.target.value)} className="pl-10" placeholder="Search by title" />
                                    </div>
                                </div>
                                <Button onClick={() => setIsCreate(true)} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">+ Add Articles</Button>
                            </div>
                            {isLoading ?
                                <Loader2 className="text-2xl mt-5 ml-40" />
                                :
                                <Table>
                                    <TableHeader >
                                        <TableRow>
                                            <TableHead className="text-center">Thumbnails</TableHead>
                                            <TableHead className="text-center">Title</TableHead>
                                            <TableHead className="text-center">Category</TableHead>
                                            <TableHead className="text-center">Created at</TableHead>
                                            <TableHead className="text-center">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="bg-gray-50 rounded-lg">
                                        {data?.data.map(article => (
                                            <TableRow key={article.id} className="bg-gray-50">
                                                <TableCell><img className="w-15 h-15 m-auto rounded-lg" src={article.imageUrl || "/images/article3.jpg"} /></TableCell>
                                                <TableCell className="text-center">{article.title}</TableCell>
                                                <TableCell className="text-center">{article.category.name}</TableCell>
                                                <TableCell className="text-center">{dayjs(article.createdAt).format("MMMM D, YYYY HH:mm:ss")}</TableCell>
                                                <TableCell className="text-center">
                                                    <Link href={`/preview/${article.id}`}>
                                                        <Button variant="link" className="-mr-6 underline text-blue-600 cursor-pointer">Preview</Button>
                                                    </Link>
                                                    <Link href={`/edit/${article.id}`}>
                                                        <Button variant="link" className="underline text-blue-600 cursor-pointer">Edit</Button>
                                                    </Link>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="link" className="-ml-6 underline text-red-600 cursor-pointer">Delete</Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="w-100 flex flex-col gap-10">
                                                            <DialogHeader>
                                                                <DialogTitle>Delete Article</DialogTitle>
                                                                <DialogDescription>
                                                                    Deleting this article is permanent and cannot be undone. All related content will be removed.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="flex justify-center items-center">
                                                                <DialogClose asChild>
                                                                    <Button ref={dialogRef} variant="outline" disabled={article.id === deletingId} className="cursor-pointer">Cancel</Button>
                                                                </DialogClose>
                                                                <Button variant="destructive" disabled={article.id === deletingId} onClick={() => handleDeleteArticle(article.id)} className=" cursor-pointer w-18 ">{isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Delete"}</Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            }
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
                    </main>}
            </div>
        </div>
    )
}