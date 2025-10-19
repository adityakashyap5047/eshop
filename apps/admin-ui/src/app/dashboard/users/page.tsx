"use client";

import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { Ban, ChevronRightIcon, Download, Search, X } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { saveAs } from "file-saver"

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

type UsersResponse = {
    data: User[];
    meta: {
        totalUsers: number;
    }
}

const UsersPage = () => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [page, setPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const diferredGlobalFilter = useDeferredValue(globalFilter);
    const limit = 10;

    const queryClient = useQueryClient();
    
    const {data, isLoading}: UseQueryResult<UsersResponse, Error> = useQuery<
        UsersResponse,
        Error,
        UsersResponse,
        [string, number]
    >({
        queryKey: ["users-list", page],
        queryFn: async() => {
        const res = await axiosInstance.get(
            `/admin/api/get-all-users?page=${page}&limit=${limit}`
        );
        return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000,
    });

    const banUserMutation = useMutation({
        mutationFn: async(userId: string) => {
            await axiosInstance.put(`/admin/api/ban-user/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["users-list"]});
            setIsModalOpen(false);
            setSelectedUser(null);
        }
    });

    const allUsers = data?.data || [];

    const filteredUsers = useMemo(() => {
        return allUsers.filter((user) => {
            const matchesRole = roleFilter
                ? user.role.toLowerCase() === roleFilter.toLowerCase()
                : true;
            const matchesGlobal = diferredGlobalFilter
                ? Object.values(user)
                    .join(" ")
                    .toLowerCase()
                    .includes(diferredGlobalFilter.toLowerCase())
                : true;
            return matchesRole && matchesGlobal;
        })
    }, [allUsers, roleFilter, diferredGlobalFilter]);

    const totalPages = Math.ceil((data?.meta?.totalUsers ?? 0) / limit);

    const columns = useMemo(() => [
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
            accessorKey: "role",
            header: "Role",
            cell: ({row}: any) => <span className="text-blue-500">{row.original.role}</span>
        },
        {
            accessorKey: "joined",
            header: "Joined",
            cell: ({row}: any) => <span>{new Date(row.original.createdAt).toLocaleDateString('en-GB')}</span>
        },
        {
            header: "Actions",
            cell: ({row}: any) => (
                <button className="text-red-500" onClick={() => {setSelectedUser(row.original); setIsModalOpen(true);}}>
                    <Ban size={18} />
                </button>
            )
        }
    ], []);

    const table = useReactTable({
        data: filteredUsers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: {globalFilter},
        onGlobalFilterChange: setGlobalFilter,
    });

    const exportCSV = () => {
        const csvData = filteredUsers.map(
        (p: any) => 
            `${p.title},${p.sale_price},${p.stock},${p.category},${p.ratings},${p.Shop.name},${p.createdAt.split("T")[0]}`
        );
        const blob = new Blob(
        [`Title,Price,Stock,Category,Rating,Shop\n${csvData.join("\n")}`],
        {type: "text/csv;charset=utf-8"}
        );
        saveAs(blob, `event-page-${page}.csv`);
    };

    return (
        <div className="w-full min-h-screen p-8">
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-2xl text-white font-semibold">Users</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportCSV}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md flex justify-center items-center gap-4"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                    <select
                        className="bg-gray-800 border border-gray-700 outline-none text-white px-2 py-1 rounded-sm cursor-pointer"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center mb-4">
                <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
                    Dashboard            
                </Link>
                <ChevronRightIcon className="text-gray-200" size={20} />
                <span className="text-white">Users</span>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Events</p>
                            <p className="text-white text-2xl font-bold">{eventStats.total}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Active Events</p>
                            <p className="text-green-400 text-2xl font-bold">{eventStats.active}</p>
                        </div>
                        <Clock className="w-8 h-8 text-green-400" />
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Upcoming Events</p>
                            <p className="text-blue-400 text-2xl font-bold">{eventStats.upcoming}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Ended Events</p>
                            <p className="text-red-400 text-2xl font-bold">{eventStats.ended}</p>
                        </div>
                        <Clock className="w-8 h-8 text-red-400" />
                    </div>
                </div>
            </div> */}

            <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search Users..."
                    className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
                {isLoading ? (
                    <p className="text-center text-white">Loading users...</p>
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

            {isModalOpen && selectedUser && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                        <h3 className="text-xl text-white">Ban {selectedUser.name}</h3>
                        <button onClick={() => {setIsModalOpen(false); setSelectedUser(null);}} className="text-gray-400 hover:text-white"><X size={22} /></button>
                        </div>

                        <p className="text-gray-300 mt-4">
                        Are you sure you want to Ban{" "}
                        <span className="font-semibold text-white">
                            `{selectedUser.email}` {" "}
                        </span>
                        ? This action can be reverted later 
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                        <button 
                            onClick={() => {setIsModalOpen(false); setSelectedUser(null);}}
                            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => banUserMutation.mutate(selectedUser.id)}
                            className={`bg-red-600 hover:bg-red-700 flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold transition`}
                        >
                            <Ban size={16} /> Confirm Ban
                        </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UsersPage