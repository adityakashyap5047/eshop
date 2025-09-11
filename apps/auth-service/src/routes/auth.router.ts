import express, { Router } from "express";
import { loginUser, userRegisteration, verifyUser } from "../controller/auth.controller";

const router: Router = express.Router();

// Register a new user
router.post("/user-registration", userRegisteration);

// Verify a user with otp
router.post("/verify-user", verifyUser);

//login user
router.post("/login-user", loginUser);

export default router;