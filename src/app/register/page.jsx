'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import Image from "next/image";

const schema = z.object({
    username: z.string().min(3, "Minimal 3 karakter").max(15, "Maksimal 15 karakter"),
    password: z.string().min(8, "Minimal 8 karakter").regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
        "Password harus mengandung huruf dan angka"
    ),
    role: z.enum(["User", "Admin"], { required_error: "Pilih salah satu" })
})

export const Register = () => {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)

    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema)
    })

    const onSubmit = async (data) => {
        try {
            await axiosInstance.post("/auth/register", {
                username: data.username,
                password: data.password,
                role: data.role,
            })
            toast.success("Data has been created")
        
            router.push('/login')
        } catch (error) {
            if (error.response?.status === 400) {
                toast.error("Nama sudah dipakai")            
            } else {
                toast.error("Internal server error")            
            }
        }
    }

    return (
        <div className="bg-gray-100 w-full min-h-screen flex justify-center items-center">
            <div className="w-[400px] py-10 px-4 bg-white rounded flex justify-center items-center gap-6 flex-col ">
                <Image width={100} height={100} alt="Logo" src="/images/image.png" className="w-[134px] h-6 " />
                <form onSubmit={handleSubmit(onSubmit)} className="gap-3 flex flex-col w-full">
                    <div className="flex gap-3">
                        <Label htmlFor="username">Username</Label>
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
                    <div className="flex gap-3">
                        <Label htmlFor="role">Role</Label>
                        {errors.role && <span className="text-red-500 text-sm">{errors.role.message}</span>}
                    </div>
                    <Controller name="role" control={control} defaultValue={undefined}
                        render={({ field }) => (
                            <Select id="role" onValueChange={field.onChange} value={field.value} >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Role</SelectLabel>
                                        <SelectItem value="User">User</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <Button disabled={isSubmitting} className="mt-3 bg-blue-600 hover:bg-blue-700 cursor-pointer">{isSubmitting ? "Registering..." : "Register"}</Button>
                </form>
                <p>Already have an account? <a href="/login" className="text-blue-600 underline">Login</a></p>
            </div>
        </div>
    )
}

export default Register;