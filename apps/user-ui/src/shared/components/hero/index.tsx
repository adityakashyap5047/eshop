"use client";

import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation"

const Hero = () => {

    const router = useRouter();

    return (
        <div className="bg-[#115061] h-main flex flex-col justify-center w-full">
            <div className="md:w-[80%] w-[90%] m-auto md:flex h-full items-center">
                <div className="md:w-1/2">
                <p className="font-Roboto  font-normal text-white pb-2 text-xl">
                    Starting from 40$
                </p>
                <h1 className="text-white text-6xl font-extrabold font-Poppins">
                    The best watch <br />
                    Collection 2025
                </h1>
                <p className="font-Oregano text-3xl text-white pt-4">
                    Exclusive offer <span className="text-yellow-400">10%</span> off this week
                </p>
                <br />
                <button
                    onClick={() => router.push("/products")}
                    className="w-[140px] gap-2 font-semibold h-[40px] hover:text-white hover:bg-transparent hover:border hover:border-[#fff] bg-white text-[#115061] rounded-sm flex items-center justify-center"
                >
                    Shop Now <MoveRight />
                </button>
            </div>
            <div className="md:w-[1/2] flex justify-center">
                <Image
                    src={"/images/hero.png"}
                    alt="Hero Image"
                    width={500}
                    height={500}
                />
            </div>
            </div>
        </div>
    )
}

export default Hero