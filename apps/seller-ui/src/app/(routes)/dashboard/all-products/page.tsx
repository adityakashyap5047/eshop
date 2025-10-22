"use client"
import {useReactTable, getCoreRowModel, getFilteredRowModel, flexRender} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon, Eye, FileAxis3D, Pencil, Plus, Search, Star, Trash2, Package, AlertTriangle, TrendingUp, ShoppingBag } from "lucide-react";
import DeleteConfirmationModal from "apps/seller-ui/src/shared/components/modals/delete-confirmation-modal";

const fetchProducts = async () => {
    const res = await axiosInstance.get("/product/api/get-shop-products")
    return res?.data?.products;
}

const deleteProduct = async(productId: string) => {
    await axiosInstance.delete(`/product/api/delete-product/${productId}`);
}

const restoreProduct = async(productId: string) => {
    await axiosInstance.put(`/product/api/restore-product/${productId}`);
}

const ProductList = () => {

    const [globalFilter, setGlobalFilter] = useState("");
    // const [analyticsData, setAnalyticsData] = useState<any>(null);
    // const [showAnalytics, setShowAnalytics] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const queryClient = useQueryClient();

    const {data: products = [], isLoading} = useQuery({
        queryKey: ["shop-products"],
        queryFn: fetchProducts,
        staleTime: 5 * 60 * 1000,
    });

    const productStats = useMemo(() => {
        const total = products.length;
        const inStock = products.filter((product: any) => product.stock > 0).length;
        const lowStock = products.filter((product: any) => product.stock > 0 && product.stock < 10).length;
        const outOfStock = products.filter((product: any) => product.stock === 0).length;
        const totalValue = products.reduce((sum: number, product: any) => sum + (product.sale_price * product.stock), 0);

        return { total, inStock, lowStock, outOfStock, totalValue };
    }, [products]);

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
            header: "Product Name",
            cell: ({row}: any) => {
                const truncatedTitle = row.original.title.length > 25 ? `${row.original.title.substring(0, 25)}...` : row.original.title;
                return (
                    <span 
                        title={row.original.title}
                    >
                        {truncatedTitle}
                    </span>
                )
            }
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({row}: any) => <span>${row.original.sale_price}</span>
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
                        href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                        target="_blank"
                        className="text-blue-400 hover:text-blue-300 transition"
                    >
                        <Eye size={18} />
                    </Link>
                    <Link
                        href={`/product/edit/${row.original.slug}`}
                        className="text-yellow-400 hover:text-yellow-300 transition"
                    >
                        <Pencil size={18} />
                    </Link>
                    <button
                        className={`${!row.original.isDeleted ? "text-red-400 hover:text-red-300 transition" : "text-cyan-400 hover:text-cyan-300 transition"}`}
                        onClick={() => {
                            setSelectedProduct(row.original);
                            setShowDeleteModal(true);
                        }}
                    >
                        {!row.original.isDeleted ? <Trash2 size={18} /> : <FileAxis3D size={18} />}
                    </button>
                </div>
            )
        }
    ], []);

    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: {globalFilter},
        onGlobalFilterChange: setGlobalFilter,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["shop-products"]});
            setShowDeleteModal(false);
        }
    });

    const restoreMutation = useMutation({
        mutationFn: restoreProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["shop-products"]});
            setShowDeleteModal(false);
        }
    });

  return (
    <div className="w-full min-h-screen p-8">
        <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl text-white font-semibold">All Products</h2>
            <Link
                href={"/dashboard/create-product"}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex justify-center items-center gap-2"
            >
                <Plus size={18}/> Add New Product
            </Link>
        </div>

        <div className="flex items-center mb-4">
            <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
                Dashboard            
            </Link>
            <ChevronRightIcon className="text-gray-200" size={20} />
            <span className="text-white">All Products</span>
        </div>

        {/* Product Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Total Products</p>
                        <p className="text-white text-2xl font-bold">{productStats.total}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-400" />
                </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">In Stock</p>
                        <p className="text-green-400 text-2xl font-bold">{productStats.inStock}</p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-green-400" />
                </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Low Stock</p>
                        <p className="text-yellow-400 text-2xl font-bold">{productStats.lowStock}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Total Value</p>
                        <p className="text-purple-400 text-2xl font-bold">${productStats.totalValue.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
            </div>
        </div>

        <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent outline-none flex-1 text-white placeholder-gray-500"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
            />
        </div>

        <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
            {isLoading ? (
                <p className="text-center text-white">Loading products...</p>
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
                    product={selectedProduct}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={() => deleteMutation.mutate(selectedProduct.id)}
                    onRestore={() => restoreMutation.mutate(selectedProduct.id)}
                />
            )}
        </div>
    </div>
  )
}

export default ProductList