"use client"

import { ArticleCard } from "@/components/ArticleCard"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"
import { NavbarDetail } from "@/components/NavbarDetail"
import axiosInstance from "@/lib/axios"
import { isAuthenticated } from "@/lib/useAuth"
import { useQuery } from "@tanstack/react-query"
import { redirect } from "next/navigation"
import { use, useEffect, useState } from "react"

export default function ArticleDetailPage(paramsPromise) {
    const { id } = use(paramsPromise.params)

    const [checkAuth, setCheckAuth] = useState(false)

    useEffect(() => {
        if (!isAuthenticated()) {
            redirect("/login")
        } else {
            setCheckAuth(true)
        }
    }, [])

    const { data, isLoading, error } = useQuery({
        queryKey: ["article", id],
        queryFn: async () => {
            const response = await axiosInstance.get(`/articles/${id}`)
            return response.data
        }
    })
    const { data: otherArticles, isLoading: otherArticlesLoading, error: otherArticlesError } = useQuery({
        queryKey: ["other-article", id],
        queryFn: async () => {
            const response = await axiosInstance.get(`/articles`, {
                params: {
                    category: data.categoryId,
                    limit: 3
                }
            })
            return response.data
        }
    })

    if (isLoading) return <p>Loading...</p>
    if (!checkAuth) return <p>Checking authentication...</p>
    return (
        <div>
            <header>
                <NavbarDetail />
            </header>
            <main className="flex flex-col justify-center py-10 px-5 gap-6 w-full md:px-30">
                <article className="flex flex-col gap-6">
                    <h3 className="text-center">{new Date(data.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    })} - Createed by {data.user.username}</h3>
                    <h1 className="text-center font-[600] text-2xl md:text-3xl">{data.title}</h1>
                    <img src={data.imageUrl || "/images/article2.jpg"} className="rounded-xl w-full md:h-[480px] h-[240px] object-cover" />
                    <p>{data.content}</p>
                </article>
                <div className="flex flex-col gap-6 pt-10 pb-15 px-5">
                    <h3 className="font-bold text-lg ">Other articles</h3>
                    <div className="md:flex gap-10">
                        {otherArticlesLoading ? <p>Loading...</p> : otherArticles?.data.map(article => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}