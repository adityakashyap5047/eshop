"use client";

import { useQueryClient } from "@tanstack/react-query";
import useRequiredAuth from "apps/user-ui/src/hooks/useRequiredAuth";
import { useAuthStore } from "apps/user-ui/src/store/authStore";
import QuickActionCard from "apps/user-ui/src/shared/components/cards/quick-action-card";
import StatCard from "apps/user-ui/src/shared/components/cards/stat-card";
import ShippingAddressSection from "apps/user-ui/src/shared/components/shippingAddress";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { BadgeCheck, Bell, CheckCircle, Clock, Gift, Inbox, Loader2, Lock, LogOut, MapPin, Pencil, PhoneCall, Receipt, Settings, ShoppingBag, Truck, User } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import OrdersTable from "apps/user-ui/src/shared/components/orders-table";

interface UserType {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
    points?: number;
}

const page = () => {
    const {user: rawUser, isLoading} = useRequiredAuth();
    const { logout } = useAuthStore();
    const user = rawUser as UserType;

    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient(); 
    
    const queryTab = searchParams.get("active") || "Profile";
    const [activeTab, setActiveTab] = useState(queryTab);

    useEffect(() => {
        if(activeTab !== queryTab){
            const newParams = new URLSearchParams(searchParams);
            newParams.set("active", activeTab);
            router.replace(`/profile?${newParams.toString()}`); 
        }
    }, [activeTab, queryTab, searchParams, router]);

    const logOutHandler = async() => {
        try {
            await axiosInstance.get("/api/logout-user");
            
            logout();
            queryClient.clear();
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
            logout();
            queryClient.clear();
            window.location.href = "/";
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin w-8 h-8" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className='bg-gray-50 p-6 pb-14'>
            <div className="md:max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Welcome back,{" "}
                        <span className="text-blue-600">
                            {isLoading ? (
                                <Loader2 className="inline animate-spin w-5 h-5" />
                            ) : (
                                `${user?.name || "User"}`
                            )}
                        </span>
                        👋
                    </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Orders"
                        count={10}
                        Icon={Clock}
                    />
                    <StatCard
                        title="Processing Orders"
                        count={4}
                        Icon={Truck}
                    />
                    <StatCard
                        title="Completed Orders"
                        count={3}
                        Icon={CheckCircle}
                    />
                </div>
                            
                <div className="mt-10 flex flex-col md:flex-row gap-6">
                    <div className="bg-white p-4 rounded-md shadow-md border border-gray-100 w-full md:w-1/5">
                        <nav className="space-y-2">
                            <NavItem
                                label="Profile"
                                Icon={User}
                                active={activeTab === "Profile"}
                                onClick={() => setActiveTab("Profile")}
                            />
                            <NavItem
                                label="My Orders"
                                Icon={ShoppingBag}
                                active={activeTab === "My Orders"}
                                onClick={() => setActiveTab("My Orders")}
                            />
                            <NavItem
                                label="Inbox"
                                Icon={Inbox}
                                active={activeTab === "Inbox"}
                                onClick={() => router.push("/inbox")}
                            />
                            <NavItem
                                label="Notifications"
                                Icon={Bell}
                                active={activeTab === "Notifications"}
                                onClick={() => setActiveTab("Notifications")}
                            />
                            <NavItem
                                label="Shipping Address"
                                Icon={MapPin}
                                active={activeTab === "Shipping Address"}
                                onClick={() => setActiveTab("Shipping Address")}
                            />
                            <NavItem
                                label="Change Password"
                                Icon={Lock}
                                active={activeTab === "Change Password"}
                                onClick={() => setActiveTab("Change Password")}
                            />
                            <NavItem
                                label="Logout"
                                Icon={LogOut}
                                danger 
                                onClick={() => logOutHandler()}
                            />
                        </nav>
                    </div>

                    <div className="bg-white p-6 rounded-md shadow-md border border-gray-100 w-full md:w-[55%]">
                        <h2 className="text-xl underline italic  font-semibold text-gray-800 mb-4">
                            {activeTab}
                        </h2>
                        {activeTab === "Profile" && !isLoading && user ? (
                            <div className="space-y-4 text-sm text-gray-700">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={user?.avatar || "https://ik.imagekit.io/adityakashyap5047/Eshop/Cover%20Picture/image.png?updatedAt=1758872565520"}
                                        alt="User Avatar"
                                        width={60}
                                        height={60}
                                        className="w-16 h-16 border border-gray-200 rounded-full object-cover"
                                    />
                                    <button className="flex items-center gap-1 text-blue-500 text-xs font-medium">
                                        <Pencil className="w-4 h-4" /> Change Picture 
                                    </button>
                                </div>
                                <p>
                                    <span className="font-semibold">Name: </span>{user.name}
                                </p>
                                <p>
                                    <span className="font-semibold">Email: </span>{user.email}
                                </p>
                                <p>
                                    <span className="font-semibold">Joined: </span>{new Date(user.createdAt).toLocaleDateString()}
                                </p>
                                <p>
                                    <span className="font-semibold">Earned Points: </span>{user.points || 0}
                                </p>
                            </div>
                        ) : activeTab === "Shipping Address" ? (
                            <ShippingAddressSection />
                        ) : activeTab === "My Orders" ? (
                            <OrdersTable />
                        ) : (
                            <div>
                                <p>Welcome to Eshop</p>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-1/4 space-y-4">
                        <QuickActionCard
                            Icon={Gift}
                            title="Referral Program"
                            description="Invite friends and earn rewards."
                        />
                        <QuickActionCard
                            Icon={BadgeCheck}
                            title="Your Badges"
                            description="View your earned achievements."
                        />
                        <QuickActionCard
                            Icon={Settings}
                            title="Account Settings"
                            description="Manage preferences and security."
                        />
                        <QuickActionCard
                            Icon={Receipt}
                            title="Billing History"
                            description="Check your recent payments."
                        />
                        <QuickActionCard
                            Icon={PhoneCall}
                            title="Support Center"
                            description="Need help? Contact support."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page

const NavItem = ({label, Icon, active, danger, onClick}: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
            active 
                ? "bg-blue-100 text-blue-600"
                : danger
                ? "text-red-500 hover:bg-red-50"
                : "text-gray-700 hover:bg-gray-100"    
        }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
)