import isAuthenticated from '@packages/middleware/isAuthenticated';
import express, {Router} from 'express';
import { createPaymentIntent, createPaymentSession, getOrderDetails, getSellersOrder, getUserOrders, updateDeliveryStatus, verifyCouponCode, verifyPaymentSession } from '../controllers/order.controller';
import { isSeller } from '@packages/middleware/authorizeRoles';

const router: Router = express.Router();

router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);
router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get("/verify-payment-session", isAuthenticated, verifyPaymentSession);
router.get("/get-seller-orders", isAuthenticated, isSeller, getSellersOrder);
router.get("/get-order-details/:id", isAuthenticated, getOrderDetails);
router.put("/update-status/:orderId", isAuthenticated, isSeller, updateDeliveryStatus);
router.put("/verify-coupon", isAuthenticated, verifyCouponCode);
router.get("/get-user-orders", isAuthenticated, getUserOrders);


export default router;