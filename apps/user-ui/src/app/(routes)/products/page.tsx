"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Range } from "react-range";

const MIN = 0;
const MAX = 1190;

const Page = () => {

    const [isProductLoading, setIsProductLoading] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 1199]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [products, setProducts] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);

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
                <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full">.</span>
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
                            onChange={(values) => setTempPriceRange(values)}
                            renderTrack={({props, children}) => {
                                const [min, max] = tempPriceRange;
                                const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                                const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                                return(
                                    <div 
                                        {...props}
                                        className="h-[6px bg-blue-200 rounded relative"
                                        style={{...props.style}}
                                    >
                                        <div className="absolute h-full bg-blue-600 rounded"
                                            style={{
                                                left: `${percentageLeft}`,
                                                width: `${percentageRight - percentageLeft}`
                                            }}
                                        >
                                            {children}
                                        </div>
                                    </div>
                                )
                            }}
                            renderThumb={({props}) => {
                                const {key, ...rest} = props;
                                return (
                                    <div 
                                        key={key}
                                        {...rest}
                                        className="w-[16px] h-[16px] bg-blue-600 rounded-full shadow"
                                    />
                                )
                            }}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-gray-600">
                            ${tempPriceRange[0]} - ${tempPriceRange[1]}
                        </div>
                        <button
                            onClick={() => {
                                setPriceRange(tempPriceRange)
                                setPage(1);
                            }}
                            className="text-sm px-4 py-1 bg-gray-200 hover:bg-blue-600 hover:text-white transition !rounded"
                        >
                            Apply
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    </div>
  )
}

export default Page