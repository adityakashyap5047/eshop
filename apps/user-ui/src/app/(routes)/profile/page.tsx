"use client";

import useUser from "apps/user-ui/src/hooks/useUser";
import StatCard from "apps/user-ui/src/shared/components/cards/stat-card";
import { CheckCircle, Clock, Loader2, Truck } from "lucide-react";

const page = () => {
    const {user, isLoading} = useUser();

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
                            
                
            </div>
        </div>
    )
}

export default page