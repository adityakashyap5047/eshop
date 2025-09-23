import express, { Router } from 'express';
import { createDiscountCode, createProduct, deleteDiscountCode, deleteProduct, deleteProductImage, getAllProudcts, getCategories, getDiscountCodes, getProductDetails, getShopProducts, restoreProduct, uploadProductImages } from '../controllers/product.controller';
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

router.delete("/delete-product/:productId", isAuthenticated, deleteProduct);
router.put("/restore-product/:productId", isAuthenticated, restoreProduct);

router.get("/get-all-products", getAllProudcts);
router.get("/get-product/:slug", getProductDetails);

export default router;