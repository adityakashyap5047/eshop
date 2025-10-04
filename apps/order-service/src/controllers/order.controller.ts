import { ValidationError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import redis from '@packages/libs/redis';
import { NextFunction, Response } from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-08-27.basil',
});

// Create Payment Intent
export const createPaymentIntent = async(
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const {amount, sellerStripeAccountId, sessionId} = req.body;

        const customerAmount = Math.round(amount * 100);
        const platformFee = Math.floor(customerAmount * 0.1);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: customerAmount,
            currency: 'usd',
            payment_method_types: ['card'],
            application_fee_amount: platformFee,
            transfer_data: {
                destination: sellerStripeAccountId,
            },
            metadata: {
                sessionId,
                userId: req.user.id
            }
        })

        res.send({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        next(error);
    }
}

// Create Payment Session
export const createPaymentSession = async(
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const {cart, selectedAddressId, coupon} = req.body;
        const userId = req.user.id;

        if(!cart || !Array.isArray(cart) || cart.length === 0) {
            return next(new ValidationError("Cart is empty or invalid!"));
        }

        const normailizedCart = JSON.stringify(
            cart.map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                sale_price: item.sale_price,
                shopId: item.shopId,
                selectedOptions: item.selectedOptions || {}
            })).sort((a, b) => a.id.localeCompare(b.id)) // Sort to ensure consistent order
        )

        const keys = await redis.keys("payment_session:*");
        for(const key of keys){
            const data = await redis.get(key);
            if(data){
                const session = JSON.parse(data);
                if(session.userId === userId){
                    const existingCart = JSON.stringify(
                        session.cart.map((item: any) => ({
                            id: item.id,
                            quantity: item.quantity,
                            sale_price: item.sale_price,
                            shopId: item.shopId,
                            selectedOptions: item.selectedOptions || {}
                        })).sort((a: any, b: any) => a.id.localeCompare(b.id)) // Sort to ensure consistent order
                    );
                    if(existingCart === normailizedCart){
                        return res.status(200).json({sessionId: key.split(":")[1]});
                    } else {
                        await redis.del(key);
                    }
                }
            }
        }

        // fetch sellers and their stripe account ids
        const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))];

        const shops = await prisma.shops.findMany({
            where: {
                id: {in: uniqueShopIds}
            },
            select: {
                id: true,
                sellers: {
                    select: {
                        stripeId: true,
                        id: true,
                    }
                }
            }
        });

        const sellerData = shops.map((shop) => ({
            shopId: shop.id,
            sellerId: shop.sellers?.[0]?.id,
            stripeAccountId: shop.sellers?.[0]?.stripeId
        }));

        // calculate total amount
        const totalAmount = cart.reduce((total: number, item: any) => {
            return total + (item.sale_price * item.quantity);
        }, 0);

        // create session payload
        const sessionId = crypto.randomUUID();

        const sessionData = {
            userId,
            cart,
            sellers: sellerData,
            totalAmount,
            shippingAddressId: selectedAddressId || null,
            coupon: coupon || null,
        }

        await redis.setex(
            `payment_session:${sessionId}`,
            600, // 10 minutes expiration
            JSON.stringify(sessionData)
        );

        return res.status(201).json({sessionId});
    } catch (error) {
        next(error);
    }
}