'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

const schema = z.object({
    username: z.string().nonempty("Username harus diisi"),
    password: z.string().nonempty("Password harus diisi")
})

export const Login = () => {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isWrong, setIsWrong] = useState(false)

    const { register, handleSubmit, setFocus, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema)
    })

    const onSubmit = async (data) => {
        try {
            const response = await axiosInstance.post("/auth/login", {
                username: data.username,
                password: data.password,
            })
            
            localStorage.setItem("accessToken", response.data.token)
            router.push('/article')
            toast.success("Berhasil login!")
        } catch (error) {
            setIsWrong(true)
            setFocus("username")
            setValue("username", "")
            setValue("password", "")
            toast.error("Nama atau password salah!")

            setTimeout(() => {
                setIsWrong(false)
            }, 4000);
        }
    }

    return (
        <div className="bg-gray-100 w-full min-h-screen flex justify-center items-center">
            <div className="w-[400px] py-10 px-4 bg-white rounded flex justify-center items-center gap-6 flex-col ">
                <img src="/images/image.png" className="w-[134px] h-6 " />
                <form onSubmit={handleSubmit(onSubmit)} className="gap-3 flex flex-col w-full">
                    <div className="flex gap-3">
                        <Label htmlFor="username">Username</Label>
                        {isWrong && <span className="text-red-500 text-sm">Username atau password salah</span>}
                        {errors.username && <span className="text-red-500 text-sm">{errors.username.message}</span>}
                    </div>
                    <Input id="username" placeholder="Input username" {...register("username")} />
                    <div className="flex gap-3">
                        <Label htmlFor="password">Password</Label>
                        {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                    </div>
                    <div className="relative">
                        <Input id="password" placeholder="Input password" type={showPassword ? "text" : "password"} {...register("password")} />
                        {showPassword ?
                            <Eye onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1.5 cursor-pointer" />
                            :
                            <EyeOff onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1.5 cursor-pointer" />
                        }
                    </div>
                    <Button disabled={isSubmitting} className={`cursor-pointer mt-3 bg-blue-600 hover:bg-blue-700`}>{isSubmitting ? "Login..." : "Login"}</Button>
                </form>
                <p>Don't have an account? <a href="/register" className="text-blue-600 underline">Register</a></p>
            </div>
        </div>
    )
}

export default Login;