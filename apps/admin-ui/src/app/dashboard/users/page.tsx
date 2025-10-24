"use client";

import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { Ban, ChevronRightIcon, Download, Search, X, RotateCcw, Users, UserX } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

type BannedUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

type UsersResponse = {
    data: User[];
    meta: {
        totalUsers: number;
    }
}

type BannedUsersResponse = {
    data: BannedUser[];
    meta: {
        totalBannedUsers: number;
    }
}

const UsersPage = () => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [page, setPage] = useState(1);
    const [bannedPage, setBannedPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedBannedUser, setSelectedBannedUser] = useState<BannedUser | null>(null); 
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'banned'>('active');
    const [banReason, setBanReason] = useState("");
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

    const {data: bannedData, isLoading: bannedLoading}: UseQueryResult<BannedUsersResponse, Error> = useQuery<
        BannedUsersResponse,
        Error,
        BannedUsersResponse,
        [string, number]
    >({
        queryKey: ["banned-users-list", bannedPage],
        queryFn: async() => {
        const res = await axiosInstance.get(
            `/admin/api/get-all-banned-users?page=${bannedPage}&limit=${limit}`
        );
        return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000,
        enabled: activeTab === 'banned'
    });

    const banUserMutation = useMutation({
        mutationFn: async(data: {userId: string, reason?: string}) => {
            const response = await axiosInstance.put(`/admin/api/ban-user`, {
                userId: data.userId,
                reason: data.reason
            });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ["banned-users-list"]});
            queryClient.invalidateQueries({queryKey: ["users-list"]});
            setIsBanModalOpen(false);
            setSelectedUser(null);
            setBanReason("");
            toast.success(data.message || "User banned successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to ban user");
        }
    });

    const unbanUserMutation = useMutation({
        mutationFn: async(userId: string) => {
            const response = await axiosInstance.put(`/admin/api/unban-user`, {
                userId: userId
            });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ["users-list"]});
            queryClient.invalidateQueries({queryKey: ["banned-users-list"]});
            setIsUnbanModalOpen(false);
            setSelectedBannedUser(null);
            toast.success(data.message || "User unbanned successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to unban user");
        }
    });

    const allUsers = data?.data || [];
    const allBannedUsers = bannedData?.data || [];

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

    const filteredBannedUsers = useMemo(() => {
        return allBannedUsers.filter((user) => {
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
    }, [allBannedUsers, roleFilter, diferredGlobalFilter]);

    const totalPages = Math.ceil((data?.meta?.totalUsers ?? 0) / limit);
    const totalBannedPages = Math.ceil((bannedData?.meta?.totalBannedUsers ?? 0) / limit);

    const activeUsersColumns = useMemo(() => [
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
                <button 
                    className="text-red-500 hover:text-red-400 transition-colors" 
                    onClick={() => {setSelectedUser(row.original); setIsBanModalOpen(true);}}
                    title="Ban User"
                >
                    <Ban size={18} />
                </button>
            )
        }
    ], []);

    const bannedUsersColumns = useMemo(() => [
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
            accessorKey: "banned",
            header: "Banned Date",
            cell: ({row}: any) => <span>{new Date(row.original.updatedAt).toLocaleDateString('en-GB')}</span>
        },
        {
            header: "Actions",
            cell: ({row}: any) => (
                <button 
                    className="text-green-500 hover:text-green-400 transition-colors" 
                    onClick={() => {setSelectedBannedUser(row.original); setIsUnbanModalOpen(true);}}
                    title="Unban User"
                >
                    <RotateCcw size={18} />
                </button>
            )
        }
    ], []);

    const table = useReactTable({
        data: activeTab === 'active' ? filteredUsers : filteredBannedUsers,
        columns: activeTab === 'active' ? activeUsersColumns : bannedUsersColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: {globalFilter},
        onGlobalFilterChange: setGlobalFilter,
    });

    const exportCSV = () => {
        const dataToExport = activeTab === 'active' ? filteredUsers : filteredBannedUsers;
        const csvData = dataToExport.map(
        (user: any) => 
            `${user.name},${user.email},${user.role},${new Date(user.createdAt).toLocaleDateString('en-GB')}`
        );
        const blob = new Blob(
        [`Name,Email,Role,${activeTab === 'active' ? 'Joined' : 'Banned'}\n${csvData.join("\n")}`],
        {type: "text/csv;charset=utf-8"}
        );
        saveAs(blob, `${activeTab}-users-page-${activeTab === 'active' ? page : bannedPage}.csv`);
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

            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
                <button
                    onClick={() => {setActiveTab('active'); setPage(1);}}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'active'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    <Users size={18} />
                    Active Users ({data?.meta?.totalUsers || 0})
                </button>
                <button
                    onClick={() => {setActiveTab('banned'); setBannedPage(1);}}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'banned'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    <UserX size={18} />
                    Banned Users ({bannedData?.meta?.totalBannedUsers || 0})
                </button>
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
                {(activeTab === 'active' ? isLoading : bannedLoading) ? (
                    <p className="text-center text-white">Loading {activeTab} users...</p>
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
                        onClick={() => {
                            if (activeTab === 'active') {
                                setPage((prev) => Math.max(prev - 1, 1));
                            } else {
                                setBannedPage((prev) => Math.max(prev - 1, 1));
                            }
                        }}
                        disabled={activeTab === 'active' ? page === 1 : bannedPage === 1}
                    >
                        Previous
                    </button>

                    <span className="text-gray-300">
                        Page {activeTab === 'active' ? page : bannedPage} of {activeTab === 'active' ? (totalPages || 1) : (totalBannedPages || 1)}
                    </span>

                    <button className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 disabled:bg-blue-900"
                        onClick={() => {
                            if (activeTab === 'active') {
                                setPage((prev) => prev + 1);
                            } else {
                                setBannedPage((prev) => prev + 1);
                            }
                        }}
                        disabled={activeTab === 'active' ? page === totalPages : bannedPage === totalBannedPages}
                    >
                        Next
                    </button>
                </div>
            </div>

            
            {isBanModalOpen && selectedUser && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                            <h3 className="text-xl text-white">Ban {selectedUser.name}</h3>
                            <button 
                                onClick={() => {setIsBanModalOpen(false); setSelectedUser(null); setBanReason("");}} 
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="mt-4">
                            <p className="text-gray-300 mb-4">
                                Are you sure you want to ban{" "}
                                <span className="font-semibold text-white">
                                    {selectedUser.email}
                                </span>
                                ? This action can be reverted later.
                            </p>
                            
                            <div className="mb-4">
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Reason for ban (optional)
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Enter reason for banning this user..."
                                    rows={3}
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button 
                                onClick={() => {setIsBanModalOpen(false); setSelectedUser(null); setBanReason("");}}
                                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition"
                                disabled={banUserMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => banUserMutation.mutate({
                                    userId: selectedUser.id,
                                    reason: banReason.trim() || undefined
                                })}
                                disabled={banUserMutation.isPending}
                                className={`bg-red-600 hover:bg-red-700 flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {banUserMutation.isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Banning...
                                    </>
                                ) : (
                                    <>
                                        <Ban size={16} /> Confirm Ban
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unban User Modal */}
            {isUnbanModalOpen && selectedBannedUser && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                            <h3 className="text-xl text-white">Unban {selectedBannedUser.name}</h3>
                            <button 
                                onClick={() => {setIsUnbanModalOpen(false); setSelectedBannedUser(null);}} 
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <p className="text-gray-300 mt-4">
                            Are you sure you want to unban{" "}
                            <span className="font-semibold text-white">
                                {selectedBannedUser.email}
                            </span>
                            ? This will restore their account and allow them to access the platform again.
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button 
                                onClick={() => {setIsUnbanModalOpen(false); setSelectedBannedUser(null);}}
                                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition"
                                disabled={unbanUserMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => unbanUserMutation.mutate(selectedBannedUser.id)}
                                disabled={unbanUserMutation.isPending}
                                className={`bg-green-600 hover:bg-green-700 flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {unbanUserMutation.isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Unbanning...
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw size={16} /> Confirm Unban
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UsersPage