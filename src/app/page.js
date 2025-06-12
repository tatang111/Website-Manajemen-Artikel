"use client"

import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    redirect("/register")
  }, [])

  return (
    <div className="">
        page
    </div>
  );
}
