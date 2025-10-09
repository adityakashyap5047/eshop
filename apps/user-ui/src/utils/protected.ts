import { CustomAxiosRequestConfig } from "./axiosInstance.type";

export const isProtected: CustomAxiosRequestConfig = {
    requireAuth: true,
}