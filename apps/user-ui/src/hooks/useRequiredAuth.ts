import { useRouter } from "next/navigation"
import useUser from "./useUser";
import { useEffect } from "react";

const useRequiredAuth = () => {
    const router = useRouter();
    const { user, isLoading } = useUser();

    useEffect(() => {
        if(!isLoading && !user) {
            router.replace("/login");
        }
    }, [isLoading, user, router]);

    return { 
        user, 
        isLoading,
        isAuthenticated: !isLoading && !!user 
    };
}

export default useRequiredAuth;