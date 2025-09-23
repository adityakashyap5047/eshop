"use client";
import { ChevronLeft, ChevronRight, Heart, ShoppingCartIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react"
import ReactImageMagnify from "react-image-magnify";
import Ratings from "../components/ratings";
import Link from "next/link";
import { useStore } from "../../store";
import useUser from "../../hooks/useUser";
import useLocation from "../../hooks/useLocation";
import useDeviceInfo from "../../hooks/useDeviceInfo";

const ProductDetails = ({productDetails}: {productDetails: any}) => {
    const [currentImage, setCurrentImage] = useState(productDetails?.images[0]?.url);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSelected, setIsSelected] = useState(
        productDetails?.colors?.[0] || ""
    );
    const [isSizeSelected, setIsSizeSelected] = useState(
        productDetails?.sizes?.[0] || ""
    );
    const [quantity, setQuantity] = useState(1);
    const [priceRange, setPriceRange] = useState([
        productDetails?.sale_price,
        449
    ]);
    const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

    const addToCart = useStore((state: any) => state.addToCart);
    const cart = useStore((state: any) => state.cart);
    const isInCart = cart?.some((item: any) => item.id === productDetails?.id);

    const addToWishList = useStore((state: any) => state.addToWhishList);
    const removeFromWishList = useStore((state: any) => state.removeFromWhishList);
    const wishList = useStore((state: any) => state.whishList);
    const isWishListed = wishList?.some((item: any) => item.id === productDetails?.id);

    const { user, isLoading } = useUser();
    const location = useLocation();
    const deviceInfo = useDeviceInfo();

    const prevImage = () => {
        if(currentIndex > 0){
            setCurrentIndex(currentIndex - 1);
            setCurrentImage(productDetails?.images[currentIndex - 1]?.url);
        }
    }

    const nextImage = () => {
        if(currentIndex < productDetails?.images?.length - 1){
            setCurrentIndex(currentIndex + 1);
            setCurrentImage(productDetails?.images[currentIndex + 1]?.url);
        }
    }

    const discountPercentage = Math.round(
        ((productDetails?.regular_price - productDetails?.sale_price) / productDetails?.regular_price) * 100
    )

    return (
        <div className="w-full bg-[#f5f5f5] py-5">
            <div className="w-[90%] bg-white lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] pag-6 overflow-hidden">
                <div className="p-4">
                    <div className="relative w-full">
                        <ReactImageMagnify
                            {...{
                                smallImage: {
                                    alt: "product image",
                                    isFluidWidth: true,
                                    src: currentImage,
                                },
                                largeImage: {
                                    src: currentImage,
                                    width: 1200,
                                    height: 1200
                                },
                                enlargedImageContainerDimensions: {
                                    width: '150%',
                                    height: '150%'
                                },
                                enlargedImageStyle: {
                                    border: "none",
                                    boxShadow: "none"
                                },
                                enlargedImagePosition: "right"
                            }}
                            className="w-full !h-[350px] object-contain"
                        />
                    </div>
                    <div className="relative flex items-center gap-2 mt-4 overflow-hidden">
                        {productDetails?.images?.length > 4 && (
                            <button 
                                className="absolute left-0 bg-white p-2 rounded-full shadow-md z-10"
                                onClick={prevImage}
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <div className="flex gap-2 overflwo-x-auto">
                            {productDetails?.images?.map((image: any, index: number) => (
                                <Image
                                    key={index}
                                    src={image?.url}
                                    alt="Thumbnail"
                                    width={60}
                                    height={60}
                                    className={`cursor-pointer border rounded-lg p-1 ${
                                        currentImage === image?.url ? "border-blue-500" : "border-gray-300"
                                    }`}
                                    onClick={() => {
                                        setCurrentImage(image?.url);
                                        setCurrentIndex(index);
                                    }}
                                />
                            ))}
                        </div>
                        {productDetails?.images?.length > 4 && (
                            <button 
                                className="absolute right-0 bg-white p-2 rounded-full shadow-md z-10"
                                onClick={nextImage}
                                disabled={currentIndex === productDetails?.images?.length - 1}
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4">
                    <h1 className="text-xl mb-2 font-medium">{productDetails?.title}</h1>
                    <div className="w-full flex items-center justify-between">
                        <div className="flex gap-2 mt-2 text-yellow-500">
                            <Ratings rating={productDetails?.ratings} />
                            <Link href={`#reviews`} className="text-blue-500 hover:underline">
                                (0 reviews)
                            </Link>
                        </div>
                        <div>
                            <Heart
                                size={25}
                                fill={isWishListed ? 'red' : 'transparent'}
                                color={isWishListed ? "transparent" : "#777"}
                                className="cursor-pointer mt-4"
                                onClick={() => 
                                    isWishListed ?
                                    removeFromWishList(
                                        productDetails.id,
                                        user,
                                        location,
                                        deviceInfo
                                    ) : addToWishList(
                                        {
                                            ...productDetails,
                                            quantity,
                                            selectedOptions: {
                                                color: isSelected,
                                                size: isSizeSelected
                                            },
                                            user,
                                            location,
                                            deviceInfo
                                        }
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div className="py-2 border-b border-gray-200">
                        <span className="text-gray-500">
                            Brand: {" "}
                            <span className="text-blue-500">
                                {productDetails?.brand || 'No brand'}
                            </span>
                        </span>
                    </div>

                    <div className="mt-3">
                        <span className="text-3xl font-bold text-orange-500">
                            ${productDetails?.sale_price}
                        </span>
                        <div className="flex gap-2 pb-2 text-lg border-b border-b-slate-200">
                            <span className="text-gray-400 line-through">
                                ${productDetails?.regular_price}
                            </span>
                            <span className="text-gray-500">-{discountPercentage}%</span>
                        </div>

                        <div className="mt-2">
                            <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                                {productDetails?.colors?.length > 0 && (
                                    <div>
                                        <strong>Color: </strong>
                                        <div className="flex gap-2 mt-2">
                                            {productDetails?.colors?.map((color: string, index: number) => (
                                                <button
                                                    key={index}
                                                    className={`w-8 h-8 rounded-full border-2 transition ${isSelected === color ? 'border-gray-400 scale-110 shadow-md' : 'border-transparent'}`}
                                                    onClick={() => setIsSelected(color)}
                                                    style={{backgroundColor: color}}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {productDetails?.sizes?.length > 0 && (
                                    <div>
                                        <strong>Size: </strong>
                                        <div className="flex gap-2 mt-2">
                                            {productDetails?.sizes?.map((size: string, index: number) => (
                                                <button
                                                    key={index}
                                                    className={`px-4 py-1 border rounded-md text-sm transition ${isSizeSelected === size ? 'text-white bg-gray-800' : 'bg-gray-300 text-black'}`}
                                                    onClick={() => setIsSizeSelected(size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center rounded-md">
                                    <button 
                                        className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                    >
                                        -
                                    </button>
                                    <span className="px-4 bg-gray-100 py-1">{quantity}</span>
                                    <button 
                                        className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-r-md"
                                        onClick={() => setQuantity((prev) => prev + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                {productDetails?.stock > 0 ? (
                                    <span className="text-green-600 font-semibold">
                                        In Stock{" "}
                                        <span className="text-gray-500 font-medium">
                                            (Stock {productDetails?.stock})
                                        </span>
                                    </span>
                                ) : (
                                    <span className="text-red-600 font-semibold">
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                                
                            <button className={`flex mt-6 items-center gap-2 px-5 py-[10px] bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition ${isInCart ? "cursor-not-allowed" : "cursor-pointer"}`}
                                disabled={isInCart || productDetails?.stock === 0}
                                onClick={() => 
                                    addToCart(
                                        {
                                            ...productDetails,
                                            quantity,
                                            selectedOptions: {
                                                color: isSelected,
                                                size: isSizeSelected
                                            }
                                        },
                                        user,
                                        location,
                                        deviceInfo
                                    )
                                }
                            >
                                <ShoppingCartIcon /> {isInCart ? "In Cart" : "Add to Cart"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails