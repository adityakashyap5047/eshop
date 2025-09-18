import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";


// Get the product categories
export const getCategories = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const config = await prisma.site_config.findFirst();

        if(!config) {
            return res.status(404).json({ error: 'Categories not found' });
        }

        return res.status(200).json({
            categories: config.categories,
            subCategories: config.subCategories
        });
    } catch (error) {
        return next(error);
    }
}

// Create Discount Codes
export const createDiscountCode = async(req: any, res: Response, next: NextFunction) => {
    try {
        const { public_name, discountType, discountValue, discountCode } = req.body;

        const isDiscountCodeExists = await prisma.discount_code.findUnique({
            where: {
                code: discountCode
            }
        });

        if (isDiscountCodeExists) {
            return next(new ValidationError('Discount code already available please use a different code!'));
        }

        const discount_code = await prisma.discount_code.create({
            data: {
                public_name,
                discountType,
                discountValue: parseFloat(discountValue),
                discountCode,
                sellerId: req.seller.id,
            }
        });

        return res.status(201).json({ success: true, discount_code });
    } catch (error) {
        next(error);
    }
}

