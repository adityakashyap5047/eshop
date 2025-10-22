import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../utils/axiosInstance";
import { AxiosError } from "axios";

//fetch seller details from API
const fetchSeller = async () => {
    try {
        const response = await axiosInstance.get("/api/logged-in-seller");
        return response.data.seller;
    } catch (error) {
        if (error instanceof AxiosError && (error.response?.status === 401 || error.response?.status === 403)) {
            return null;
        }
        throw error;
    }
}

const useSeller = () => {
    const {data: seller, isLoading, isError, refetch} = useQuery({
        queryKey: ["seller"],
        queryFn: fetchSeller,
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
            // Don't retry on authentication errors
            if (error instanceof AxiosError && (error.response?.status === 401 || error.response?.status === 403)) {
                return false;
            }
            return failureCount < 1;
        },
        refetchOnWindowFocus: false,
    });

    const router = useRouter();

    useEffect(() => {
        console.log('useSeller useEffect:', { seller, isLoading, isError });
        
        // Redirect if not loading and no seller data (including explicit null from auth errors)
        if (!isLoading && (seller === null || seller === undefined || (isError && !seller))) {
            console.log('Redirecting to login page due to no seller data');
            router.replace("/login");
        }
    }, [seller, isLoading, isError, router]);

    return {seller, isLoading, isError, refetch};
}

export default useSeller;