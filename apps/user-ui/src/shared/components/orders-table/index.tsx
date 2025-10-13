"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { useRouter } from "next/navigation"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowUpRight } from "lucide-react";

const OrdersTable = () => {
    const router = useRouter();
    const {data, isLoading} = useQuery({
        queryKey: ['user-orders'],
        queryFn: async() => {
            const res = await axiosInstance.get("/order/api/get-user-orders");
            return res.data.orders;
        }
    });

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "Order ID",
            cell: ({row}: any) => row.original.id?.slice(-6),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({row}: any) => row.original.status,
        },
        {
            accessorKey: "total",
            header: "Total ($)",
            cell: ({row}: any) => `$${row.original.total?.toFixed(2)}`
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({row}: any) => new Date(row.original.createdAt).toLocaleDateString('en-GB')
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({row}) => (
                <button 
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                    onClick={() => router.push(`/order/${row.original.id}`)}
                >
                    Track Order <ArrowUpRight className="w-3 h-3" />
                </button>
            )
        }
    ];

    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if(isLoading) {
        return <p className="text-sm text-gray-600">Loading Orders ...</p>
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead>
                    {table.getHeaderGroups().map((headerGroup, idx) => (
                        <tr
                            key={idx}
                            className="border-b border-b-gray-200 text-left"
                        >
                            {headerGroup.headers.map((header, idx) => (
                                <th
                                    key={idx}
                                    className="py-2 px-3 font-semibold text-gray-700"
                                >
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
                    {table.getRowModel().rows.map((row, rowIdx) => (
                        <tr
                            key={rowIdx}
                            className="border-b border-b-gray-200 hover:bg-gray-50 cursor-pointer"
                        >
                            {row.getVisibleCells().map((cell, idx) => (
                                <td
                                    key={idx}
                                    className="py-2 px-3 text-gray-600"
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()    
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {data?.length === 0 && (
                <p className="text-center h-[30vh] items-center flex justify-center">
                    No Orders available yet!
                </p>
            )}
        </div>
    )
}

export default OrdersTable