import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
    isLoggedIn: boolean;
    setLoggedIn: (status: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isLoggedIn: false,
            setLoggedIn: (value) => set({isLoggedIn: value}),
            logout: () => set({isLoggedIn: false})
        }),
        {
            name: "auth-storage",
        }
    )
);