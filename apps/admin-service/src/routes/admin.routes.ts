import { isAdmin } from "@packages/middleware/authorizeRoles";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import { 
    addNewRole, 
    banUser, 
    unbanUser,
    getAllAdmins, 
    getAllBannedUsers,
    getAllCustomizations, 
    getAllEvents, 
    getAllProducts, 
    getAllSellers, 
    getAllUsers,
    uploadLogo,
    uploadBanner
} from "../controllers/admin.controller";

const router: Router = express.Router();

router.get("/get-all-products", isAuthenticated, isAdmin, getAllProducts);
router.get("/get-all-events", isAuthenticated, isAdmin, getAllEvents);
router.get("/get-all-admins", isAuthenticated, isAdmin, getAllAdmins);
router.get("/get-all", getAllCustomizations);
router.get("/get-all-users", isAuthenticated, isAdmin, getAllUsers);
router.get("/get-all-sellers", isAuthenticated, isAdmin, getAllSellers);
router.get("/get-all-banned-users", isAuthenticated, isAdmin, getAllBannedUsers);
router.put("/add-new-role", isAuthenticated, isAdmin, addNewRole);
router.put("/ban-user", isAuthenticated, isAdmin, banUser);
router.put("/unban-user", isAuthenticated, isAdmin, unbanUser);
router.post("/upload-logo", isAuthenticated, isAdmin, uploadLogo);
router.post("/upload-banner", isAuthenticated, isAdmin, uploadBanner);

export default router;