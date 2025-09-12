import express, { Router } from "express";
import { forgotPassword, getUser, loginUser, refreshToken, resetPassword, userRegisteration, verifyUser, verifyUserForgotPassword } from "../controller/auth.controller";
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

export default router;