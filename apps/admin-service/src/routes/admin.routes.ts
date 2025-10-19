import { isAdmin } from "@packages/middleware/authorizeRoles";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import { getAllEvents, getAllProducts } from "../controllers/admin.controller";

const router: Router = express.Router();

router.get("/get-all-products", isAuthenticated, isAdmin, getAllProducts);
router.get("/get-all-events", isAuthenticated, isAdmin, getAllEvents);

export default router;