"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { ChevronRightIcon, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react"

const columns = [
    {accessorKey: "name", header: "Name"},
    {accessorKey: "email", header: "Email"},
    {accessorKey: "role", header: "Role"},
]

const Management = () => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedRole, setSelectedRole] = useState("user");

    const queryClient = useQueryClient();

    const {data, isLoading, isError} = useQuery({
        queryKey: ["admins"],
        queryFn: async() => {
            const res = await axiosInstance.get("/admin/api/get-all-admins");
            return res.data.admins;
        }
    });

    const {mutate: updateRole, isPending: isUpdating} = useMutation({
        mutationFn: async() => {
            return await axiosInstance.put("/admin/api/add-new-admin", {
                email: search,
                role: selectedRole,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["admins"]});
            setOpen(false);
            setSearch("");
            setSelectedRole("user");
        },
        onError: (error: any) => {
            console.error("Error updating role:", error.response?.data || error.message);
        }
    });

    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel()
    })    

    const handleSubmit = (e: any) => {
        e.preventDefault();
        updateRole();
    }

    return (
        <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold tracking-wide">Team Management</h2>
                <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Add Admin 
                </button>
            </div>

            <div className="flex items-center mb-4">
                <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
                    Dashboard            
                </Link>
                <ChevronRightIcon className="text-gray-200" size={20} />
                <span className="text-white">Team management</span>
            </div>

            <div className="!rounded shadow-xl border border-slate-700 overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-slate-900 text-slate-300">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="p-3">
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
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-slate-400">
                                    Loading ...
                                </td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan={3} className="p--4 text-center text-red-500">
                                    Failed to load admin.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="border-t border-slate-700 hover:bg-slate-800 transition">
                                    {row.getVisibleCells().map((cell) => (
                                        <td className="p-3" key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {open && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg relative">
                        <button onClick={() => setOpen(false)} className="absolute top-3 right-4 text-gray-400 hover:text-white"><X size={22} /></button>

                        <h3 className="text-lg font-semibold mb-4">Add New Admin</h3>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block mb-1">Email</label>
                                <input
                                    type="email"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="support@eshop.com"
                                    className="w-full px-3 py-2 outline-none bg-transparent border-2 border-slate-600 text-white rounded-sm"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Role</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-3 py-2 cursor-pointer text-black outline-none bg-transparent border-2 border-slate-600 rounded-sm"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-8 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="w-full bg-slate-700 text-white px-4 py-2 !rounded hover:bg-slate-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    onClick={() => updateRole()}
                                    className="w-full bg-blue-700 text-white px-4 py-2 !rounded hover:bg-blue-900"
                                >
                                    {isUpdating ? "Updating ..." : "Add Admin"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Management