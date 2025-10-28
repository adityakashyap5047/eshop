"use client";

import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

const Hero = () => {

    const router = useRouter();
    const [banner, setBanner] = useState<string | null>(null);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URI}/admin/api/get-all`);
                if (res.data.banner) {
                    setBanner(res.data.banner);
                }
            } catch (error) {
                console.error("Failed to fetch banner", error);
            }
        };
        fetchBanner();
    }, []);

    return (
        <div 
            className="h-main flex flex-col justify-center w-full relative"
            style={{
                backgroundImage: banner ? `url(${banner})` : 'none',
                backgroundColor: banner ? 'transparent' : '#115061',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Overlay for better text readability */}
            {banner && (
                <div className="absolute inset-0 bg-black/40"></div>
            )}
            <div className="md:w-[80%] w-[90%] m-auto md:flex h-full items-center relative z-10">
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
            <div className="md:w-[1/2] flex justify-end pr-8 md:pr-16">
                <Image
                    src={"https://ik.imagekit.io/adityakashyap5047/Eshop/Customizations/watch.png?updatedAt=1761637504919"}
                    alt="Hero Image"
                    width={300}
                    height={300}
                    className="mr-4 md:mr-8"
                />
            </div>
            </div>
        </div>
    )
}

export default Hero