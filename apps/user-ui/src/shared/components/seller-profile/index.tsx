"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sendKafkaEvent } from "apps/user-ui/src/actions/track-user";
import useDeviceInfo from "apps/user-ui/src/hooks/useDeviceInfo";
import useLocation from "apps/user-ui/src/hooks/useLocation";
import useRequiredAuth from "apps/user-ui/src/hooks/useRequiredAuth";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Calendar, Clock, Globe, Heart, MapPin, Star, Users, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "../cards/product-card";

const TABS = ["Products", "Offers", "Reviews"];

const SellerProfile = ({shop, followersCount}: any) => {
    const [activeTab, setActiveTab] = useState("Products");
    const [followers, setFollowers] = useState(followersCount);
    const [isFollowing, setIsFollowing] = useState(false);

    const { user } = useRequiredAuth();
    const location = useLocation();
    const deviceInfo = useDeviceInfo();
    const queryClient = useQueryClient();

    useEffect(() => {
        const fetchFollowStatus = async() => {
            if(!shop?.id) return;
            try {
                const res = await axiosInstance.get(
                    `/api/is-following/${shop?.id}`
                );
                setIsFollowing(res.data.isFollowing !== null);
            } catch (error) {
                console.error("Failed to fetch follow status", error);
            }
        };

        fetchFollowStatus();
    }, [shop?.id]);

    const {data: products, isLoading: isProductLoading} = useQuery({
        queryKey: ["seller-products"],
        queryFn: async() => {
            const res = await axiosInstance.get(
                `/api/get-seller-products/${shop?.id}?page=1&limit-10`
            );
            return res.data.products;
        },
        staleTime: 1000 * 60 * 5
    });

    const {data: events, isLoading: isEventLoading} = useQuery({
        queryKey: ["seller-events"],
        queryFn: async() => {
            const res = await axiosInstance.get(
                `/api/get-seller-events/${shop?.id}?page=1&limit-10`
            );
            return res.data.products;
        },
        staleTime: 1000 * 60 * 5
    });
    
    const toggleFollowingMutation = useMutation({
        mutationFn: async() => {
            if(isFollowing) {
                await axiosInstance.post("/api/unfollow-shop", {
                    shopId: shop?.id,
                });
            } else {
                await axiosInstance.post("/api/follow-shop", {
                    shopId: shop?.id,
                });
            }
        },
        onSuccess: () => {
            if(isFollowing){
                setFollowers(followers - 1);
            } else {
                setFollowers(followers + 1);
            }
            setIsFollowing((prev) => !prev);
            queryClient.invalidateQueries({
                queryKey: ["is-following", shop?.id],
            });
        },
        onError: () => {
            console.error("Failed to follow/unfollow the shop");
        }
    });
    useEffect(() => {
        if(!isProductLoading) {
            if(!location || !deviceInfo || !(user as any)?.id) return;
        
            sendKafkaEvent({
                userId: (user as any)?.id,
                shopId: shop?.id,
                action: "shop_visit",
                country: location?.country || "unknown",
                city: location?.city || "unknown",
                device: deviceInfo || "Unknown Device"
            })
        }
    }, [location, deviceInfo, isProductLoading]);

    return (
        <div>
            <div className="relative w-full flex justify-center">
                <Image
                    src={
                        shop?.coverBanner || 
                            "https://ik.imagekit.io/adityakashyap5047/Eshop/Cover%20Picture/Banner_Image.png?updatedAt=1758872731741"   
                    }
                    alt={"Seller Cover"}
                    className="w-full h-[400px] object-cover"
                    width={1200}
                    height={300}
                />
            </div>

            <div className="w-[85%] lg:w-[70%] mt-[-50px] mx-auto relative z-20 flex gap-6 flex-col lg:flex-row">
                <div className="bg-gray-200 p-6 rounded-lg shadow-lg flex-1">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                        <div className="relative w-[100px] h-[100px] rounded-full border-4 border-white">
                            <Image
                                src={shop?.avatar || "https://ik.imagekit.io/adityakashyap5047/Eshop/Cover%20Picture/image.png?updatedAt=1758872565520"}
                                alt="Seller Avatar"
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <h1 className="text-2xl font-semibold text-slate-900">
                                {shop?.name}
                            </h1>
                            <p className="text-slate-800 text-sm mt-1">
                                {shop?.bio || "No bio available."}
                            </p>

                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center text-blue-400 gap-1">
                                    <Star fill="#60a5fa" size={18} />{" "}
                                    <span>{shop?.ratings || "N/A"}</span>
                                </div>
                                <div className="flex items-center text-slate-700 gap-1">
                                    <Users size={18} /> <span>{followers} Followers</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-3 text-slate-700">
                                <Clock size={18} />
                                <span>{shop?.opening_hours || 'Mon - Sat: 9 AM - 6 PM'}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-3 text-slate-700">
                                <MapPin size={18} />{" "}
                                <span>{shop?.address || "No address provided"}</span>
                            </div>
                        </div>

                        <button
                            className={`px-6 py-2 h-[40px] rounded-lg font-semibold flex items-center
                                ${isFollowing ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}
                            onClick={() => toggleFollowingMutation.mutate()}
                            disabled={toggleFollowingMutation.isPending}
                        >
                            <Heart size={18} />
                            {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    </div>
                </div>

                <div className="bg-gray-200 p-6 rounded-lg shadow-lg w-full lg:w-[30%]">
                    <h2 className="text-xl font-semibold text-slate-900">Shop Details</h2>

                    <div className="flex items-center gap-3 mt-3 to-sky-700">
                        <Calendar size={18} />
                        <span>
                            Joined At: {new Date(shop?.createdAt!).toLocaleDateString('en-GB')}
                        </span>
                    </div>

                    {shop?.website && (
                        <div className="flex items-center gap-3 mt-3 to-sky-700">
                            <Globe size={18} />
                            <Link
                                href={shop?.website}
                                className="hover:underline to-blue-600"
                            >
                                {shop?.website}
                            </Link>
                        </div>
                    )}

                    {shop?.socialLinks && shop?.socialLinks.length > 0 && (
                        <div className="mt-3">
                            <h3 className="text-slate-700 text-lg font-medium">Follow Us:</h3>
                            <div className="flex gap-3 mt-2">
                                {shop?.socialLinks?.map((link: any, index: number) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="opacity-[.9]"
                                    >
                                        {link.type === "x" ? <XIcon /> : <Globe />}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-[85%] lg:w-[70%] mx-auto mt-8">
                <div className="flex border-b border-gray-300">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-6 text-lg font-semibold ${
                                activeTab === tab ? "text-slate-800 border-b-2 border-blue-600" : "text-sky-600"
                            } transition`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-gray-200 rounded-lg my-4 to-sky-700">
                    {activeTab === "Products" && (
                        <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {isProductLoading && (
                                <>
                                    {Array.from({length: 10}).map((_, index) => (
                                        <div className="h-[250px] bg-gray-300 animate-pluse rounded-xl" key={index} />
                                    ))}
                                </>
                            )}
                            {products?.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {activeTab === "Offers" && (
                        <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {isEventLoading && (
                                <>
                                    {Array.from({length: 10}).map((_, index) => (
                                        <div className="h-[250px] bg-gray-300 animate-pluse rounded-xl" key={index} />
                                    ))}
                                </>
                            )}
                            {events?.map((product: any) => (
                                <ProductCard key={product.id} isEvent={true} product={product} />
                            ))}
                            {events?.length === 0 && (
                                <p className="py-2">No offers available yet!</p>
                            )}
                        </div>
                    )}
                    {activeTab === "Reviews" && (
                        <div>
                            <p className="text-center py-5">No Reviews available yet!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SellerProfile