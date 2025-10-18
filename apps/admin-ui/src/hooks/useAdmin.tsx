"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../utils/axiosInstance";
import { AxiosError } from "axios";

const fetchAdmin = async () => {
    try {
        const response = await axiosInstance.get("/api/logged-in-admin");
        return response.data.admin;
    } catch (error) {
        if (error instanceof AxiosError && (error.response?.status === 401 || error.response?.status === 403)) {
            return null;
        }
        throw error;
    }
}

const useAdmin = () => {

    const {data: admin, isLoading, isError, refetch} = useQuery({
        queryKey: ["admin"],
        queryFn: fetchAdmin,
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
            if (error instanceof AxiosError && (error.response?.status === 401 || error.response?.status === 403)) {
                return false;
            }
            return failureCount < 1;
        },
        refetchOnWindowFocus: false,
    });

    const history = useRouter();

    useEffect(() => {
        if (!isLoading && (admin === null || admin === undefined || (isError && !admin))) {
            history.replace("/");
        }
    }, [admin, isLoading, isError, history]);

    return { admin, isLoading, isError, refetch };
}

export default useAdmin;