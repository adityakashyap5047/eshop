import { ArrowRight, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { categories } from '../../../utils/categories';

interface ShopCardProps {
    shop: {
        id: string;
        name?:string;
        description?: string;
        avatar: string;
        coverBanner?: string;
        address?: string;
        followers?: [];
        rating?: number;
        category?: string;
    }
}

const ShopCard: React.FC<ShopCardProps> = ({shop}) => {
  // Helper function to get category label from category value
  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };
  return (
    <div className='w-full rounded-md cursor-pointer bg-white border border-gray-200 shadow-sm overflow-hidden transition'>
        <div className="h-[120px] w-full relative">
            <Image
                src={shop?.coverBanner || "https://ik.imagekit.io/adityakashyap5047/Eshop/Cover%20Picture/Banner_Image.png?updatedAt=1758872731741"}
                alt="Cover Banner"
                fill
                className='object-cover w-full h-full'
            />
        </div>

        <div className="relative flex justify-center -mt-8">
            <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow bg-white">
                <Image
                    src={shop?.avatar || "https://ik.imagekit.io/adityakashyap5047/Eshop/Cover%20Picture/image.png?updatedAt=1758872565520"}
                    alt={shop.name!}
                    width={64}
                    height={64}
                    className='object-cover'
                />
            </div>
        </div>

        <div className="px-4 pb-4 pt-2 text-center">
            <h3 className="text-base font-semibold text-gray-800">{shop?.name!}</h3>

            <p className="text-xs text-gray-500 mt-0.5">
                {shop?.followers?.length ?? 0} Followers 
            </p>

            <div className="flex items-center justify-center text-xs text-gray-500 mt-2 gap-4 flex-wrap">
                {shop.address && (
                    <span className="flex items-center gap-1 max-w-[120px]">
                        <MapPin className='w-4 h-4 shrink-0' />
                        <span className="truncate">{shop.address}</span>
                    </span>
                )}

                <span className="flex items-center gap-1">
                    <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                    {shop.rating ?? "N/A"}
                </span>
            </div>

            {shop?.category && (
                <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        {getCategoryLabel(shop.category)}
                    </span>
                </div>
            )}

            <div className="mt-4">
                <Link
                    href={`/shop/${shop.id}`}
                    className='inline-flex items-center text-sm text-blue-600 font-medium hover:underline hover:text-blue-700 transition'
                >
                    Visit Shop 
                    <ArrowRight className='w-4 h-4 ml-1' />
                </Link>
            </div>
        </div>
    </div>
  )
}

export default ShopCard