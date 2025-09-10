import express, { Router } from "express";
import { userRegisteration, verifyUser } from "../controller/auth.controller";

const router: Router = express.Router();

// Register a new user
router.post("/user-registration", userRegisteration);

// Verify a user with otp
router.post("/verify-user", verifyUser);

export default router;