"use client"
import {useReactTable, getCoreRowModel, getFilteredRowModel, flexRender, getSortedRowModel} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon, Eye, Search, Star, Package, AlertTriangle, TrendingUp, ShoppingBag, Download } from "lucide-react";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { saveAs } from "file-saver"

const ProductList = () => {

    const [globalFilter, setGlobalFilter] = useState("");
    const diferredFilter = useDeferredValue(globalFilter);
    const [page, setPage] = useState(1);
    const limit = 10;

    const {data, isLoading} = useQuery({
      queryKey: ["all-products", page],
      queryFn: async() => {
        const res = await axiosInstance.get(
          `/admin/api/get-all-products?page=${page}&limit=${limit}`
        );
        return res.data;
      },
      placeholderData: (prev) => prev,
      staleTime: 5 * 60 * 1000,
    });

    const products = data?.data || [];

    const filteredProducts = useMemo(() => {
      return products.filter((prod: any) => 
        Object.values(prod)
          .join(" ")
          .toLowerCase()
          .includes(diferredFilter.toLowerCase())
      )
    }, [products, diferredFilter]);

    const totalPages = Math.ceil((data?.meta?.totalProducts ?? 0) / limit);
    
    // Product statistics
    const productStats = useMemo(() => {
      const total = filteredProducts.length;
      const inStock = filteredProducts.filter((product: any) => product.stock > 0).length;
      const lowStock = filteredProducts.filter((product: any) => product.stock > 0 && product.stock < 10).length;
      const outOfStock = filteredProducts.filter((product: any) => product.stock === 0).length;
      const totalValue = filteredProducts.reduce((sum: number, product: any) => sum + (product.sale_price * product.stock), 0);

      return { total, inStock, lowStock, outOfStock, totalValue };
    }, [filteredProducts]);

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
          accessorKey: "title",
          header: "Title",
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
          accessorKey: "shop",
          header: "Shop",
          cell: ({row}: any) => (
              <div className="flex items-center">
                  <span className="text-white">{row.original?.Shop?.name}</span>
              </div>
          )
        },
        {
          accessorKey: "createdAt",
          header: "CreatedAt",
          cell: ({row}: any) => (
              <div className="flex items-center">
                  <span className="text-white">{row.original?.createdAt.split("T")[0]}</span>
              </div>
          )
        },
        {
            header: "Actions",
            cell: ({row}: any) => (
                <div className="flex gap-3">
                    <Link
                        href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                        className="text-blue-400 hover:text-blue-300 transition"
                    >
                        <Eye size={18} />
                    </Link>
                </div>
            )
        }
    ], []);

    const table = useReactTable({
      data: filteredProducts,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      globalFilterFn: "includesString",
      state: {globalFilter},
      onGlobalFilterChange: setGlobalFilter,
    });

    const exportCSV = () => {
      const csvData = filteredProducts.map(
        (p: any) => 
          `${p.title},${p.sale_price},${p.stock},${p.category},${p.ratings},${p.Shop.name},${p.createdAt.split("T")[0]}`
      );
      const blob = new Blob(
        [`Title,Price,Stock,Category,Rating,Shop\n${csvData.join("\n")}`],
        {type: "text/csv;charset=utf-8"}
      );
      saveAs(blob, `products-page-${page}.csv`);
    };

  return (
    <div className="w-full min-h-screen p-8">
        <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl text-white font-semibold">All Products</h2>
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

export default ProductList