"use client"

import { ArticleCard } from "@/components/ArticleCard"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"
import { NavbarDetail } from "@/components/NavbarDetail"
import axiosInstance from "@/lib/axios"
import { isAuthenticated } from "@/lib/useAuth"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"
import { use, useEffect, useState } from "react"

export default function PreviewArticle({title, image, description, category, setSeePreview}) {
    const [checkAuth, setCheckAuth] = useState(false)

    useEffect(() => {
        if (!isAuthenticated()) {
            redirect("/login")
        } else {
            setCheckAuth(true)
        }
    }, [])

    const { data: otherArticles, isLoading: otherArticlesLoading, error: otherArticlesError } = useQuery({
        queryKey: ["other-article"],
        queryFn: async () => {
            const response = await axiosInstance.get(`/articles`, {
                params: {
                    limit: 3
                }
            })
            return response.data
        }
    })

    if (otherArticlesLoading) return <p>Loading...</p>
    if (!checkAuth) return <p>Checking authentication...</p>
    return (
        <div>
            <main className="flex flex-col justify-center py-10 px-5 gap-6 w-full md:px-30">
                <article className="flex relative flex-col gap-6">
                    <button onClick={() => setSeePreview(false)} className="absolute flex -ml-20 cursor-pointer"><ArrowLeft  /> Kembali</button>
                    <h3 className="text-center">{new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    })} - Createed by Admin</h3>
                    <h1 className="text-center font-[600] text-2xl md:text-3xl">{title}</h1>
                    <img src={image} className="rounded-xl w-full md:h-[480px] h-[240px] object-cover" />
                    <p>{description}</p>
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