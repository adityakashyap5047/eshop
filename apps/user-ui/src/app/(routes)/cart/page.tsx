"use client";

import useDeviceInfo from "apps/user-ui/src/hooks/useDeviceInfo";
import useLocation from "apps/user-ui/src/hooks/useLocation";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Page = () => {
    const router = useRouter();
    const {user} = useUser();
    const location = useLocation();
    const deviceInfo = useDeviceInfo();
    const cart = useStore((state: any) => state.cart);
    const removeFromCart = useStore((state: any) => state.removeFromCart);

    const [discountedProductId, setDiscountedProductId] = useState("");
    const [discountPercet, setDiscountPercent] = useState(0);

    const decreasingQuantity = (id: string) => {
        useStore.setState((state: any) => ({
            cart: state.cart.map((item: any) => item.id === id && item.quantity > 1 ? {...item, quantity: item.quantity - 1} : item)
        }))
    }

    const increasingQuantity = (id: string) => {
        useStore.setState((state: any) => ({
            cart: state.cart.map((item: any) => item.id === id ? {...item, quantity: (item.quantity ?? 1) + 1} : item)
        }))
    }

    const subTotal = cart.reduce(
        (total: number, item: any) => total + item.sale_price * (item.quantity ?? 1),
        0
    )

    const removeItem = (id: string) => {
        removeFromCart(id, user, location, deviceInfo);
    }

  return (
    <div className="w-full bg-white">
        <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
            <div className="pb-[50px]">
                <h1 className="md:pt-[50px] font-medium text-[44px] leading-1 mb-[16px] font-jost">
                    Shopping Cart
                </h1>
                <Link href='/' className='text-[#55585b] hover:underline'>
                    Home 
                </Link>
                <span className='inline-block p-[1.5px] mx-1 bg-[#a8acbo] rounded-full'>.</span>
                <span className='text-[#55585b]'>Wishlist</span>
            </div>

            {cart?.length === 0 ? (
                <div className="text-center text-gray-600 text-lg">
                    Your cart is empty! Start adding products.
                </div>
            ) : (
                <div>
                    <div className="lg:flex items-start gap-10">
                        <table className="w-full lg:w-[70%] border-collapse">
                            <thead className="bg-[#f1f3f4] rounded">
                                <tr>
                                    <th className="py-3 text-left pl-6 align-middle">Product</th>
                                    <th className="py-3 text-left align-middle">Price</th>
                                    <th className="py-3 text-left align-middle">Quantity</th>
                                    <th className="py-3 text-left align-middle"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart?.map((item: any) => (
                                    <tr key={item.id} className="border-b border-b-[#0000000e]">
                                        <td className="flex items-center gap-4 p-4">
                                            <Image
                                                src={item.images[0]?.url}
                                                alt={item.title}
                                                width={80}
                                                height={80}
                                                className='rounded-md'
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.title}</span>
                                                {item?.selectedOptions && (
                                                    <div className="text-sm text-gray-500">
                                                        {item?.selectedOptions?.color && (
                                                            <span>
                                                                Color: {" "}
                                                                <span style={{ backgroundColor: item?.selectedOptions?.color, width: '12px', height: '12px', borderRadius: "25%", display: 'inline-block'}} />
                                                            </span>
                                                        )}
                                                        {item?.selectedOptions?.size && (
                                                            <span className="ml-2">
                                                                Size: {item?.selectedOptions?.size}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 text-lg text-center">
                                            {item?.id === discountedProductId ? (
                                                <div className="flex flex-col items-center ">
                                                    <span className="line-through text-gray-500 text-sm">
                                                        ${item.sale_price.toFixed(2)}
                                                    </span>{" "}
                                                    <span className="text-green-600 font-semibold">
                                                        ${((item.sale_price * (100 - discountPercet)) / 100).toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-green-700 bg-white">
                                                        Discount Applied
                                                    </span>
                                                </div>
                                            ) : (
                                                <span>
                                                    ${item.sale_price.toFixed(2)}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex justify-center items-center border border-gray-200 rounded-[20px] w-[90px] p-[2px]">
                                                <button 
                                                    onClick={() => decreasingQuantity(item.id)}
                                                    className='text-black cursor-pointer text-xl'>
                                                    -
                                                </button>
                                                <span className='px-4'>{item?.quantity}</span>
                                                <button 
                                                    onClick={() => increasingQuantity(item.id)}
                                                    className='text-black cursor-pointer text-xl'>
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className="text-[#818487] cursor-pointer hover:text-[#ff1824] transition duration-200"
                                                onClick={() => removeItem(item?.id)}
                                            >
                                                <Trash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
        
    </div>
  )
}

export default Page