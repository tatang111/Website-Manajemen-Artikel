"use client"

import { AppSidebar } from "@/components/AppSidebar";
import { CategoryAdmin } from "@/components/CategoryAdmin";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Category() {
    const [checkAuth, setCheckAuth] = useState(true)
    const router = useRouter()

    const { data, isLoading, error } = useQuery({
        queryKey: ["category"],
        queryFn: async () => {
            const response = await axiosInstance.get("/auth/profile");
            return response.data
        }
    })

    useEffect(() => {
        if (!isLoading && data) {
            if (data?.role !== "Admin") {
                router.push("/article")
            } else {
                setCheckAuth(false)
            }
        }
    }, [isLoading])


    if (checkAuth) return <p>Checking auth...</p>
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger className="block mt-4 ml-10 md:hidden" />
            <CategoryAdmin />
        </SidebarProvider>
    )
}