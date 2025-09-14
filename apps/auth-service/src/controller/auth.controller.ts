import { Request, Response, NextFunction } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil"
});

// Register a new user
export const userRegisteration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user");
        const {name, email} = req.body;
    
        const existingUser = await prisma.users.findUnique({where: { email }})
    
        if (existingUser) {
            return next(new ValidationError("User already exists with this email!"));
        }
    
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        await sendOtp(name, email, "user-activation-mail");
    
        res.status(200).json({
            message: "OTP sent to email. Please verify your account."
        })
    } catch (error) {
        return next(error);
    }
}

// Verify a user with otp
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, otp, password, name} = req.body;
        if (!email || !otp || !password || !name) {
            return next(new ValidationError("All fields are required!"));
        }

        const existingUser = await prisma.users.findUnique({where: { email }})

        if (existingUser) {
            return next(new ValidationError("User already exists with this email!"));
        }

        await verifyOtp(email, otp, next);

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })

        res.status(201).json({
            success: true,
            message: "User registered successfully!",
        })
    } catch (error) {
        return next(error);
    }
}

// Login a user
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return next(new ValidationError("Emai and Password are required!"));
        }

        const user = await prisma.users.findUnique({where: { email }});

        if (!user) {
            return next(new AuthError("User doesn't exist!"));
        }

        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password!);

        if (!isMatch) {
            return next(new AuthError("Invalid email or password!"));
        }

        // Generate access and refresh tokens
        const accessToken = jwt.sign({id: user.id, role: "user"},
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' }
        )
        
        const refreshToken = jwt.sign({id: user.id, role: "user"},
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '7d' }
        )

        //store the refresh and access token in an httpOnly secure cookie
        setCookie(res, "refresh_token", refreshToken);
        setCookie(res, "access_token", accessToken);

        res.status(200).json({
            message: "Login successful!",
            user: {id: user.id, email: user.email, name: user.name},
        });
    } catch (error) {
        return next(error);
    }
}

// refresh token user
export const refreshToken = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refresh_token;

        if (!refreshToken) {
            return new ValidationError("Unauthorized! No refresh token.");
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string 
        ) as {id: string; role: string}

        if (!decoded || !decoded.id || !decoded.role) {
            return new JsonWebTokenError("Forbidden! Invalid refresh token.");
        }

        // let account;
        // if (decoded.role === "user") {
        const user = await prisma.users.findUnique({where: {id: decoded.id}});

        if (!user) {
            return new AuthError("Forbidden! User/Seller not found.");
        }

        const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' }
        );

        setCookie(res, "access_token", newAccessToken);
        return res.status(201).json({success: true})
    } catch (error) {
        return next(error);
    }
}

// get logged in user details
export const getUser = async(req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        res.status(201).json({
            success: true,
            user,
        })
    } catch (error) {
        next(error);
    }
}

// user forgot password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgotPassword(req, res, next, "user");
}

// Verify forgot password otp
export const verifyUserForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await verifyForgotPasswordOtp(req, res, next);
} 

// Reset user password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return next(new ValidationError("Email and new password are required!"));
        }

        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            return next(new ValidationError("User not found!"));
        }

        // compare new password with old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);
        if (isSamePassword) {
            return next(new ValidationError("New password must be different from the old password!"));
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: { email },
            data: { password: hashedPassword }
        });

        res.status(200).json({ message: "Password reset successful!" });
    } catch (error) {
        next(error);
    }
}

// Register a new seller
export const registerSeller = async(req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "seller");
        const {name, email} = req.body;

        const existingSeller = await prisma.sellers.findUnique({where: { email }})

        if (existingSeller) {
            throw new ValidationError("Seller already exists with this email!");
        }

        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        await sendOtp(name, email, "seller-activation-mail");

        res.status(200).json({
            message: "OTP sent to email. Please verify your account."
        });
    } catch (error) {
        next(error);
    }
}

// Verify a seller with otp
export const verifySeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, otp, password, name, phone_number, country} = req.body;
        if (!email || !otp || !password || !name || !phone_number || !country) {
            return next(new ValidationError("All fields are required!"));
        }

        const existingSeller = await prisma.sellers.findUnique({where: { email }})

        if (existingSeller) {
            return next(new ValidationError("Seller already exists with this email!"));
        }

        await verifyOtp(email, otp, next);

        const hashedPassword = await bcrypt.hash(password, 10);

        const seller = await prisma.sellers.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone_number,
                country,
            }
        })

        res.status(201).json({
            seller,
            message: "Seller registered successfully!",
        })
    } catch (error) {
        next(error);
    }
}

// Create a new shop
export const createShop = async(req: any, res: Response, next: NextFunction) => {
    try {
        const {name, bio, address, opening_hours, website, category, sellerId} = req.body;

        if (!name || !bio || !address || !sellerId || !opening_hours || !category) {
            return next(new ValidationError("All fields are required!"));
        }

        const shopData: any = {
            name,
            bio,
            address,
            opening_hours,
            category,
            sellerId
        }

        if (website && website.trim() !== "") {
            shopData.website = website;
        }

        const shop = await prisma.shops.create({
            data: shopData
        });

        res.status(201).json({
            success: true,
            shop,
            message: "Shop created successfully!"
        });
    } catch (error) {
        next(error);
    }
}

// create stripe connect account link
export const createStripeConnectLink = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {sellerId} = req.body;

        if (!sellerId) {
            return next(new ValidationError("Seller ID is required"));
        }

        const seller = await prisma.sellers.findUnique({
            where: {id: sellerId},
        })

        if (!seller) {
            return next(new ValidationError("Seller is not available with this ID"));
        }

        const account = await stripe.accounts.create({
            type: "express",
            email: seller?.email,
            country: seller?.country || "IN",
            capabilities: {
                card_payments: {requested: true},
                transfers: {requested: true},
            }
        })

        await prisma.sellers.update({
            where: {id: sellerId},
            data: {stripeId: account.id}
        })

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `http://localhost:3000/success`,
            return_url: `http://localhost:3000/success`,
            type: "account_onboarding",
        })

        res.status(201).json({
            url: accountLink.url,
        });
    } catch (error) {
        next(error);
    }
}