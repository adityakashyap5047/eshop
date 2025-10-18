import { Request, Response, NextFunction } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
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
            throw new ValidationError("User already exists with this email!");
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
            throw new ValidationError("All fields are required!");
        }

        const existingUser = await prisma.users.findUnique({where: { email }})

        if (existingUser) {
            throw new ValidationError("User already exists with this email!");
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
            throw new ValidationError("Email and Password are required!");
        }

        const user = await prisma.users.findUnique({where: { email }});

        if (!user) {
            throw new AuthError("User doesn't exist!");
        }

        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password!);

        if (!isMatch) {
            throw new AuthError("Invalid email or password!");
        }

        res.clearCookie("seller-refresh-token");
        res.clearCookie("seller-access-token");

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

// refresh token 
export const refreshToken = async(req: any, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies["refresh_token"] || req.cookies["seller-refresh-token"] || req.headers.authorization?.split(" ")[1];
        
        if (!refreshToken) {
            return new ValidationError("Unauthorized! No refresh token.");
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as { id: string; role: string };

        if (!decoded || !decoded.id || !decoded.role) {
            return new JsonWebTokenError("Forbidden! Invalid refresh token.");
        }

        let account;
        if (decoded.role === "user") {
            account = await prisma.users.findUnique({where: {id: decoded.id}});
        } else if (decoded.role === "seller") {
            account = await prisma.sellers.findUnique({
                where: {id: decoded.id},
                include: {shop: true}
            });
        }
        
        if (!account) {
            return new AuthError("Forbidden! User/Seller not found.");
        }

        const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' }
        );

        if (decoded.role === "user") {
            setCookie(res, "access_token", newAccessToken);
        }else if (decoded.role === "seller") {
            setCookie(res, "seller-access-token", newAccessToken);
        }

        req.role = decoded.role;

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

// logout user
export const logOutUser = async(req: any, res: Response) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(201).json({
        success: true
    })
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
            throw new ValidationError("Email and new password are required!");
        }

        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            throw new ValidationError("User not found!");
        }

        // compare new password with old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);
        if (isSamePassword) {
            throw new ValidationError("New password must be different from the old password!");
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

export const updateUserPassword = async(
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;
        const {currentPassword, newPassword, confirmPassword} = req.body;

        if(!currentPassword || !newPassword || !confirmPassword){
            throw new ValidationError("All fields are required");
        }

        if(newPassword !== confirmPassword){
            throw new ValidationError("New password and confirm password must be same");
        }

        if(currentPassword === newPassword){
            throw new ValidationError("New password must be different from current password");
        }

        const user = await prisma.users.findUnique({where: {id: userId}});

        if(!user || !user.password){
            throw new NotFoundError("User not found");
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

        if(!isPasswordCorrect){
            throw new ValidationError("Current password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.users.update({
            where: {id: userId},
            data: {password: hashedPassword}
        });

        res.status(200).json({message: "Password updated successfully!"});
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
            throw new ValidationError("All fields are required!");
        }

        const existingSeller = await prisma.sellers.findUnique({where: { email }})

        if (existingSeller) {
            throw new ValidationError("Seller already exists with this email!");
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
            throw new ValidationError("All fields are required!");
        }

        const shopData: any = {
            name,
            bio,
            address,
            opening_hours,
            category
        }

        if (website && website.trim() !== "") {
            shopData.website = website;
        }

        // Create the shop first
        const shop = await prisma.shops.create({
            data: shopData
        });

        // Then update the seller with the shopId
        await prisma.sellers.update({
            where: { id: sellerId },
            data: { shopId: shop.id }
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
            throw new ValidationError("Seller ID is required");
        }

        const seller = await prisma.sellers.findUnique({
            where: {id: sellerId},
        })

        if (!seller) {
            throw new ValidationError("Seller is not available with this ID");
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

// login seller
export const loginSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            throw new ValidationError("Email and Password are required!");
        }

        const seller = await prisma.sellers.findUnique({where: { email }});

        if (!seller) {
            throw new ValidationError("Seller doesn't exist!");
        }

        // Verify Password
        const isMatch = await bcrypt.compare(password, seller.password!);
        if (!isMatch) {
            throw new AuthError("Invalid email or password!");
        }

        res.clearCookie("refresh_token");
        res.clearCookie("access_token");

        // Generate access and refresh tokens
        const accessToken = jwt.sign({id: seller.id, role: "seller"},
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' }
        )

        const refreshToken = jwt.sign({id: seller.id, role: "seller"},
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '7d' }
        );

        //store the refresh and access token in an httpOnly secure cookie
        setCookie(res, "seller-refresh-token", refreshToken);
        setCookie(res, "seller-access-token", accessToken);

        res.status(200).json({
            message: "Login successful!",
            seller: {id: seller.id, email: seller.email, name: seller.name},
        });
    } catch (error) {
        return next(error);
    }
}

// get logged in seller details
export const getSeller = async(req: any, res: Response, next: NextFunction) => {
    try {
        const seller = req.seller;
        res.status(201).json({
            success: true,
            seller,
        })
    } catch (error) {
        next(error);
    }
}

// Login Admin
export const loginAdmin = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            throw new ValidationError("Email and Password are required");
        }

        const user = await prisma.users.findUnique({
            where: { email }
        });

        if(!user) return next(new AuthError("User's not found"));

        // verify password
        const isMatch = await bcrypt.compare(password, user.password!);
        if(!isMatch){
            throw new AuthError("Invalid email or password");
        }

        const isAdmin = user.role === "admin";

        if(!isAdmin){
            throw new AuthError("Unauthorized! Not an admin");
        }

        res.clearCookie("seller-access-token");
        res.clearCookie("seller-refresh-token");
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        const accessToken = jwt.sign(
            { id: user.id, role: "admin" },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id, role: "admin" },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '7d' }
        );

        setCookie(res, "refresh_token", refreshToken);
        setCookie(res, "access_token", accessToken);

        res.status(200).json({
            message: "Admin login successful",
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (error) {
        return next(error);
    }
}

export const getAdmin = async(req: any, res: Response, next: NextFunction) => {
    try {
        const admin = req.admin;
        res.status(201).json({
            success: true,
            admin,
        })
    } catch (error) {
        next(error);
    }
}

export const logOutAdmin = async(req: any, res: Response) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(201).json({
        success: true
    })
}

// User - Service 
// Add New Address
export const addUserAddress = async(req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const {label, name, street, city, zip, country, isDefault} = req.body;

        if(!label || !name || !street || !city || !zip || !country){
            throw new ValidationError("All fields are required");
        }

        if(isDefault){
            await prisma.address.updateMany({
                where: {
                    userId,
                    isDefault: true
                },
                data: {
                    isDefault: false
                }
            })
        }

        const newAddress = await prisma.address.create({
            data: {
                userId,
                label,
                name,
                street,
                city,
                zip,
                country,
                isDefault
            }
        });

        res.status(201).json({
            success: true,
            address: newAddress,
        });
    } catch (error) {
        return next(error);
    }
}

export const deleteUserAddress = async(req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const {addressId} = req.params;

        if(!addressId){
            throw new ValidationError("Address ID is required");
        }

        const existingAddress = await prisma.address.findFirst({
            where: {
                id: addressId,
                userId,
            }
        });

        if(!existingAddress){
            throw new NotFoundError("Address not found or unauthorized");
        }

        await prisma.address.delete({
            where: {
                id: addressId
            }
        });

        res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        })
    } catch (error) {
        return next(error);
    }
}

export const getUserAddresses = async(req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        const addresses = await prisma.address.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json({
            success: true,
            addresses
        })
    } catch (error) {
        return next(error);
    }
}