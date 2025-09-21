import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({product, isEvent = false}: {product: any, isEvent?: boolean}) => {
    console.log(product);
  return (
    <div className='w-full min-h-[350px] h-max bg-red-300 rounded-lg relative'>
        {isEvent && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
                OFFER
            </div>
        )}

        {product?.stock <= 5 && (
            <div className='absolute top-2 right-2 bg-yellow-400 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md'>
                Limited Stock
            </div>
        )}

        <Link href={`/product/${product?.slug}`}>
            <Image
                src={product?.images[0]?.url}
                alt={product?.title}
                width={300}
                height={300}
                className='w-full h-[220px] object-cover mx-auto rounded-t-md'
            />
        </Link>

        <Link
            href={`/product/${product?.Shop?.id}`}
            className='block text-blue-500 text-sm font-medium my-2 px-2'
        >
            {product?.Shop?.name}
        </Link>
        <Link href={`/product/${product?.slug}`} >
            <h3 className="text-base font-semibold px-2 text-gray-800 line-clamp-2 text-ellipsis">
                {product?.title}
            </h3>
        </Link>

        <div className="mt-2 px-2">

        </div>
    </div>
  )
}

export default ProductCard