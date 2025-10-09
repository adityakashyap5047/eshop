import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import { isProtected } from "../utils/protected";

//fetch user details from API
const fetchUser = async (isLoggedIn: boolean) => {
    const config = isLoggedIn ? isProtected : {};
    const response = await axiosInstance.get("/api/logged-in-user", config);
    return response.data.user;
}

const useUser = () => {
    const {setLoggedIn, isLoggedIn} = useAuthStore();

    const {data: user, isPending, isError} = useQuery({
        queryKey: ["user"],
        queryFn: () => fetchUser(isLoggedIn),
        staleTime: 5 * 60 * 1000,
        retry: false,
        // @ts-ignore
        onSuccess: () => { setLoggedIn(true) },
        onError: () => { setLoggedIn(false) }
    });

    return { user, isLoading: isPending, isError };
}

export default useUser;