import express, { Router } from "express";
import { createShop, forgotPassword, getUser, loginUser, refreshToken, registerSeller, resetPassword, userRegisteration, verifySeller, verifyUser, verifyUserForgotPassword } from "../controller/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

// Register a new user
router.post("/user-registration", userRegisteration);

// Verify a user with otp
router.post("/verify-user", verifyUser);

//login user
router.post("/login-user", loginUser);

//refresh token user
router.post("/refresh-token-user", refreshToken);

// Get logged in user details
router.get("/logged-in-user", isAuthenticated, getUser);

// Forgot password
router.post("/forgot-password-user", forgotPassword)

// Reset password
router.post("/reset-password-user", resetPassword)

// Verify forgot password otp
router.post("/verify-forgot-password-user", verifyUserForgotPassword)

// Seller API routes
router.post("/seller-registration", registerSeller);

router.post("/verify-seller", verifySeller);

router.post("/create-shop", createShop);

export default router;