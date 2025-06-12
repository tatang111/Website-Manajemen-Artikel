"use client"

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { NavbarDetail } from "@/components/NavbarDetail";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { isAuthenticated } from "@/lib/useAuth";
import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Profile() {
    const router = useRouter()
    const [checkAuth, setCheckAuth] = useState(false)

    const { data, isLoading, error } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const response = await axiosInstance(`/auth/profile`)
            return response.data
        },
        retry: false
    })

    useEffect(() => {
        if (!isAuthenticated()) {
            redirect("/login")
        } else {
            setCheckAuth(true)
        }
    }, [])

    if (!checkAuth) return <p>Checking Authentication...</p>
    if (isLoading) return <p>Loading profile data...</p>
    if (error) return <p>Error loading profile: {error.message}</p>
    if (!data) return <p>No profile data available</p>

    return (
        <div className="flex flex-col min-h-screen relative">
            <header>
                <NavbarDetail />
            </header>
            <main className="flex-grow flex md:py-15 justify-center items-center gap-9 flex-col border px-5 py-10">
                <h1 className="font-semibold text-xl">User Profile</h1>
                <div className="bg-blue-200 w-22 h-22 rounded-full text-center text-5xl leading-19">J</div>
                <div className="flex flex-col gap-3 justidy-center items-center w-full px-4 py-6">
                    <div className="py-[10px] pl-15 md:w-[368px] px-3 bg-gray-100 rounded-xs flex w-full">
                        <span className=" text-base font-semibold">Username : </span>
                        <span className="text-center ml-15">{data?.username || "N/A"}</span>
                    </div>
                    <div className="py-[10px] pl-15 md:w-[368px] px-3 bg-gray-100 rounded-xs flex w-full">
                        <span className=" text-base font-semibold">Password : </span>
                        <span className="text-center ml-13">Admin123</span>
                    </div>
                    <div className="py-[10px] pl-15 md:w-[368px] px-3 bg-gray-100 rounded-xs flex w-full">
                        <span className=" text-base font-semibold">Role <span className="ml-9">:</span> </span>
                        <span className="text-center ml-16">{data?.role || "N/A"}</span>
                    </div>
                </div>
                <Button onClick={() => router.push("/article")} className="bg-blue-600 md:w-[368px] hover:bg-blue-700 cursor-pointer text-white rounded-lg w-9/10 -mt-4 py-6">
                    Back to home
                </Button>
            </main>
            <footer className="">
                <Footer />
            </footer>
        </div>
    )
}