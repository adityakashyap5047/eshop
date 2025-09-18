"use client";

import { ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link';
import React from 'react'

const Page = () => {
  const [showModal, setShowModal] = React.useState(false);

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
    </div>
  )
}

export default Page