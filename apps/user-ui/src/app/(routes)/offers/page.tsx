"use client";

import { useQuery } from "@tanstack/react-query";
import ProductCard from "apps/user-ui/src/shared/components/cards/product-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Range } from "react-range";

// Add custom styles for scrollbar
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #10b981, #059669);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #059669, #047857);
  }
`;

const MIN = 0;
const MAX = 1199;

const colors = [
    {name: 'Black', code: '#000000'},
    {name: 'White', code: '#FFFFFF'},
    {name: 'Red', code: '#FF0000'},
    {name: 'Green', code: '#00FF00'},
    {name: 'Blue', code: '#0000FF'},
    {name: 'Yellow', code: '#FFFF00'},
    {name: 'Magenta', code: '#FF00FF'},
    {name: 'Cyan', code: '#00FFFF'},
] 

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const Page = () => {

    const [isProductLoading, setIsProductLoading] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 1199]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [products, setProducts] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [tempPriceRange, setTempPriceRange] = useState([199, 499]);

    const router = useRouter();

    const updateURL = () => {
        const params = new URLSearchParams();
        if(selectedCategories.length > 0) params.set("categories", selectedCategories.join(","));
        if(selectedColors.length > 0) params.set("colors", selectedColors.join(","))
        if(selectedSizes.length > 0) params.set("sizes", selectedSizes.join(","))
        params.set("priceRange", priceRange.join(","));
        params.set("page", page.toString());
        
        router.replace(`/offers?${decodeURIComponent(params.toString())}`);
    }

    const fetchFilteredProduct = async() => {
        setIsProductLoading(true);

        try {
            const query = new URLSearchParams();

            query.set("priceRange", priceRange.join(","));
            if(selectedCategories.length > 0){
                query.set("categories", selectedCategories.join(","));
            }
            if(selectedColors.length > 0){
                query.set("colors", selectedColors.join(","));
            }
            if(selectedSizes.length > 0){
                query.set("sizes", selectedSizes.join(","));
            }
            query.set("page", page.toString());
            query.set("limit", '12');

            const res = await axiosInstance.get(
                `/product/api/get-filtered-offers?${query.toString()}`
            )

            setProducts(res.data.products);
            setTotalPages(res.data.pagination.totalPages);
        } catch (error) {
            console.log("Failed to fetch filtered products", error);
        } finally {
            setIsProductLoading(false);
        }
    }

    const {data, isLoading} = useQuery({
        queryKey: ["categories"],
        queryFn: async() => {
            const res = await axiosInstance.get("/product/api/get-categories");
            return res.data;
        },
        staleTime: 1000 * 60 * 30,
    })

    useEffect(() => {
        updateURL();
        fetchFilteredProduct();
    }, [priceRange, selectedCategories, selectedColors, selectedSizes, page])

    const toggleCategory = (label: string) => {
        setSelectedCategories((prev) => prev.includes(label) ? prev.filter((cat) => cat !== label) : [...prev, label])
    }

    const toggleColor = (color: string) => {
        setSelectedColors((prev) => prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]);
    }

    const toggleSize = (size: string) => {
        setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
    }

    // Helper function to check if any filters are active
    const hasActiveFilters = () => {
        return (
            selectedCategories.length > 0 ||
            selectedColors.length > 0 ||
            selectedSizes.length > 0 ||
            priceRange[0] !== MIN ||
            priceRange[1] !== MAX
        );
    };

    // Function to clear all filters
    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedColors([]);
        setSelectedSizes([]);
        setPriceRange([MIN, MAX]);
        setTempPriceRange([MIN, MAX]);
        setPage(1);
    };

  return (
    <>
      <style jsx>{customScrollbarStyles}</style>
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        {/* Enhanced Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-16 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute top-20 right-16 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
                <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-white/10 rounded-full blur-md"></div>
            </div>
            
            <div className="relative z-10 w-[90%] lg:w-[80%] m-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Special Offers
                </h1>
                <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
                    Discover amazing deals and exclusive discounts on your favorite products
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-100">
                    <Link href={"/"} className="hover:text-white transition-colors duration-200">
                        Home
                    </Link>
                    <span className="w-1 h-1 bg-blue-200 rounded-full"></span>
                    <span className="text-white font-medium">Special Offers</span>
                </div>
            </div>
        </div>

        <div className="w-[90%] lg:w-[80%] m-auto py-8">
            <div className="w-full flex flex-col lg:flex-row gap-8">
                <aside className="w-full lg:w-[300px] lg:sticky lg:top-8 lg:h-fit">
                    <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl p-6 shadow-xl space-y-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Filter Products
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">Find exactly what you're looking for</p>
                        </div>

                        {/* Price Filter Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">$</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Price Range</h3>
                            </div>
                            <div className="ml-2">
                        <Range
                            step={1}
                            min={MIN}
                            max={MAX}
                            values={tempPriceRange}
                            allowOverlap={false}
                            onChange={(values) => {
                                if (values && values.length === 2) {
                                    setTempPriceRange(values);
                                }
                            }}
                            renderTrack={({props, children}) => {
                                const [min, max] = tempPriceRange || [MIN, MAX];
                                const percentageLeft = Math.max(0, Math.min(100, ((min - MIN) / (MAX - MIN)) * 100));
                                const percentageRight = Math.max(0, Math.min(100, ((max - MIN) / (MAX - MIN)) * 100));

                                return(
                                    <div 
                                        {...props}
                                        className="relative !cursor-pointer"
                                        style={{
                                            ...props.style,
                                            height: '6px',
                                            background: '#e5e7eb',
                                            borderRadius: '3px',
                                            margin: '12px 0'
                                        }}
                                    >
                                        <div 
                                            className="absolute bg-blue-600 rounded"
                                            style={{
                                                left: `${percentageLeft}%`,
                                                width: `${Math.max(0, percentageRight - percentageLeft)}%`,
                                                height: '100%',
                                                borderRadius: '3px',
                                                top: 0
                                            }}
                                        />
                                        {children}
                                    </div>
                                )
                            }}
                            renderThumb={({props, index}) => {
                                const {key, ...rest} = props;
                                return (
                                    <div 
                                        key={key}
                                        {...rest}
                                        className="w-[18px] h-[18px] bg-blue-600 rounded-full shadow-lg border-2 border-white cursor-pointer hover:bg-blue-700 transition-colors"
                                        style={{
                                            ...rest.style,
                                            transform: 'translate(-50%, -50%)',
                                            top: '10%',
                                            outline: 'none',
                                            zIndex: 10
                                        }}
                                        title={`${index === 0 ? 'Min' : 'Max'}: $${tempPriceRange[index]}`}
                                    />
                                )
                            }}
                        />
                    </div>
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
                                    ${tempPriceRange?.[0] || MIN} - ${tempPriceRange?.[1] || MAX}
                                </div>
                                <button
                                    onClick={() => {
                                        if (tempPriceRange && tempPriceRange.length === 2) {
                                            setPriceRange(tempPriceRange);
                                            setPage(1);
                                        }
                                    }}
                                    className="text-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Categories Section */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">📂</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
                            </div>

                            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                {isLoading ? (
                                    <div className="space-y-2">
                                        {Array.from({length: 5}).map((_, i) => (
                                            <div key={i} className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {data?.categories?.map((category: any) => (
                                            <li key={category} className="group">
                                                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-all duration-200 cursor-pointer group-hover:shadow-sm">
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedCategories.includes(category)}
                                                        onChange={() => toggleCategory(category)}
                                                        className="w-4 h-4 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                                                    />
                                                    <span className="text-sm text-gray-700 font-medium capitalize group-hover:text-gray-900 transition-colors">
                                                        {category}
                                                    </span>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Colors Section */}
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">🎨</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Colors</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {colors?.map((color: any, index: number) => (
                                    <label
                                        key={`${color.name}-${index}`}
                                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-all duration-200 cursor-pointer group"
                                    >
                                        <input 
                                            type="checkbox"
                                            checked={selectedColors.includes(color.code)}
                                            onChange={() => toggleColor(color.code)}
                                            className="sr-only"
                                        />
                                        <div className={`relative w-6 h-6 rounded-full border-2 shadow-sm transition-all duration-200 ${
                                            selectedColors.includes(color.code) 
                                                ? 'border-pink-400 ring-2 ring-pink-200' 
                                                : 'border-gray-300 group-hover:border-pink-300'
                                        }`} 
                                        style={{backgroundColor: color.code}}>
                                            {selectedColors.includes(color.code) && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">✓</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                                            {color.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Sizes Section */}
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">📏</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Sizes</h3>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size) => (
                                    <label
                                        key={size}
                                        className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 cursor-pointer transition-all duration-200 font-semibold text-sm ${
                                            selectedSizes.includes(size)
                                                ? 'border-orange-400 bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg transform scale-105'
                                                : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                                        }`}
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={selectedSizes.includes(size)}
                                            onChange={() => toggleSize(size)}
                                            className="sr-only"
                                        />
                                        {size}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Clear All Filters Button - Only show when filters are active */}
                        {hasActiveFilters() && (
                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    onClick={clearAllFilters}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2 group"
                                >
                                    <span className="text-lg group-hover:rotate-12 transition-transform duration-200">🗑️</span>
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                <div className="flex-1">
                    {/* Results Header */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-lg">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {isProductLoading ? (
                                        <span className="animate-pulse">Loading...</span>
                                    ) : (
                                        `${products.length} Products Found`
                                    )}
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {selectedCategories.length > 0 && (
                                        <span>Categories: {selectedCategories.join(', ')} • </span>
                                    )}
                                    {selectedColors.length > 0 && (
                                        <span>Colors: {selectedColors.length} selected • </span>
                                    )}
                                    {selectedSizes.length > 0 && (
                                        <span>Sizes: {selectedSizes.join(', ')} • </span>
                                    )}
                                    Price: ${priceRange[0]} - ${priceRange[1]}
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                Page {page} of {totalPages}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {isProductLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({length: 12}).map((_, index) => (
                                <div 
                                    key={index}
                                    className='bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden animate-pulse'
                                >
                                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-gray-300 rounded-lg w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded-lg w-1/2"></div>
                                        <div className="h-6 bg-gray-300 rounded-lg w-1/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="transform hover:scale-105 transition-all duration-300">
                                    <ProductCard product={product} isEvent={true}/>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 border border-white/20 shadow-lg">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-3xl">🔍</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">No Products Found</h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    We couldn't find any products matching your current filters. 
                                    Try adjusting your search criteria.
                                </p>
                            </div>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-12">
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => page > 1 && setPage(page - 1)}
                                        disabled={page === 1}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                            page === 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white shadow-md hover:shadow-lg'
                                        }`}
                                    >
                                        Previous
                                    </button>

                                    {/* Page Numbers */}
                                    {(() => {
                                        const maxVisiblePages = 5;
                                        const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
                                        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                                        const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);

                                        return Array.from({length: endPage - adjustedStartPage + 1}).map((_, i) => {
                                            const pageNum = adjustedStartPage + i;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`w-10 h-10 rounded-xl font-semibold transition-all duration-200 ${
                                                        page === pageNum
                                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                                                            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg hover:transform hover:scale-105'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            )
                                        });
                                    })()}

                                    {/* Next Button */}
                                    <button
                                        onClick={() => page < totalPages && setPage(page + 1)}
                                        disabled={page === totalPages}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                            page === totalPages
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white shadow-md hover:shadow-lg'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </>
  )
}

export default Page