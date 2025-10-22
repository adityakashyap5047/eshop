"use client"
import {useReactTable, getCoreRowModel, getFilteredRowModel, flexRender} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BarChart, Calendar, ChevronRightIcon, Clock, Eye, FileAxis3D, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import DeleteConfirmationModal from "apps/seller-ui/src/shared/components/modals/delete-confirmation-modal";

const fetchEvents = async () => {
    const res = await axiosInstance.get("/product/api/get-shop-products");
    const events = res?.data?.products?.filter((product: any) => 
        product.starting_date && product.ending_date
    );
    return events || [];
}

const deleteEvent = async(eventId: string) => {
    await axiosInstance.delete(`/product/api/delete-product/${eventId}`);
}

const restoreEvent = async(eventId: string) => {
    await axiosInstance.put(`/product/api/restore-product/${eventId}`);
}

const EventList = () => {

    const [globalFilter, setGlobalFilter] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const queryClient = useQueryClient();

    const {data: events = [], isLoading} = useQuery({
        queryKey: ["shop-events"],
        queryFn: fetchEvents,
        staleTime: 5 * 60 * 1000,
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEventStatus = (startDate: string, endDate: string) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now < start) {
            return { status: 'upcoming', color: 'text-blue-400', text: 'Upcoming' };
        } else if (now >= start && now <= end) {
            return { status: 'active', color: 'text-green-400', text: 'Active' };
        } else {
            return { status: 'ended', color: 'text-red-400', text: 'Ended' };
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: "image",
            header: "Image",
            cell: ({row}: any) => {
                return (
                    <Image src={row.original.images[0]?.url}
                        alt={row.original.images[0]?.url}
                        className="w-12 h-12 rounded-md object-cover"
                        width={200}
                        height={200}
                    />
                )
            }
        },
        {
            accessorKey: "name",
            header: "Event Name",
            cell: ({row}: any) => {
                const truncatedTitle = row.original.title.length > 25 ? `${row.original.title.substring(0, 25)}...` : row.original.title;
                return (
                    <Link 
                        href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                        className="text-blue-600 hover:underline"
                        title={row.original.title}
                    >
                        {truncatedTitle}
                    </Link>
                )
            }
        },
        {
            accessorKey: "price",
            header: "Event Price",
            cell: ({row}: any) => (
                <div className="flex flex-col">
                    <span className="text-gyay-400 font-semibold">${row.original.sale_price}</span>
                </div>
            )
        },
        {
            accessorKey: "stock",
            header: "Stock",
            cell: ({row}: any) => (
                <span
                    className={row.original.stock < 10 ? "text-red-500" : "text-white"}
                >
                    {row.original.stock} left
                </span>
            )
        },
        {
            accessorKey: "dates",
            header: "Event Period",
            cell: ({row}: any) => (
                <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-1 text-green-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(row.original.starting_date)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(row.original.ending_date)}</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({row}: any) => {
                const eventStatus = getEventStatus(row.original.starting_date, row.original.ending_date);
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${eventStatus.color} bg-gray-800`}>
                        {eventStatus.text}
                    </span>
                );
            }
        },
        {
            accessorKey: "category",
            header: "Category",
        },
        {
            accessorKey: "rating",
            header: "Rating",
            cell: ({row}: any) => (
                <div className="flex items-center gap-1 text-yellow-400">
                    <Star fill="#fde046" size={18} />{" "}
                    <span className="text-white">{row.original.ratings || 5}</span>
                </div>
            )
        },
        {
            header: "Actions",
            cell: ({row}: any) => (
                <div className="flex gap-3">
                    <Link
                        href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.id}`}
                        className="text-blue-400 hover:text-blue-300 transition"
                        title="View Event"
                    >
                        <Eye size={18} />
                    </Link>
                    <Link
                        href={`/product/edit/${row.original.id}`}
                        className="text-yellow-400 hover:text-yellow-300 transition"
                        title="Edit Event"
                    >
                        <Pencil size={18} />
                    </Link>
                    <button
                        className={`${!row.original.isDeleted ? "text-red-400 hover:text-red-300 transition" : "text-cyan-400 hover:text-cyan-300 transition"}`}
                        onClick={() => {
                            setSelectedEvent(row.original);
                            setShowDeleteModal(true);
                        }}
                        title={!row.original.isDeleted ? "Delete Event" : "Restore Event"}
                    >
                        {!row.original.isDeleted ? <Trash2 size={18} /> : <FileAxis3D size={18} />}
                    </button>
                </div>
            )
        }
    ], []);

    const table = useReactTable({
        data: events,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: {globalFilter},
        onGlobalFilterChange: setGlobalFilter,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["shop-events"]});
            setShowDeleteModal(false);
        }
    });

    const restoreMutation = useMutation({
        mutationFn: restoreEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["shop-events"]});
            setShowDeleteModal(false);
        }
    });

    const eventStats = useMemo(() => {
        const upcoming = events.filter((event: any) => 
            getEventStatus(event.starting_date, event.ending_date).status === 'upcoming'
        ).length;
        const active = events.filter((event: any) => 
            getEventStatus(event.starting_date, event.ending_date).status === 'active'
        ).length;
        const ended = events.filter((event: any) => 
            getEventStatus(event.starting_date, event.ending_date).status === 'ended'
        ).length;

        return { upcoming, active, ended, total: events.length };
    }, [events]);

  return (
    <div className="w-full min-h-screen p-8">
        <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl text-white font-semibold">All Events</h2>
            </div>
            <Link
                href={"/dashboard/create-event"}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex justify-center items-center gap-2"
            >
                <Plus size={18}/> Add New Event
            </Link>
        </div>

        <div className="flex items-center mb-4">
            <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
                Dashboard            
            </Link>
            <ChevronRightIcon className="text-gray-200" size={20} />
            <span className="text-white">All Events</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
        </div>

        <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
                type="text"
                placeholder="Search events..."
                className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
            />
        </div>

        <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-16 h-16 text-gray-600 mb-4" />
                    <p className="text-center text-white">Loading events...</p>
                </div>
            ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-16 h-16 text-gray-600 mb-4" />
                    <p className="text-center text-gray-400 text-lg mb-2">No events found</p>
                    <p className="text-center text-gray-500 mb-4">Create your first event to get started</p>
                    <Link
                        href={"/dashboard/create-event"}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={18}/> Create Your First Event
                    </Link>
                </div>
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

            {showDeleteModal && (
                <DeleteConfirmationModal
                    product={selectedEvent}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={() => deleteMutation.mutate(selectedEvent.id)}
                    onRestore={() => restoreMutation.mutate(selectedEvent.id)}
                />
            )}
        </div>
    </div>
  )
}

export default EventList