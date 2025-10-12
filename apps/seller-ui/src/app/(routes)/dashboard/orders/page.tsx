"use client";

import { useQuery } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { ChevronRightIcon, Eye, Search, ShoppingCart, Clock, CheckCircle, DollarSign } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const fetchOrders = async() => {
    const res = await axiosInstance.get("/order/api/get-seller-orders");
    return res.data.orders;
}

const OrdersTable = () => {
    const [globalFilter, setGlobalFilter] = useState("");

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["seller-orders"],
        queryFn: fetchOrders,
        staleTime: 1000 * 60 * 5, 
    })

    // Order statistics
    const orderStats = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter((order: any) => order.status === 'pending').length;
        const completed = orders.filter((order: any) => order.status === 'delivered' || order.status === 'completed').length;
        const cancelled = orders.filter((order: any) => order.status === 'cancelled').length;
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);

        return { total, pending, completed, cancelled, totalRevenue };
    }, [orders]);

    const columns = useMemo(() => [
        {
            accessorKey: "id",
            header: "Order ID",
            cell: ({row}: any) => (
                <span className="text-white text-sm truncate">#{row.original.id.slice(-6).toUpperCase()}</span>
            )
        },
        {
            accessorKey: "user.name",
            header: "Buyer",
            cell: ({row}: any) => (
                <span className="text-white">
                    {row.original.user?.name || "Guest"}
                </span>
            )
        },
        {
            accessorKey: "total",
            header: "Total",
            cell: ({row}: any) => <span>${row.original.total}</span>
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({row}: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.original.status === "Paid" ? "bg-green-600 text-white" : "bg-yellow-500 text-white"
                }`}>
                    {row.original.status}
                </span>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({row}: any) => {
                const date = new Date(row.original.createdAt).toLocaleDateString();
                return <span className="text-white text-sm">{date}</span>;
            }
        },
        {
            header: "Actions",
            cell: ({row}: any) => (
                <Link
                    href={`/order/${row.original.id}`}
                    className="text-blue-400 hover:text-blue-500 transition"
                >
                    <Eye size={18} />
                </Link>
            )
        }
    ], []);

    const table = useReactTable({
        data: orders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: {globalFilter},
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="w-full min-h-screen p-8">
            <h2 className="text-2xl text-white font-semibold mb-2">All Orders</h2>

            <div className="flex items-center mb-4">
                <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
                    Dashboard            
                </Link>
                <ChevronRightIcon className="text-gray-200" size={20} />
                <span className="text-white">All Orders</span>
            </div>

            {/* Order Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Orders</p>
                            <p className="text-white text-2xl font-bold">{orderStats.total}</p>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Pending Orders</p>
                            <p className="text-yellow-400 text-2xl font-bold">{orderStats.pending}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-400" />
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Completed Orders</p>
                            <p className="text-green-400 text-2xl font-bold">{orderStats.completed}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Revenue</p>
                            <p className="text-purple-400 text-2xl font-bold">${orderStats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
            </div>

            <div className="my-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search orders..."
                    className="bg-transparent outline-none border-none text-white w-full"
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
                {isLoading ? (
                    <p className="text-center text-white">Loading orders...</p>
                ) : (
                    <table className="w-full text-white">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="border-b border-gray-800">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="p-3 text-left text-sm">
                                            {flexRender(
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
                                        <td key={cell.id} className="p-3 text-sm">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!isLoading && orders.length === 0 && (
                    <p className="text-center py-3 text-white">No Orders found!</p>
                )}
            </div>
        </div>
    )

}

export default OrdersTable