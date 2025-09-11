import express, { Router } from "express";
import { forgotPassword, loginUser, resetPassword, userRegisteration, verifyUser, verifyUserForgotPassword } from "../controller/auth.controller";

const router: Router = express.Router();

// Register a new user
router.post("/user-registration", userRegisteration);

// Verify a user with otp
router.post("/verify-user", verifyUser);

//login user
router.post("/login-user", loginUser);

// Forgot password
router.post("/forgot-password-user", forgotPassword)

// Reset password
router.post("/reset-password-user", resetPassword)

// Verify forgot password otp
router.post("/verify-forgot-password-user", verifyUserForgotPassword)

export default router;