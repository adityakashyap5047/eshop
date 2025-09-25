"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Range } from "react-range";

const MIN = 0;
const MAX = 1199;

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
                <aside className="w-full lg:w-[270px] !rounded bg-white p-4 space-y-6 shadow-md">
                    <h3 className="text-xl font-Poppins font-medium">Price Filter</h3>
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
                    <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-gray-600">
                            ${tempPriceRange?.[0] || MIN} - ${tempPriceRange?.[1] || MAX}
                        </div>
                        <button
                            onClick={() => {
                                if (tempPriceRange && tempPriceRange.length === 2) {
                                    setPriceRange(tempPriceRange);
                                    setPage(1);
                                }
                            }}
                            className="text-sm px-4 py-1 bg-gray-200 hover:bg-blue-600 hover:text-white transition !rounded"
                        >
                            Apply
                        </button>
                    </div>

                    <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1">
                        Categories
                    </h3>

                    <ul className="space-y-2 !mt-3">
                        {isLoading ? (
                            <p>Loading ...</p>
                        ) : (
                            data?.categories?.map((category: any) => (
                                <li
                                    key={category}
                                    className="flex items-center justify-between"
                                >
                                    <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                                        <input type="checkbox"
                                            checked={selectedCategories.includes(category)}
                                            onChange={() => toggleCategory(category)}
                                            className="accent-blue-600 cursor-pointer"
                                        />
                                        {category}
                                    </label>
                                </li>
                            ))
                        )}
                    </ul>
                </aside>
            </div>
        </div>
    </div>
  )
}

export default Page