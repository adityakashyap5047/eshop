import Image from 'next/image'
import Link from 'next/link';
import React from 'react'
import Ratings from '../ratings';
import { Heart, MapPin, MessagesSquareIcon, ShoppingCart, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from 'apps/user-ui/src/store';
import useUser from 'apps/user-ui/src/hooks/useUser';
import useLocation from 'apps/user-ui/src/hooks/useLocation';
import useDeviceInfo from 'apps/user-ui/src/hooks/useDeviceInfo';

const ProductDetailsCard = ({data, setOpen}: {data: any, setOpen: (open: boolean) => void}) => {
    const [activeImage, setActiveImage] = React.useState(0);
    const [isSelected, setIsSelected] = React.useState(data?.colors?.[0] || '');
    const [isSizeSelected, setIsSizeSelected] = React.useState(data?.sizes?.[0] || '');
    const [quantity, setQuantity] = React.useState(1);
    const router = useRouter();

    const user = useUser();
    const location = useLocation();
    const deviceInfo = useDeviceInfo();

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const addToCart = useStore((state: any) => state.addToCart);
    const cart = useStore((state: any) => state.cart);
    const isInCart = cart?.some((item: any) => item.id === data?.id);

    const addToWishList = useStore((state: any) => state.addToWhishList);
    const removeFromWishList = useStore((state: any) => state.removeFromWhishList);
    const wishList = useStore((state: any) => state.whishList);
    const isWishListed = wishList?.some((item: any) => item.id === data?.id);

  return (


    <div
        className='fixed flex items-center justify-center top-8 left-0 h-screen  w-full bg-[#0000001d] z-50'
        onClick={() => setOpen(false)}
    >
        <div className="w-[90%] md:w-[70%] md:mt-14 2xl:mt-0 h-max overflow-scroll min-h-[70vh] p-4 md:p-6 bg-white shadow-md rounded-lg"
            style={{scrollbarWidth: 'none'}}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-full flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 h-full">
                    <Image
                        src={data?.images?.[activeImage]?.url }
                        alt={data?.images?.[activeImage]?.url }
                        width={400}
                        height={400}
                        className='w-full rounded-lg object-contain h-[600px]'
                    />
                    <div className="flex gap-2 mt-4">
                        {data?.images?.map((img: any, index: number) => (
                            <div key={index} 
                                className={`cursor-pointer border rounded-md ${activeImage === index ? 'border-gray-500 border-[3px]' : 'border-transparent'} `}
                                onClick={() => setActiveImage(index)}
                            >
                                <Image
                                    src={img?.url}
                                    alt={`Thumbnail ${index + 1}`}
                                    width={80}
                                    height={80}
                                    className='rounded-[4px] h-20'
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
                        <div className="border-b relative pb-3 border-gray-200 flex items-center justify-between">
                            <div className="flex items-start gap-3">
                                <Image
                                    src={data?.Shop?.avatar || data?.images?.[0]?.url}
                                    alt={"Shop Logo"}
                                    width={60}
                                    height={60}
                                    className='rounded-full w-[60px] h-[60px] object-cover'
                                />

                                <div>
                                    <Link
                                        href={`/shop/${data?.Shop?.id}`}
                                        className='text-lg font-medium'
                                    >
                                        {data?.Shop?.name}
                                    </Link>

                                    <span className="block mt-1">
                                        <Ratings rating={data?.Shop?.ratings || 0} />
                                    </span>

                                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                                        <MapPin size={20} />
                                        {data?.Shop?.address || "Location not Available"}
                                    </p>
                                </div>
                            </div>

                            <button
                                className='flex cursor-pointer items-center gap-2 px-4 bg-blue-600 py-2 rounded-md text-white hover:bg-blue-700 hover:scale-105 transition'
                                onClick={() => router.push(`/index?shopId=${data?.Shop?.id}`)}
                            >
                                <MessagesSquareIcon /> Chat with Seller
                            </button>

                            <button className='w-full absolute cursor-pointer right-[-5px] top-[-5px] flex justify-end my-2 mt-[-10px]'>
                                <X size={25} onClick={() => setOpen(false)} />
                            </button>
                        </div>
                        <h3 className="text-xl font-semibold mt-3">{data?.title} <span className='font-semibold text-gray-500 text-sm ml-4'>{data?.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric',
                            }) : ''}</span></h3>
                        <p className="mt-2 text-gray-700 whitespace-pre-wrap w-full">
                            {data?.description}
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo rem perferendis vero dolorem at excepturi molestiae molestias tempore animi eos quibusdam voluptatibus sint eligendi magni, quos laborum optio culpa sapiente odit ipsa earum. Tempora molestiae veritatis impedit unde, fugit recusandae dignissimos consequuntur, cumque illum nam deserunt aliquam quia itaque quas, deleniti alias maxime ut. Quam odit libero repellat, consectetur nihil asperiores quasi alias possimus autem nesciunt iusto error ex inventore minima necessitatibus rem nemo nam omnis suscipit consequuntur illum mollitia eum ducimus. Assumenda tenetur est officia porro quia maiores inventore possimus quo, doloribus distinctio, delectus magni dolorum illo, velit tempore.
                        </p>
                        {data?.brand && (
                            <p className="mt-2">
                                <strong>Brand:</strong> {data?.brand}
                            </p>
                        )}

                        <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                            {data?.colors?.length > 0 && (
                                <div>
                                    <strong>Color: </strong>
                                    <div className="flex gap-2 mt-1">
                                        {data?.colors?.map((color: string, index: number) => (
                                            <button
                                                key={index}
                                                className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${
                                                    isSelected === color ? 'border-blue-600' : 'border-transparent'
                                                }`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setIsSelected(color)}
                                            ></button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data?.sizes?.length > 0 && (
                                <div>
                                    <strong>Size: </strong>
                                    <div className="flex gap-2 mt-1">
                                        {data?.sizes?.map((size: string, index: number) => (
                                            <button
                                                key={index}
                                                className={`px-3 py-1 border rounded-md cursor-pointer transition ${
                                                    isSizeSelected === size ? 'border-blue-600 bg-blue-100' : 'border-gray-300'
                                                }`}
                                                onClick={() => setIsSizeSelected(size)}
                                            >{size}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className="mt-5 flex items-center gap-4">
                            <h3 className="text-2xl font-semibold text-gray-900">
                                ${data?.sale_price}
                            </h3>
                            {data?.regular_price && (
                                <div className="text-lg text-red-600 line-through">
                                    ${data?.regular_price}
                                </div>
                            )}
                        </div>

                        <div className="flex items-end gap-6">
                            <div className="mt-5 flex items-center gap-5">
                                <div className="flex items-center rounded-md">
                                    <button className='px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md'
                                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                    >
                                        -
                                    </button>
                                    <span className='px-4 bg-gray-100 py-1'>
                                        {quantity}
                                    </span>
                                    <button className='px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-r-md'
                                        onClick={() => setQuantity((prev) => prev + 1)}
                                    >
                                        +
                                    </button>
                                </div>

                            </div>
                            <button
                                disabled={isInCart}
                                onClick={() => 
                                    addToCart(
                                        {
                                            ...data,
                                            quantity,
                                            selectedOptions: {
                                                color: isSelected,
                                                size: isSizeSelected,
                                            },
                                        },
                                        user,
                                        location,
                                        deviceInfo
                                    )
                                }
                                className={` mt-4 flex items-center gap-2 px-4 py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition ${isInCart ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            <ShoppingCart size={18}/> Add to Cart
                            </button>
                            <button className="opacity-[.7] cursor-pointer">
                                <Heart size={30}
                                    fill={isWishListed ? 'red' : 'transparent'}
                                    color={isWishListed ? 'transparent' : 'black'}
                                    onClick={() => 
                                        isWishListed ? removeFromWishList(data?.id, user, location, deviceInfo) : addToWishList({...data, quantity, selectedOption: { color: isSelected, size: isSizeSelected }}, user, location, deviceInfo)
                                    }
                                />
                            </button>
                        </div>

                        <div className="mt-3">
                            {data.stock > 0 ? (
                                <span className="text-green-600 font-semibold">
                                    In Stock
                                </span>
                            ) : (
                                <span className="text-red-600 font-semibold">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        <div className="mt-3 text-gray-600 text-sm">
                            Estimated Delivery:{" "}
                            <strong>{estimatedDelivery.toDateString()}</strong>
                        </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ProductDetailsCard