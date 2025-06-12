import Image from "next/image"

export const Footer = () => {

    return (
        <footer className="w-full h-25 bg-[#2563EBDB] flex flex-col  justify-center items-center gap-2.5 ">
            <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
                <Image width={100} height={100} alt="Logo" src="/images/imagewhite.png" className="h-[22px] w-[122px]" />
                <p className="text-white font-[400] text-sm">© 2025 Blog genzet. All rights reserved.</p>
            </div>
        </footer>
    )
}