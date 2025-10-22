"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Globe, MapPin, Pencil, Star, Users, Loader2, Instagram, Facebook, Youtube, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import useSeller from "../hooks/useSeller";
import ProductCard from "../shared/components/product-card";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const TABS = ["Products", "Offers", "Reviews"];

const getSocialIcon = (type: string, size: number = 20) => {
    const iconProps = { size, className: "text-white" };
    
    switch (type.toLowerCase()) {
        case 'facebook':
            return <Facebook {...iconProps} />;
        case 'instagram':
            return <Instagram {...iconProps} />;
        case 'twitter':
        case 'x':
            return <Twitter {...iconProps} />;
        case 'youtube':
            return <Youtube {...iconProps} />;
        case 'linkedin':
            return <Linkedin {...iconProps} />;
        default:
            return <Globe {...iconProps} />;
    }
};

const getSocialUrl = (type: string, username: string) => {
    const baseUrls: { [key: string]: string } = {
        facebook: 'https://www.facebook.com/',
        instagram: 'https://www.instagram.com/',
        twitter: 'https://twitter.com/',
        x: 'https://x.com/',
        youtube: 'https://www.youtube.com/@',
        linkedin: 'https://www.linkedin.com/in/'
    };
    
    const baseUrl = baseUrls[type.toLowerCase()];
    if (!baseUrl) return `https://${username}`;
    
    const cleanUsername = username.replace('@', '');
    return `${baseUrl}${cleanUsername}`;
};

const getSocialColor = (type: string) => {
    const colors: { [key: string]: string } = {
        facebook: 'bg-blue-600 hover:bg-blue-700',
        instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
        twitter: 'bg-blue-400 hover:bg-blue-500',
        x: 'bg-black hover:bg-gray-800',
        youtube: 'bg-red-600 hover:bg-red-700',
        linkedin: 'bg-blue-700 hover:bg-blue-800'
    };
    
    return colors[type.toLowerCase()] || 'bg-gray-600 hover:bg-gray-700';
};

const SellerProfile = () => {
    const [activeTab, setActiveTab] = useState("Products");
    const [uploading, setUploading] = useState({ avatar: false, banner: false });

    const { seller, isLoading } = useSeller();
    const shop = seller?.shop;
    const queryClient = useQueryClient();

    const router = useRouter();

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const uploadAvatar = async (file: File) => {
        if (!seller?.id) {
            toast.error("Seller ID not found");
            return;
        }

        setUploading(prev => ({ ...prev, avatar: true }));
        
        try {
            const base64Image = await convertToBase64(file);
            
            const response = await axiosInstance.put(`/api/change-shop-avatar/${seller.id}`, {
                fileName: base64Image
            });
            
            if (response.data.success) {
                toast.success("Avatar updated successfully!");
                queryClient.invalidateQueries({ queryKey: ["seller"] });
            } else {
                toast.error(response.data.message || "Failed to update avatar");
            }
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error(error.response?.data?.message || "Failed to upload avatar");
        } finally {
            setUploading(prev => ({ ...prev, avatar: false }));
        }
    };

    const uploadCoverBanner = async (file: File) => {
        if (!seller?.id) {
            toast.error("Seller ID not found");
            return;
        }

        setUploading(prev => ({ ...prev, banner: true }));
        
        try {
            const base64Image = await convertToBase64(file);
            
            const response = await axiosInstance.put(`/api/change-shop-banner/${seller.id}`, {
                fileName: base64Image
            });
            
            if (response.data.success) {
                toast.success("Cover banner updated successfully!");
                queryClient.invalidateQueries({ queryKey: ["seller"] });
            } else {
                toast.error(response.data.message || "Failed to update cover banner");
            }
        } catch (error: any) {
            console.error('Error uploading cover banner:', error);
            toast.error(error.response?.data?.message || "Failed to upload cover banner");
        } finally {
            setUploading(prev => ({ ...prev, banner: false }));
        }
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size should be less than 5MB");
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                toast.error("Please select a valid image file");
                return;
            }
            
            uploadAvatar(file);
        }
    };

    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size should be less than 5MB");
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                toast.error("Please select a valid image file");
                return;
            }
            
            uploadCoverBanner(file);
        }
    };

    const {data: products, isLoading: isProductLoading} = useQuery({
        queryKey: ["seller-products", shop?.id],
        queryFn: async() => {
            if (!shop?.id) {
                throw new Error("Shop ID not available");
            }
            const res = await axiosInstance.get(
                `/api/get-seller-products/${shop.id}?page=1&limit-10`
            );
            return res.data.products;
        },
        enabled: !!shop?.id && !isLoading, 
        staleTime: 1000 * 60 * 5
    });

    const {data: events, isLoading: isEventLoading} = useQuery({
        queryKey: ["seller-events", shop?.id],
        queryFn: async() => {
            if (!shop?.id) {
                throw new Error("Shop ID not available");
            }
            const res = await axiosInstance.get(
                `/api/get-seller-events/${shop.id}?page=1&limit-10`
            );
            return res.data.events;
        },
        enabled: !!shop?.id && !isLoading, 
        staleTime: 1000 * 60 * 5
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center text-white">
                    <Loader2 size={40} className="animate-spin mb-4"/>
                    <p className="text-lg">Loading seller profile...</p>
                </div>
            </div>
        );
    }

    // Don't render anything if seller is not authenticated (will redirect in useSeller hook)
    if (!seller) {
        return null;
    }

    return (
        <div>
            <div className="relative w-full flex justify-center">
                <Image
                    src={
                        shop?.coverBanner || 
                            "https://ik.imagekit.io/adityakashyap5047/Eshop/Cover%20Picture/Banner_Image.png?updatedAt=1758872731741"   
                    }
                    alt={"Seller Cover"}
                    className={`w-full h-[400px] object-cover ${uploading.banner ? 'opacity-70' : ''}`}
                    width={1200}
                    height={300}
                />
                {uploading.banner && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="flex flex-col items-center text-white">
                            <Loader2 size={32} className="animate-spin mb-2"/>
                            <p>Uploading banner...</p>
                        </div>
                    </div>
                )}
                <input 
                    type="file" 
                    hidden 
                    name="seller_cover" 
                    id="seller_cover" 
                    accept="image/*"
                    onChange={handleBannerChange}
                    disabled={uploading.banner}
                />
                {seller?.id && (
                    <button 
                        className="absolute top-4 right-4 flex gap-2 bg-slate-900 text-gray-200 justify-center items-center px-2 py-1 rounded-md disabled:opacity-50"
                        disabled={uploading.banner}
                    >
                        <label htmlFor="seller_cover" className="flex gap-2 cursor-pointer justify-center items-center">
                            {uploading.banner ? (
                                <>
                                    <Loader2 size={16} className="animate-spin"/>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Pencil size={16}/>
                                    Edit Cover
                                </>
                            )}
                        </label>
                    </button>
                )}
            </div>

            <div className="w-[85%] lg:w-[70%] mt-[-50px] mx-auto relative z-20 flex gap-6 flex-col lg:flex-row">
                <div className="bg-gray-500 p-6 rounded-lg shadow-lg flex-1">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                        <div className="relative w-[100px] h-[100px] rounded-full border-4 border-gray-400">
                            <Image
                                src={shop?.avatar || "https://ik.imagekit.io/adityakashyap5047/Eshop/Cover%20Picture/image.png?updatedAt=1758872565520"}
                                alt="Seller Avatar"
                                layout="fill"
                                objectFit="cover"
                                className={`rounded-full ${uploading.avatar ? 'opacity-70' : ''}`}
                            />
                            {uploading.avatar && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                    <Loader2 size={20} className="animate-spin text-white"/>
                                </div>
                            )}
                            <input 
                                type="file" 
                                hidden 
                                name="seller_avatar" 
                                id="seller_avatar" 
                                accept="image/*"
                                onChange={handleAvatarChange}
                                disabled={uploading.avatar}
                            />
                            {seller?.id && (
                                <button 
                                    className="absolute bottom-2 right-2 p-1 bg-gray-400 text-white rounded-full shadow-lg disabled:opacity-50"
                                    disabled={uploading.avatar}
                                >
                                    <label htmlFor="seller_avatar" className="flex gap-2 cursor-pointer justify-center items-center">
                                        {uploading.avatar ? (
                                            <Loader2 size={16} className="animate-spin"/>
                                        ) : (
                                            <Pencil size={16}/>
                                        )}
                                    </label>
                                </button>
                            )}
                        </div>
                        <div className="flex-1 w-full">
                            <div className="flex justify-between">
                                <h1 className="text-2xl font-semibold text-slate-900 cursor-pointer hover:underline" onClick={() => router.push("/dashboard")}>
                                    {shop?.name || "Eshop Seller"}
                                </h1>
                                {seller?.id && <button onClick={() => router.push('/edit-profile')} className="flex gap-2 bg-slate-900 text-gray-200 justify-center items-center px-2 py-1 rounded-md"><Pencil size={18} />Edit Profile</button>}
                            </div>
                            <p className="text-slate-800 text-sm mt-1">
                                {shop?.bio || "No bio available."}
                            </p>

                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center text-blue-400 gap-1">
                                    <Star fill="#60a5fa" size={18} />{" "}
                                    <span>{shop?.ratings}</span>
                                </div>
                                <div className="flex items-center text-slate-700 gap-1">
                                    <Users size={18} /> <span>{shop?.followersCount || 0} Followers</span>
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
                    </div>
                </div>

                <div className="bg-gray-500 p-6 rounded-lg shadow-lg w-full lg:w-[30%]">
                    <h2 className="text-xl font-semibold text-slate-900">Shop Details</h2>

                    <div className="flex items-center gap-3 mt-3 to-sky-700">
                        <Calendar size={18} />
                        <span>
                            Joined At: {new Date(shop?.createdAt!).toLocaleDateString('en-GB')}
                        </span>
                    </div>

                    {shop?.website && (
                        <div className="flex items-center gap-3 mt-3 text-sky-700">
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
                                        href={getSocialUrl(link.type, link.username)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`p-2 rounded-full transition-all duration-200 ${getSocialColor(link.type)}`}
                                        title={`Follow us on ${link.type}`}
                                    >
                                        {getSocialIcon(link.type, 18)}
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
                                activeTab === tab ? "text-blue-400 border-b-2 border-blue-600" : "text-gray-200"
                            } transition`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-gray-400 rounded-lg my-4 to-sky-700">
                    {activeTab === "Products" && <>
                        {isProductLoading && <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {isProductLoading && (
                                <>
                                    {Array.from({length: 10}).map((_, index) => (
                                        <div className="h-[250px] bg-gray-500 animate-pluse rounded-xl" key={index} />
                                    ))}
                                </>
                            )}
                        </div>}
                        {!isProductLoading && (!products || products?.length === 0) && (
                            <p className="text-center py-4">No products available yet!</p>
                        )}
                        {!isProductLoading && products && products.length > 0 && <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {products?.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>}
                    </>}

                    {activeTab === "Offers" && <>
                        {isEventLoading && <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {isEventLoading && (
                                <>
                                    {Array.from({length: 10}).map((_, index) => (
                                        <div className="h-[250px] bg-gray-500 animate-pluse rounded-xl" key={index} />
                                    ))}
                                </>
                            )}
                        </div>}
                        {!isEventLoading && (!events || events?.length === 0) && (
                            <p className="text-center py-4">No offers available yet!</p>
                        )}
                        {!isEventLoading && events && events?.length > 0 && <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {events?.map((product: any) => (
                                <ProductCard key={product.id} isEvent={true} product={product} />
                            ))}
                        </div>}
                    </>}
                    {activeTab === "Reviews" && (
                        <div>
                            <p className="text-center py-4">No Reviews available yet!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SellerProfile