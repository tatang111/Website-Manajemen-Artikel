"use client"

import Image from "next/image"
import Link from "next/link"

export const ArticleCard = ({ article }) => {

    return (
        <div className="flex flex-col gap-2 w-full object-center ">
            <Link href={`/detail/${article.id}`} className="h-50">
                <Image width={100} height={100} alt="Logo" src={article?.imageUrl || "/images/article2.jpg"} className="rounded-lg h-50 w-full object-cover " />
            </Link>
            <h4 className="font-[400] text-sm">{new Date(article.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            })}</h4>
            <h2 className="font-[600] text-lg">{article.title}</h2>
            <p className="font-[400] text-sm ">{article.content.split(" ").slice(10, 23).join(" ")}</p>
            <div className="flex gap-2">
                <div className="bg-blue-200 rounded-full py-1 px-3 gap-2.5 font-[400] text-xs text-blue-900">{article.category.name}</div>
            </div>
        </div>
    )
}