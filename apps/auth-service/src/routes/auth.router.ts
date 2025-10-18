import express, { Router } from "express";
import { addUserAddress, createShop, createStripeConnectLink, deleteUserAddress, forgotPassword, getAdmin, getSeller, getUser, getUserAddresses, loginAdmin, loginSeller, loginUser, logOutAdmin, logOutUser, refreshToken, registerSeller, resetPassword, updateUserPassword, userRegisteration, verifySeller, verifyUser, verifyUserForgotPassword } from "../controller/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin, isSeller } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

// Register a new user
router.post("/user-registration", userRegisteration);

// Verify a user with otp
router.post("/verify-user", verifyUser);

//login user
router.post("/login-user", loginUser);

//refresh token
router.post("/refresh-token", refreshToken);

// Get logged in user details
router.get("/logged-in-user", isAuthenticated, getUser);

// Logout the user
router.get("/logout-user", isAuthenticated, logOutUser);

// Forgot password
router.post("/forgot-password-user", forgotPassword)

// Reset password
router.post("/reset-password-user", resetPassword)

// Change password
router.post("/change-password", isAuthenticated, updateUserPassword);

// Verify forgot password otp
router.post("/verify-forgot-password-user", verifyUserForgotPassword)

// Seller API routes
router.post("/seller-registration", registerSeller);

router.post("/verify-seller", verifySeller);

router.post("/create-shop", createShop);

router.post("/create-stripe-link", createStripeConnectLink);

router.post("/login-seller", loginSeller);

router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);

// Admin Service Routes
router.post("/login-admin", loginAdmin);
router.get("/logged-in-admin", isAuthenticated, isAdmin, getAdmin);
router.get("/logout-admin", isAuthenticated, isAdmin, logOutAdmin);

// User Service ---> Handling Address
router.post("/add-address", isAuthenticated, addUserAddress);
router.get("/shipping-addresses", isAuthenticated, getUserAddresses);
router.delete("/delete-address/:addressId", isAuthenticated, deleteUserAddress);

export default router;