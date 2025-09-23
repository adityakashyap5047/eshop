"use client";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Image from "next/image";
import { useState } from "react"
import ReactImageMagnify from "react-image-magnify";
import Ratings from "../components/ratings";
import Link from "next/link";

const ProductDetails = ({productDetails}: {productDetails: any}) => {
    const [currentImage, setCurrentImage] = useState(productDetails?.images[0]?.url);
    const [currentIndex, setCurrentIndex] = useState(0);

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
                                fill="red"
                                color="transparent"
                                className="cursor-pointer mt-4"
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
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails