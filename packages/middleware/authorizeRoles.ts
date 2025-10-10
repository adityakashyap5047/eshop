import { NextFunction, Response } from "express"
import { AuthError } from "../error-handler";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
    if (req.role !== "seller") {
        throw new AuthError("Access denied! Sellers only.");
    }
    next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
    if (req.role !== "user") {
        throw new AuthError("Access denied! Users only.");
    }
    next();
};