import express, { Router } from 'express';
import { createDiscountCode, createProduct, deleteDiscountCode, deleteProductImage, getCategories, getDiscountCodes, getShopProducts, uploadProductImages } from '../controllers/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';

const router: Router = express.Router();

router.get("/get-categories", getCategories);

router.post("/create-discount-code", isAuthenticated, createDiscountCode);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);

router.post("/upload-product-image", isAuthenticated, uploadProductImages);
router.delete("/delete-product-image", isAuthenticated, deleteProductImage);

router.post("/create-product", isAuthenticated, createProduct);
router.get("/get-shop-products", isAuthenticated, getShopProducts);

export default router;