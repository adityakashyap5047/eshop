"use client";

import { navItems } from "apps/user-ui/src/configs/constants";
import { AlignLeft, ChevronDown, ChevronUp, HeartIcon, ShoppingCartIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useStore } from "apps/user-ui/src/store";

interface UserType {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
    points?: number;
}

const HeaderBottom = () => {

    const [show, setShow] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const { user: rawUser, isLoading } = useUser();
    const wishList = useStore((state: any) => state.whishList);
    const cart = useStore((state: any) => state.cart);
    const user = rawUser as UserType;

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        }

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [])

  return (
    <div className={`w-full transition-all duration-300 ${isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"}`}>
        <div className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? 'pt-3' : 'py-0'}`}>
            {/* All Dropdown Container */}
            <div 
                className="relative"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            >
                {/* Dropdown Trigger */}
                <div 
                    className={`w-[260px] ${isSticky && "-mb-2"} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
                >
                    <div className="flex items-center gap-2">
                        <AlignLeft color="#fff" />
                        <span className="text-white font-medium">All Departments</span>
                    </div>
                    {!show ? <ChevronDown color="#fff" /> : <ChevronUp color="#fff" />}
                </div>

                {/* Dropdown Menu  */}
                {show && (
                    <div className={`absolute left-0 ${isSticky ? "top-[50px]" : "top-[50px]"} w-[260px] h-[400px] bg-[#f5f5f5] shadow-lg border border-gray-200 z-50`}>
                        {/* Add your dropdown content here */}
                        <div className="p-4">
                            <p className="text-gray-600">Dropdown menu content goes here</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <div className="flex items-center">
                {navItems.map((i: NavItemsTypes, index: number) => (
                    <Link className="px-5 font-medium text-lg" key={index} href={i.href}>{i.title}</Link>
                ))}
            </div>

            <div>
                {isSticky && (
                    <div className='flex items-center pb-2 gap-8'>
                        <div className="flex items-center gap-2">
                            {!isLoading && user ? (
                                <>
                                    <Link href={"/profile"} className='border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]'>
                                        <UserIcon />
                                    </Link>
                                    <Link href={"/profile"}>
                                        <span className='block font-medium'>Hello, </span>
                                        <span className='font-semibold'>{user?.name?.split(" ")[0]}</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href={"/login"} className='border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]'>
                                        <UserIcon />
                                    </Link>
                                    <Link href={"/login"}>
                                        <span className='block font-medium'>Hello, </span>
                                        <span className='font-semibold'>{isLoading ? "..." : "Sign In"}</span>
                                    </Link>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-5">
                            <Link href={"/wishlist"} className="relative">
                                <HeartIcon />
                                <div className='w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                                    <span className='text-white font-medium text-sm'>{wishList?.length || 0}</span>
                                </div>
                            </Link>
                            <Link href={"/cart"} className="relative">
                                <ShoppingCartIcon />
                                <div className='w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                                    <span className='text-white font-medium text-sm'>{cart?.length || 0}</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

export default HeaderBottom