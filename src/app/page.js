import { redirect } from "next/navigation";
import Head from "next/head";

export default function Home() {
  redirect("/register");

  return (
    <>
      
      <div className="">
        page
      </div>
    </>
  );
}
