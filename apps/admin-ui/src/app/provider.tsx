"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const Providers = ({ children }: { children: React.ReactNode }) => {
    const [ queryClient ] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                staleTime: 5 * 60 * 1000,
            }
        }
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    className: '',
                    duration: 4000,
                    style: {
                        background: '#1F2937',
                        color: '#F9FAFB',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#FFFFFF',
                        },
                    },
                    error: {
                        duration: 5000,
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#FFFFFF',
                        },
                    },
                }}
            />
            {children}
        </QueryClientProvider>
    );
}

export default Providers;