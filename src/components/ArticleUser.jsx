"use client"

import { ArticleCard } from "@/components/ArticleCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosInstance from "@/lib/axios";
import { isAuthenticated } from "@/lib/useAuth";
import { useDebounce } from "@/lib/useDebounce";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { AlertCircleIcon } from "lucide-react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ArticleUser() {
    const [isMobile, setIsMobile] = useState(false)
    const [category, setCategory] = useState("")
    const [searchValue, setSearchValue] = useState("")
    const [checkAuth, setCheckAuth] = useState(false)
    const [categories, setCategories] = useState([])
    const searchParams = useSearchParams()
    const page = parseInt(searchParams.get("page")) || 1
    const debouncedSearch = useDebounce(searchValue, 400)
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated()) {
            redirect("/login")
        } else {
            setCheckAuth(true)
        }
    }, [])

    // responsive, how many the screen display articles 
    useEffect(() => {
        const checkIfMobile = () => setIsMobile(window.innerWidth < 768)
        checkIfMobile();
        window.addEventListener("resize", checkIfMobile);
        return () => window.removeEventListener("resize", checkIfMobile);
    }, [])

    useEffect(() => {
        const search = searchParams.get("search") || ""
        if (search !== searchValue) {
            setSearchValue(search)
        }
    }, [searchParams])


    // Debounded search
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", "1")
        params.set("search", debouncedSearch)
        router.push(`?${params.toString()}`)
    }, [debouncedSearch])

    // For handle get the data based on category cause category need an id not a name
    const filterId = categories.filter(c => c.name === category)
    let idCategory = filterId.length > 0 ? filterId[0].id : null

    const { data: articles, isLoading, error } = useQuery({
        queryKey: ["articles", page, isMobile, idCategory, debouncedSearch],
        queryFn: async () => {
            const response = await axiosInstance("/articles", {
                params: {
                    page: page,
                    limit: isMobile ? 3 : 9,
                    category: null || idCategory,
                    title: debouncedSearch
                }
            })
            return response.data
        }
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

    // For handle dynamic pagination
    const totalPages = 6;
    const visiblePages = isMobile ? 6 : 3;

    let startPage = Math.max(1, page - Math.floor(visiblePages / 2))
    let endPage = startPage + visiblePages - 1

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - visiblePages + 1)
    }

    const pageToShow = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

    if (!checkAuth) return <p>Checking Authentication...</p>

    return (
        <main className="relative">
            <header className="relative">
                <Navbar />
            </header>
            <div className="relative px-6 md:h-[500px] flex justify-center items-center h-[560px] w-full">
                <div className="absolute inset-0 bg-cover bg-center bg-[url('/images/office.jpg')]" />
                <div className="absolute inset-0 bg-[#2563EBDB] z-10" />
                <div className="relative z-20 flex justify-center items-center h-full text-white flex-col gap-6 md:w-[730px]  ">
                    <h2 className="font-[700] text-lg md:text-base">Blog genzet</h2>
                    <h1 className="font-[500] text-4xl md:text-5xl text-center md:h-24 ">The Journal : Design Resources, Interviews, and Industry News</h1>
                    <h3 className="text-xl">Your daily dose of design insights!</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("search", searchValue);
                        params.set("page", "1");
                        router.push(`?${params.toString()}`)
                    }} className="mt-2 grid md:flex gap-2 p-[10px] rounded-md bg-blue-500 ">
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
                        <Input placeholder="Search" name="search" value={searchValue} onChange={e => {
                            setSearchValue(e.target.value)
                        }} className="bg-white text-black" />
                    </form>
                </div>
            </div>
            <section className="flex flex-col gap-6 pt-10 pb-15 px-5 md:pt-10 md:pb-25 md:px-15 justify-center items-center">
                <div className="flex flex-col gap-10 ">
                    {error &&
                        <Alert variant="destructive">
                            <AlertCircleIcon />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                Failed to load articles. Please try again later.
                            </AlertDescription>
                        </Alert>
                    }
                    <div className="flex flex-col gap-10 md:grid md:grid-cols-3 md:gap-4 ">
                        {isLoading && !articles ? <p>Loading...</p> : articles?.data.map(article => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                    <Pagination>
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
                </div>
            </section>
            <Footer />
        </main>
    );
}
