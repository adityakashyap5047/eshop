"use client";

import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react";

const statuses = [
    "Ordered",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered"
]

const Page = () => {
    const params = useParams();
    const orderId = params.id as string;
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const fetchOrder = async() => {
        try {
            const res = await axiosInstance.get(
                `/order/api/get-order-details/${orderId}`
            )
            setOrder(res.data.order);
        } catch (error) {
            setLoading(false);
            console.error("Error fetching order details:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(orderId) fetchOrder();
    }, [orderId]);

    if(loading) {
        return (
            <div className="flex justify-center items-center h-[40vh]">
                <Loader2 className="animate-spin h-6 w-6 text-gray-600" />
            </div>
        )
    }

    if(!order) {
        return <p className="text-center text-sm text-red-500">Order not found</p>
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="my-4">
                <span className="text-white flex items-center gap-2 font-semibold cursor-pointer" onClick={() => router.push("/dashboard/orders")}>
                    <ArrowLeft /> Go Back to Dashboard
                </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-200 mb-4">Order #{order.id.slice(-6)}</h1>
            <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
                    {statuses.map((step, idx) => {
                        const current = step === order.deliveryStatus;
                        const passed = statuses.indexOf(order.deliveryStatus) >= idx;

                        return (
                            <div
                                key={step}
                                className={`flex-1 text-left ${
                                    current ? "text-blue-600" : passed ? "text-green-600" : "text-gray-400"
                                }`}
                            >
                                {step}
                            </div>
                        )
                    })}
                </div>
                <div className="flex items-center">
                    {statuses.map((step, idx) => {
                        const reached = idx <= statuses.indexOf(order.deliveryStatus);

                        return (
                            <div
                                key={step}
                                className="flex flex-1 items-center"
                            >
                                <div className={`w-4 h-4 rounded-full ${reached ? "bg-blue-600" : "bg-gray-300"}`} />
                                {idx !== statuses.length - 1 && (
                                    <div className={`flex-1 h-1 ${
                                        reached ? "bg-blue-600" : "bg-gray-300"
                                    }`}></div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="mb-6 space-y-1 text-sm text-gray-200">
                <p>
                    <span className="font-semibold">Payment Status</span>{" "}
                    <span className="text-green-600 font-medium">{order.status}</span>
                </p>
                <p>
                    <span className="font-semibold">Total Paid:</span>{" "}
                    <span className="font-medium">${order.total.toFixed(2)}</span>
                </p>

                {order.discountAmount > 0 && (
                    <p>
                        <span className="font-semibold">Discount Applied:</span>{" "}
                        <span className="text-green-400">
                            -${order.discountAmount.toFixed(2)} (
                                {order.couponCode?.discountType === "percentage"  ? `${order.couponCode?.discountValue}%` : `$${order.couponCode?.discountValue}`}{" "}
                            )
                        </span>

                    </p>
                )}

                {order.couponCode && (
                    <p>
                        <span className="font-semibold">Coupon Used: </span>{" "}
                        <span className="text-blue-400">{order.couponCode.public_name}</span>
                    </p>
                )}

                <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                </p>
            </div>

            {order.shippingAddress && (
                <div className="mb-6 text-sm text-gray-300">
                    <h2 className="text-md font-semibold mb-2">Shipping Address</h2>
                    <p>{order.shippingAddress.name}</p>
                    <p>
                        {order.shippingAddress.street}, {order.shippingAddress.city}, {" "}
                        {order.shippingAddress.zip}
                    </p>
                    <p>
                        {order.shippingAddress.country}
                    </p>
                </div>
            )}

            <div>
                <h2 className="text-lg font-semibold text-gray-300 mb-4">
                    Order Items
                </h2>
                <div className="space-y-4">
                    {order.items.map((item: any) => (
                        <div
                            key={item.productId}
                            className="border border-gray-200 rounded-md p-4 flex items-center gap-4"
                        >
                            <Image
                                src={item.product.images[0]?.url}
                                alt={item.product.title || "Product Image"}
                                className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                width={200}
                                height={200}
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-200">{item.product.title}</p>
                                <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                                {
                                    item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            {Object.entries(item.selectedOptions).map(([key, value]: [string, any]) => 
                                                value && (
                                                    <span className="mr-3" key={key}>
                                                        <span className="font-medium capitalize">{key}:</span>{" "}
                                                        {value}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    )
                                }
                                <p className="text-sm text-gray-200 font-semibold">Price: ${item.price.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Page