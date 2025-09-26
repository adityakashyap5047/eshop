"use client";

import { useQuery } from "@tanstack/react-query";
import ProductCard from "apps/user-ui/src/shared/components/cards/product-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Range } from "react-range";

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
        
        router.replace(`/products?${decodeURIComponent(params.toString())}`);
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
                `/product/api/get-filtered-products?${query.toString()}`
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

  return (
    <div className="w-full bg-[#f5f5f5] pb-10">
        <div className="w-[90%] lg:w-[80%] m-auto">
            <div className="pb-[50px]">
                <h1 className="md:pt-[40px] font-medium text-[44px] leading-3 mb-[14px] font-jost">
                    All Products
                </h1>
                <Link href={"/"} className="text-[#55585b] hover:underline">
                    Home
                </Link>
                <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
                <span className="text-[#55585b]">All Products</span>
            </div>

            <div className="w-full flex flex-col lg:flex-row gap-8">
                <aside className="w-full lg:w-[300px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-4 h-fit">
                    {/* Price Filter Section */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Price Range</h3>
                        </div>
                        <div className="px-2 py-2">
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
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Range:</span>
                                <span className="text-sm text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
                                    ${tempPriceRange?.[0] || MIN} - ${tempPriceRange?.[1] || MAX}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    if (tempPriceRange && tempPriceRange.length === 2) {
                                        setPriceRange(tempPriceRange);
                                        setPage(1);
                                    }
                                }}
                                className="text-sm px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md font-medium"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                    {/* Categories Section */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
                        </div>

                        <ul className="space-y-3">
                            {isLoading ? (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm">Loading categories...</span>
                                </div>
                            ) : (
                                data?.categories?.map((category: any) => (
                                    <li key={category} className="group">
                                        <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200">
                                            <input 
                                                type="checkbox"
                                                checked={selectedCategories.includes(category)}
                                                onChange={() => toggleCategory(category)}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                                                {category}
                                            </span>
                                            {selectedCategories.includes(category) && (
                                                <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">✓</span>
                                            )}
                                        </label>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* Colors Section */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Colors</h3>
                        </div>
                        
                        <ul className="space-y-3">
                            {colors?.map((color: any) => (
                                <li key={color.name} className="group">
                                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200">
                                        <input 
                                            type="checkbox"
                                            checked={selectedColors.includes(color.code)}
                                            onChange={() => toggleColor(color.code)}
                                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                                        />
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-5 h-5 rounded-full border-2 border-gray-200 shadow-sm ring-1 ring-gray-100"
                                                style={{ backgroundColor: color.code }}
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium capitalize">
                                                {color.name}
                                            </span>
                                        </div>
                                        {selectedColors.includes(color.code) && (
                                            <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">✓</span>
                                        )}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Sizes Section */}
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-800">Sizes</h3>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                            {sizes.map((size) => (
                                <label 
                                    key={size}
                                    className={`
                                        relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
                                        ${selectedSizes.includes(size) 
                                            ? 'border-orange-500 bg-orange-50 text-orange-700' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={selectedSizes.includes(size)}
                                        onChange={() => toggleSize(size)}
                                        className="sr-only"
                                    />
                                    <span className="text-sm font-semibold">{size}</span>
                                    {selectedSizes.includes(size) && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">✓</span>
                                        </div>
                                    )}
                                </label>
                            ))}
                        </div>

                        {/* Clear Filters Button */}
                        {(selectedCategories.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0 || priceRange[0] !== MIN || priceRange[1] !== MAX) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setSelectedCategories([]);
                                        setSelectedColors([]);
                                        setSelectedSizes([]);
                                        setPriceRange([MIN, MAX]);
                                        setTempPriceRange([MIN, MAX]);
                                        setPage(1);
                                    }}
                                    className="w-full text-sm px-4 py-2 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-lg font-medium"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                <div className="flex-1 px-2 lg:px-3">
                    {isProductLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
                            {Array.from({length: 10}).map((_, index) => (
                            <div 
                                key={index}
                                className='h-[250px] bg-gray-300 animate-pulse rounded-xl'
                            />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div>No products found</div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 gap-2">
                            {Array.from({length: totalPages}).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i+1)}
                                    className={`px-3 py-1 !rounded border border-gray-200 text-sm ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white text-black"}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Page