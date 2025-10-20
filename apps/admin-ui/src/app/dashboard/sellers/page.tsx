"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { ChevronRightIcon, Download, Search } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { saveAs } from "file-saver"
import Image from "next/image";

type Seller = {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    shop: {
        name: string;
        avatar: string;
        address: string;
    }
}

type SellersResponse = {
    data: Seller[];
    meta: {
        totalSellers: number;
        currentPage: number;
        totalPages: number;
    }
}

const SellersPage = () => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [page, setPage] = useState(1);
    const diferredGlobalFilter = useDeferredValue(globalFilter);
    const limit = 10;
    
    const {data, isLoading}: UseQueryResult<SellersResponse, Error> = useQuery({
        queryKey: ["sellers-list", page],
        queryFn: async() => {
        const res = await axiosInstance.get(
            `/admin/api/get-all-sellers?page=${page}&limit=${limit}`
        );
        return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000,
    });

    const allSellers = data?.data || [];

    const filteredSellers = useMemo(() => {
        return allSellers.filter((seller) => 
            diferredGlobalFilter
                ? Object.values(seller)
                    .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
                    .join(" ")
                    .toLowerCase()
                    .includes(diferredGlobalFilter.toLowerCase())
                : true
        );
    }, [allSellers, diferredGlobalFilter]);

    const totalPages = Math.ceil((data?.meta?.totalSellers ?? 0) / limit);

    const columns = useMemo(() => [
        {
            accessorKey: "shop.avatar",
            header: "Avatar",
            cell: ({row}: any) => (
                <Image
                    src={row.original.shop?.avatar || "https://ik.imagekit.io/adityakashyap5047/Eshop/Cover%20Picture/image.png?updatedAt=1758872565520"}
                    alt={row.original.shop?.name}
                    className="rounded-full w-12 h-12"
                    width={80}
                    height={80}
                />
            )
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({row}: any) => <span>{row.original.name}</span>
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({row}: any) => <span>{row.original.email}</span>
        },
        {
            accessorKey: "shop.name",
            header: "Shop Name",
            cell: ({row}: any) => <Link href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/shop/${row.original.id}`} className="text-blue-600">{row.original.shop.name}</Link>
        },
        {
            accessorKey: "shop.address",
            header: "Shop Address",
            cell: ({row}: any) => <span>{row.original.shop.address}</span>
        },
        {
            accessorKey: "joined",
            header: "Joined",
            cell: ({row}: any) => <span>{new Date(row.original.createdAt).toLocaleDateString('en-GB')}</span>
        },
    ], []);

    const table = useReactTable({
        data: filteredSellers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: {globalFilter},
        onGlobalFilterChange: setGlobalFilter,
    });

    const exportCSV = () => {
        const csvData = filteredSellers.map(
        (p: any) => 
            `${p.title},${p.sale_price},${p.stock},${p.category},${p.ratings},${p.Shop.name},${p.createdAt.split("T")[0]}`
        );
        const blob = new Blob(
        [`Title,Price,Stock,Category,Rating,Shop\n${csvData.join("\n")}`],
        {type: "text/csv;charset=utf-8"}
        );
        saveAs(blob, `seller-page-${page}.csv`);
    };

    return (
        <div className="w-full min-h-screen p-8">
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-2xl text-white font-semibold">Sellers</h2>
                <button
                    onClick={exportCSV}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md flex justify-center items-center gap-4"
                >
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="flex items-center mb-4">
                <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
                    Dashboard            
                </Link>
                <ChevronRightIcon className="text-gray-200" size={20} />
                <span className="text-white">Sellers</span>
            </div>

            <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search Sellers..."
                    className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
                {isLoading ? (
                    <p className="text-center text-white">Loading sellers...</p>
                ) : (
                    <table className="w-full text-white">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="border-b border-gray-800">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="p-3 text-left">
                                            {header.isPlaceholder ? null : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="p-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="flex justify-between items-center mt-4">
                    <button className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 disabled:bg-blue-900"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </button>

                    <span className="text-gray-300">
                        Page {page} of {totalPages || 1}
                    </span>

                    <button className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 disabled:bg-blue-900"
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SellersPage