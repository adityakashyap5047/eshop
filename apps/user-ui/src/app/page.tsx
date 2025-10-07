"use client";

import React from 'react'
import Hero from '../shared/components/hero'
import SectionTitle from '../shared/widgets/section/section-title'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../utils/axiosInstance'
import ProductCard from '../shared/components/cards/product-card';
import ShopCard from '../shared/components/cards/shop-card';

const Page = () => {

  const {data: products, isLoading, isError} = useQuery({
    queryKey: ["products"],
    queryFn: async() => {
      const res = await axiosInstance.get("/product/api/get-all-products?page=1&limit=10");
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const {data: latestProducts, isLoading: isLatestProductLoading } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async() => {
      const res = await axiosInstance.get("/product/api/get-all-products?page=1&limit=10&type=latest");
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const {data: shops, isLoading: isShopLoading, isError: isShopError} = useQuery({
    queryKey: ["shops"],
    queryFn: async() => {
      const res = await axiosInstance.get("/product/api/top-shops");
      return res.data.shops;
    },
    staleTime: 1000 * 60 * 2,
  })

  const {data: offers, isLoading: isOfferLoading, isError: isOfferError} = useQuery({
    queryKey: ["offers"],
    queryFn: async() => {
      const res = await axiosInstance.get("/product/api/get-all-events?page=10&limit=10");
      return res.data.events;
    },
    staleTime: 1000 * 60 * 2,
  })

  return (
    <div className='bg-[#f5f5f5]'>
      <Hero />
      <div className="md:w-[80%] w-[90%] mt-10 pb-8 m-auto">
        <div className="mb-8">
          <SectionTitle title='Suggested Products' />
        </div>
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({length: 10}).map((_, index) => (
              <div 
                key={index}
                className='h-[250px] bg-gray-300 animate-pulse rounded-xl'
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && products?.length > 0 && (
          <div className="m-auto py-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product}/>
            ))}
          </div>
        )}

        {products?.length === 0 && (
          <p className='text-center my-2 p-2 rounded-md bg-gray-300'>
            No Products available yet
          </p>
        )}

        <div className="mb-8 block">
          <SectionTitle title='Latest Products' />
        </div>
        {isLatestProductLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({length: 10}).map((_, index) => (
              <div 
                key={index}
                className='h-[250px] bg-gray-300 animate-pulse rounded-xl'
              />
            ))}
          </div>
        )}
        {!isLatestProductLoading && latestProducts?.length > 0 && (
          <div className="m-auto py-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {latestProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product}/>
            ))}
          </div>
        )}

        {latestProducts?.length === 0 && (
          <p className="text-center my-2 p-2 rounded-md bg-gray-300">No Products Available yet!</p>
        )}

        <div className="mb-8">
          <SectionTitle title='Top Shops' />
        </div>

        {!isShopLoading && !isShopError && shops?.length > 0 && (
          <div className="m-auto py-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {shops?.map((shop: any) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
        {isShopLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({length: 10}).map((_, index) => (
              <div 
                key={index}
                className='h-[250px] bg-gray-300 animate-pulse rounded-xl'
              />
            ))}
          </div>
        )}
        {isShopError || shops?.length === 0 && (
          <p className="text-center my-2 p-2 rounded-md bg-gray-300">No Shop Available yet!</p>
        )}

        <div className="mb-8">
          <SectionTitle title='Top Offers' />
        </div>
        {isOfferLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({length: 10}).map((_, index) => (
              <div 
                key={index}
                className='h-[250px] bg-gray-300 animate-pulse rounded-xl'
              />
            ))}
          </div>
        )}
        {!isOfferLoading && !isOfferError && offers?.length > 0 && (
          <div className="m-auto py-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {offers?.map((product: any) => (
              <ProductCard key={product.id} product={product} isEvent={true} />
            ))}
          </div>
        )}

        {isOfferError || offers?.length === 0 && (
          <p className="text-center my-2 p-2 rounded-md bg-gray-300">No Offers Available yet!</p>
        )}
      </div>
    </div>
  )
}

export default Page