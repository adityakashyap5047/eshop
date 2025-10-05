"use client"
import { loadStripe, Appearance } from '@stripe/stripe-js'; 
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const Page = () => {
    const [clientSecret, setClientSecret] = useState("");
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [coupon, setCoupon] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    const sessionId = searchParams.get("sessionId");

    useEffect(() => {
        const fetchSessionAndClientSecret = async() => {
            if(!sessionId){
                setError("Invalid session. Please try again.")
                setLoading(false);
                return;
            }

            try {
                const verifyRes = await axiosInstance.get(
                    `/order/api/verify-payment-session?sessionId=${sessionId}`
                );

                const {totalAmount, sellers, cart, coupon} = verifyRes.data.session;

                if(!sellers || 
                    sellers.length === 0 ||
                    totalAmount === undefined ||
                    totalAmount === null
                ) {
                    throw new Error("Invalid payment session data.")
                }

                setCartItems(cart);
                setCoupon(coupon);
                const sellersStripeAccountId = sellers[0].stripeAccountId;

                const intentRes = await axiosInstance.post(
                    "/order/api/create-payment-intent", {
                        amount: coupon?.discountAmount ? totalAmount - coupon?.discountAmount : totalAmount,
                        sellersStripeAccountId,
                        sessionId
                    }
                );

                setClientSecret(intentRes.data.clientSecret);
            } catch (error) {
                console.error(error);
                setError("Something went wrong while preparing your payment")
            } finally {
                setLoading(false);
            }
        }
    })

    return (
        <div>
            
        </div>
    )
}

export default Page