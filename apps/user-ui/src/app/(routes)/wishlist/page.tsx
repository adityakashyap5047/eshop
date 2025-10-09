"use client"

import useDeviceInfo from 'apps/user-ui/src/hooks/useDeviceInfo';
import useLocation from 'apps/user-ui/src/hooks/useLocation';
import useRequiredAuth from 'apps/user-ui/src/hooks/useRequiredAuth';
import { useStore } from 'apps/user-ui/src/store';
import { Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const WishListPage = () => {

    const { user, isLoading } = useRequiredAuth();
    const location = useLocation();
    const deviceInfo = useDeviceInfo();
    const addToCart = useStore((state: any) => state.addToCart)
    const removeFromWishList = useStore((state: any) => state.removeFromWhishList)
    const wishList = useStore((state: any) => state.whishList);

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

    const decreasingQuantity = (id: string) => {
        useStore.setState((state: any) => ({
            whishList: state.whishList.map((item: any) => item.id === id && item.quantity > 1 ? {...item, quantity: item.quantity - 1} : item)
        }))
    }

    const increasingQuantity = (id: string) => {
        useStore.setState((state: any) => ({
            whishList: state.whishList.map((item: any) => item.id === id ? {...item, quantity: (item.quantity ?? 1) + 1} : item)
        }))
    }

    const removeItem = (id: string) => {
        removeFromWishList(id, user, location, deviceInfo);
    }

    return (
        <div className='w-full bg-white'>
            <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
                <div className="pb-[50px]">
                    <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-[16px] font-jost">
                        Wishlist 
                    </h1>
                    <Link href='/' className='text-[#55585b] hover:underline'>
                        Home 
                    </Link>
                    <span className='inline-block p-[1.5px] mx-1 bg-[#a8acbo] rounded-full'>.</span>
                    <span className='text-[#55585b]'>Wishlist</span>
                </div>
                
                {wishList?.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg">
                        Your wishlist is empty! Start adding products.
                    </div>
                ) : (
                    <div className="flex flex-col gap-10">
                        <table className="w-full border-collapse">
                            <thead className='bg-[#f1f2f4]'>
                                <tr>
                                    <th className="py-3 text-left pl-4">Product</th>
                                    <th className="py-3 text-left">Price</th>
                                    <th className="py-3 text-left">Quantity</th>
                                    <th className="py-3 text-left">Action</th>
                                    <th className="py-3 text-left"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {wishList?.map((item: any) => (
                                    <tr key={item.id} className='border-b border-b-[#0000000e]'>
                                        <td className="flex items-center gap-3 p-4">
                                            <Image 
                                                src={item.images[0]?.url}
                                                alt={item.title}
                                                width={80}
                                                height={80}
                                                className='rounded-md'
                                            />
                                            <span>{item.title}</span>
                                        </td>
                                        <td className="pr-6 text-lg">${item.sale_price.toFixed(2)}</td>
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
                                        <td>
                                            <button 
                                                className="bg-[#2295ff] cursor-pointer text-white px-5 py-2 rounded-md hover:bg-[#007bff] transition-all"
                                                onClick={() => addToCart(item, user, location, deviceInfo)}
                                            >
                                                Add To Cart
                                            </button>
                                        </td>
                                        <td>
                                            <button className="text-[#818487] cursor-pointer hover:text-[#ff1826] transition duration-200">
                                                <Trash2 onClick={() => removeItem(item.id)} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default WishListPage