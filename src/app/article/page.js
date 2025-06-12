"use client";

import { AppSidebar } from "@/components/AppSidebar";
import { ArticleAdmin } from "@/components/ArticleAdmin";
import ArticleUser from "@/components/ArticleUser";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import axiosInstance from "@/lib/axios";
import { isAuthenticated } from "@/lib/useAuth";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Article() {

    const [checkAuth, setCheckAuth] = useState(false)


    useEffect(() => {
        if (!isAuthenticated()) {
            redirect("/login")
        } else {
            setCheckAuth(true)
        }
    }, [])

    const { data, isLoading, error } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const response = await axiosInstance.get("/auth/profile");
            return response.data
        },
    })

    if (isLoading || !checkAuth) return <p>Loading...</p>
    if (error) return <p>{error.message}</p>
    return (
        <div>
            {data.role === "User" ? <ArticleUser /> :
                <SidebarProvider className="m-0 p-0">
                    <AppSidebar />
                    <ArticleAdmin>
                        <SidebarTrigger className="block md:hidden" />
                    </ArticleAdmin>
                </SidebarProvider>
            }
        </div>
    )
}