"use client";

import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { ChevronRight, Plus, Trash } from 'lucide-react'
import Link from 'next/link';
import React from 'react'

const Page = () => {
  const [showModal, setShowModal] = React.useState(false);

  const {data: discountCodes = [], isLoading} = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    }
  });

  const handleDeleteClick = async(discount: any) => {}

  return (
    <div className='w-full min-h-screen p-8'>
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Create Discount
        </button>
      </div>
      <div className="flex items-center text-white">
        <Link href={"/dashboard"} className='text-[#80Deea] cursor-pointer'>Dashboard</Link>
        <ChevronRight size={20} className='opacity-[0.8]' />
        <span>Discount Codes</span>
      </div>

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>
        {isLoading ? (
          <p className='text-gray-400 text-center'>Loading discounts ...</p>
        ) : (
          <table className='w-full text-white'>
            <thead>
              <tr className='border-b border-gray-800'>
                <th className='p-3 text-left'>Title</th>
                <th className='p-3 text-left'>Type</th>
                <th className='p-3 text-left'>Value</th>
                <th className='p-3 text-left'>Code</th>
                <th className='p-3 text-left'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes?.map((discount: any) => (
                <tr key={discount?.id} className='border-b border-gray-800 hover:bg-gray-800 transition'>
                  <td className='p-3'>{discount?.public_name}</td>
                  <td className='p-3 capitalize'>
                    {discount.discountType === "percentage" ? "Percentage (%)" : "Flat ($)"}
                  </td>
                  <td className='p-3'>
                    {discount.discountType === "percentage" ? `${discount.discountValue}%` : `$${discount.discountValue}`}
                  </td>
                  <td className="p-3">
                    {discount.discountCode}
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={() => handleDeleteClick(discount)}
                      className='text-red-400 hover:text-red-300 transition-colors'
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {
          !isLoading && discountCodes?.length === 0 && (
            <p className="text-gray-400 text-center mt-4 w-full">
              No Discount Codes Available! 
            </p>
          )
        }
      </div>
    </div>
  )
}

export default Page