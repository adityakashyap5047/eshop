import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis";
import { sendEmail } from "./sendMail";
import { Request, Response, NextFunction } from "express";
import prisma from "@packages/libs/prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {

    const {name, email, password, phone_number, country} = data;

    if(
        !name || !email || !password || (userType === "seller" && (!phone_number || !country))
    ){
        throw new ValidationError(`Missing required fields!`)
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError(`Invalid email format!`)
    }
}

export const checkOtpRestrictions = async(email: string, next: NextFunction) => {
    if(await redis.get(`otp_lock:${email}`)){
        return next(new ValidationError("Account locked due to multiple failed OTP attempts. Please try again after 30 minutes."));
    }

    if (await redis.get(`otp_spam_lock:${email}`)) {
        return next(new ValidationError("Too many OTP requests. Please wait 1 hour before trying again."));
    }

    if (await redis.get(`otp_cooldown:${email}`)) {
        return next(new ValidationError("Please wait 1 minute before requesting a new OTP."));
    }
}

export const trackOtpRequests = async(email: string, next: NextFunction) => {
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600);
        return next(new ValidationError("Too many OTP requests. Please wait 1 hour before trying again."));
    }

    await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600);    // Track OTP requests for 1 hour
}

export const sendOtp = async(name: string, email: string, template: string) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "Verify Your Email", template, {name, otp});
    await redis.set(`otp:${email}`, otp, "EX", 300);
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
}

export const verifyOtp = async(email: string, otp: string, next: NextFunction) => {
    const storedOtp = await redis.get(`otp:${email}`);

    if(!storedOtp){
        throw new ValidationError("OTP expired or not found. Please request a new one.");
    }

    const failedAttemptsKey = `otp_attempts:${email}`;

    const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

    if (storedOtp !== otp) {
        if (failedAttempts >= 2) {
            await redis.set(`otp_lock:${email}`, "locked", "EX", 1800);
            await redis.del(`otp:${email}`, failedAttemptsKey);
            throw new ValidationError("Account locked due to multiple failed OTP attempts. Please try again after 30 minutes.");
        }
        await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
        throw new ValidationError(`Incorrect OTP. You have ${2 - failedAttempts} attempts left.`);
    }

    await redis.del(`otp:${email}`, failedAttemptsKey);
}

export const handleForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
    userType: "user" | "seller"
) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(new ValidationError("Email is required!"));
        }

        // find user/seller in db
        const user = userType === "user" && await prisma.users.findUnique({ where: { email } });

        if (!user) {
            throw new ValidationError(`${userType} not found!`);
        }

        //check otp restrictions
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);

        //Generate and send otp
        await sendOtp(email, user.name, "forgot-password-user-mail");
        res.status(200).json({message: "OTP sent to email. Please verify to reset your password."})
    } catch (error) {
        next(error);
    }
}

export const verifyForgotPasswordOtp = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            throw new ValidationError("Email and OTP are required!");
        }

        await verifyOtp(email, otp, next);

        res.status(200).json({ message: "OTP verified. You can now reset your password." });
    } catch (error) {
        next(error);
    }
}