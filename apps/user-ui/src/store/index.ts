import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendKafkaEvent } from '../actions/track-user';

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
        location: any,
        deviceInfo: any
    ) => void;
    removeFromCart: (
        id: string,
        user: any,
        location: any, 
        deviceInfo: any
    ) => void;
    addToWhishList: (
        product: Product,
        user: any,
        location: any,
        deviceInfo: any
    ) => void;
    removeFromWhishList: (
        id: string,
        user: any,
        location: any,
        deviceInfo: any
    ) => void;
}

export const useStore = create<Store>()(
    persist(
        (set: any, get: any) => ({
            cart: [] as Product[],
            whishList: [] as Product[],

            addToCart: (product: Product, user: any, location: any, deviceInfo: any) => {
                set((state: any) => {
                    const existing = state.cart?.find((item: Product) => item.id === product.id);
                    if (existing) {
                        return {
                            cart: state.cart.map((item: Product) => item.id === product.id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item)
                        }
                    }

                    return {
                        cart: [...state.cart, { ...product, quantity: product?.quantity ?? 1 }]
                    }
                })
                // Send kafka event
                if(user?.user?.id && location && deviceInfo){
                    sendKafkaEvent({
                        userId: user.user.id,
                        productId: product.id,
                        shopId: product.shopId,
                        action: 'add_to_cart',
                        device: deviceInfo,
                        country: location?.country || "India",
                        city: location?.city || "Unknown",
                    });
                }
            },

            removeFromCart: (id: string, user: any, location: any, deviceInfo: string) => {
                const removeProduct = get().cart.find((item: Product) => item.id === id);
                set((state: any) => ({
                    cart: state.cart?.filter((item: Product) => item.id !== id)
                }))
                // Send kafka event
                if(user?.id && location && deviceInfo && removeProduct){
                    sendKafkaEvent({
                        userId: user.id,
                        productId: removeProduct.id,
                        shopId: removeProduct.shopId,
                        action: 'remove_from_cart',
                        device: deviceInfo,
                        country: location?.country || "India",
                        city: location?.city || "Unknown",
                    });
                }
            },

            addToWhishList: (product: Product, user: any, location: any, deviceInfo: any) => {
                set((state: any) => {
                    const existing = state.whishList?.find((item: Product) => item.id === product.id);
                    if (existing) {
                        return state;
                    }
                    return {
                        whishList: [...state.whishList, product]
                    }
                });

                // Send kafka event
                if(user?.user?.id && location && deviceInfo){
                    sendKafkaEvent({
                        userId: user.user.id,
                        productId: product.id,
                        shopId: product.shopId,
                        action: 'add_to_wishlist',
                        device: deviceInfo,
                        country: location?.country || "India",
                        city: location?.city || "Unknown",
                    });
                }
            },

            removeFromWhishList: (id: string, user: any, location: any, deviceInfo: any) => {
                const removedProduct = get().whishList.find((item: Product) => item.id === id);

                set((state: any) => ({
                    whishList: state.whishList?.filter((item: Product) => item.id !== id)
                }))
                // Send kafka event
                if(user?.user?.id && location && deviceInfo && removedProduct){
                    sendKafkaEvent({
                        userId: user.user.id,
                        productId: removedProduct.id,
                        shopId: removedProduct.shopId,
                        action: 'remove_from_wishlist',
                        device: deviceInfo,
                        country: location?.country || "India",
                        city: location?.city || "Unknown",
                    });
                }
            }
        }),
        { name: "store-storage" }
    )
);