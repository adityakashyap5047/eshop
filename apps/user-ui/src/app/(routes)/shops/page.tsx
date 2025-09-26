"use client";

import ShopCard from "apps/user-ui/src/shared/components/cards/shop-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { categories } from "apps/user-ui/src/utils/categories";
import { countries } from "apps/user-ui/src/utils/countries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {

    const [isShopLoading, setIsShopLoading] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [shops, setShops] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    const router = useRouter();

    const updateURL = () => {
        const params = new URLSearchParams();
        if(selectedCategories.length > 0) params.set("categories", selectedCategories.join(","));
        if(selectedCountries.length > 0) params.set("countries", selectedCountries.join(","));
        params.set("page", page.toString());
        router.replace(`/shops?${decodeURIComponent(params.toString())}`);
    }

    const fetchFilteredShops = async() => {

        setIsShopLoading(true);

        try {
            const query = new URLSearchParams();

            if(selectedCategories.length > 0){
                query.set("categories", selectedCategories.join(","));
            }
            if(selectedCountries.length > 0) query.set("countries", selectedCountries.join(","));
            query.set("page", page.toString());
            query.set("limit", '12');

            const res = await axiosInstance.get(
                `/product/api/get-filtered-shops?${query.toString()}`
            )

            setShops(res.data.shops);
            setTotalPages(res.data.pagination.totalPages);
        } catch (error) {
            console.log("Failed to fetch filtered shops", error);
        } finally {
            setIsShopLoading(false);
        }
    }

    useEffect(() => {
        updateURL();
        fetchFilteredShops();
    }, [selectedCategories, selectedCountries, page])

    const toggleCategory = (label: string) => {
        setSelectedCategories((prev) => prev.includes(label) ? prev.filter((cat) => cat !== label) : [...prev, label])
    }
    
    const toggleCountry = (label: string) => {
        setSelectedCountries((prev) => (
            prev.includes(label) ? prev.filter((cou) => cou !== label) : [...prev, label]
        ))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
            <div className="w-[90%] lg:w-[85%] mx-auto">
                {/* Enhanced Header Section */}
                <div className="pt-8 pb-12">
                    <div className="text-center mb-8">
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                            Discover Amazing Shops
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Explore our curated collection of verified shops from around the world
                        </p>
                    </div>
                    
                    {/* Breadcrumb */}
                    <nav className="flex items-center justify-center gap-2 text-sm">
                        <Link href={"/"} className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                            Home
                        </Link>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-600 font-medium">All Shops</span>
                    </nav>
                </div>

                <div className="w-full flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-[320px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden sticky top-4 h-fit">
                        {/* Categories Section */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                                <h3 className="text-xl font-bold text-gray-800">Shop Categories</h3>
                                {selectedCategories.length > 0 && (
                                    <div className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                                        {selectedCategories.length} selected
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100"
                                style={{scrollbarWidth: "none"}}
                            >
                                {categories?.map((category: any) => (
                                    <div key={category.label} className="group">
                                        <label className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-100 hover:shadow-sm">
                                            <input 
                                                type="checkbox"
                                                checked={selectedCategories.includes(category.value)}
                                                onChange={() => toggleCategory(category.value)}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-all duration-200"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-blue-700 font-medium flex-1">
                                                {category.label}
                                            </span>
                                            {selectedCategories.includes(category.value) && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            )}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Countries Section */}
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full shadow-sm"></div>
                                <h3 className="text-xl font-bold text-gray-800">Countries</h3>
                                {selectedCountries.length > 0 && (
                                    <div className="ml-auto bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                                        {selectedCountries.length} selected
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100"
                                style={{scrollbarWidth: "none"}}
                            >
                                {countries?.map((country: any) => (
                                    <div key={country.code} className="group">
                                        <label className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-green-100 hover:shadow-sm">
                                            <input 
                                                type="checkbox"
                                                checked={selectedCountries.includes(country.code)}
                                                onChange={() => toggleCountry(country.code)}
                                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer transition-all duration-200"
                                            />
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-lg">{country.flag || '🌍'}</span>
                                                <span className="text-sm text-gray-700 group-hover:text-green-700 font-medium">
                                                    {country.name}
                                                </span>
                                            </div>
                                            {selectedCountries.includes(country.code) && (
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            )}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            {/* Clear All Filters Button */}
                            {(selectedCategories.length > 0 || selectedCountries.length > 0) && (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            setSelectedCategories([]);
                                            setSelectedCountries([]);
                                            setPage(1);
                                        }}
                                        className="w-full text-sm px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-200 rounded-xl font-medium border border-gray-200 hover:border-red-200 shadow-sm hover:shadow-md"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </aside>

                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {isShopLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Finding shops...</span>
                                            </div>
                                        ) : (
                                            `${shops.length > 0 ? shops.length : 'No'} ${shops.length === 1 ? 'Shop' : 'Shops'} Found`
                                        )}
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        {selectedCategories.length > 0 || selectedCountries.length > 0 
                                            ? 'Filtered results based on your selection' 
                                            : 'Showing all available shops'
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                                        Page {page} of {totalPages}
                                    </div>
                                    {!isShopLoading && shops.length > 0 && (
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Shops Grid */}
                        {isShopLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {Array.from({length: 12}).map((_, index) => (
                                    <div key={index} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                                        <div className="h-48 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-5 bg-gray-200 rounded-lg animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                            <div className="flex gap-2 mt-3">
                                                <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                                                <div className="h-6 bg-gray-200 rounded-full w-12 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : shops.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {shops.map((shop) => (
                                    <div key={shop.id} className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl">
                                        <ShopCard shop={shop} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M9 16v1h6v-1" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Shops Found</h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    We couldn't find any shops matching your current filters. Try adjusting your search criteria or explore all shops.
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedCategories([]);
                                        setSelectedCountries([]);
                                        setPage(1);
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    🔄 Reset Filters
                                </button>
                            </div>
                        )}

                        {/* Enhanced Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="text-sm text-gray-600 flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg font-medium">
                                            Page {page} of {totalPages}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {/* Previous Button */}
                                        <button
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </button>

                                        {/* Page Numbers */}
                                        <div className="flex gap-2">
                                            {Array.from({length: Math.min(totalPages, 7)}).map((_, i) => {
                                                let pageNum;
                                                if (totalPages <= 7) {
                                                    pageNum = i + 1;
                                                } else if (page <= 4) {
                                                    pageNum = i + 1;
                                                } else if (page >= totalPages - 3) {
                                                    pageNum = totalPages - 6 + i;
                                                } else {
                                                    pageNum = page - 3 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setPage(pageNum)}
                                                        className={`w-10 h-10 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                                            page === pageNum 
                                                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110 border-2 border-blue-300" 
                                                                : "bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-md"
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Next Button */}
                                        <button
                                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                                            disabled={page === totalPages}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            Next
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page