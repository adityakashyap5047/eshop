import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type  Product = {
    id: string;
    title: string;
    price: number;
    image: string;
    quantity?: number;
    shopId: string;
}

type Store = {
    cart: Product[];
    whishList: Product[];
    addToCart: (
        product: Product,
        user: any,
        location: string,
        deviceInfo: string
    ) => void;
    removeFromCart: (
        id: string,
        user: any,
        location: string, deviceInfo: string
    ) => void;
    addToWhishList: (
        product: Product,
        user: any,
        location: string,
        deviceInfo: string
    ) => void;
    removeFromWhishList: (
        id: string,
        user: any,
        location: string,
        deviceInfo: string
    ) => void;
}

export const useStore = create<Store>()(
    persist(
        (set: any, get: any) => ({
            cart: [] as Product[],
            whishList: [] as Product[],

            addToCart: (product: Product, user: any, location: string, deviceInfo: string) => {
                set((state: any) => {
                    const existing = state.cart?.find((item: Product) => item.id === product.id);
                    if (existing) {
                        return {
                            cart: state.cart.map((item: Product) => item.id === product.id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item)
                        }
                    }

                    return {
                        cart: [...state.cart, { ...product, quantity: 1 }]
                    }
                })
            },

            removeFromCart: (id: string, user: any, location: string, deviceInfo: string) => {
                const removeProduct = get().cart.find((item: Product) => item.id === id);
                set((state: any) => ({
                    cart: state.cart?.filter((item: Product) => item.id !== id)
                }))
            },

            addToWhishList: (product: Product, user: any, location: string, deviceInfo: string) => {
                set((state: any) => {
                    const existing = state.whishList?.find((item: Product) => item.id === product.id);
                    if (existing) {
                        return state;
                    }
                    return {
                        whishList: [...state.whishList, product]
                    }
                }
                )
            },

            removeFromWhishList: (id: string, user: any, location: string, deviceInfo: string) => {
                const removedProduct = get().whishList.find((item: Product) => item.id === id);

                set((state: any) => ({
                    whishList: state.whishList?.filter((item: Product) => item.id !== id)
                }))
            }
        }),
        { name: "store-storage" }
    )
);