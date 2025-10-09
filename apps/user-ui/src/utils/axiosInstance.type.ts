import type { AxiosRequestConfig } from "axios";

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    redirectAuth?: boolean;
    _retry?: boolean;
    requireAuth?: boolean;
}