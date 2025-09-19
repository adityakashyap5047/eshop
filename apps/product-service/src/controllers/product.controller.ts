import { NotFoundError, ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
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

        const isDiscountCodeExists = await prisma.discount_codes.findUnique({
            where: {
                discountCode
            }
        });

        if (isDiscountCodeExists) {
            return next(new ValidationError('Discount code already available please use a different code!'));
        }

        const discount_code = await prisma.discount_codes.create({
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

export const getDiscountCodes = async(req: any, res: Response, next: NextFunction) => {
    try {
        const discount_codes = await prisma.discount_codes.findMany({
            where: {
                sellerId: req.seller.id,
            }
        });

        return res.status(200).json({ success: true, discount_codes });
    } catch (error) {
        return next(error);
    }
}

export const deleteDiscountCode = async(req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sellerId = req.seller?.id;

        const discount_code = await prisma.discount_codes.findUnique({
            where: {id},
            select: {id: true, sellerId: true}
        });

        if(!discount_code) {
            return next(new NotFoundError('Discount code not found!'));
        }

        if(discount_code.sellerId !== sellerId) {
            return next(new ValidationError('Unauthorized access!'));
        }

        await prisma.discount_codes.delete({
            where: {id}
        });

        return res.status(200).json({ success: true, message: 'Discount code deleted successfully!' });
    } catch (error) {
        next(error);
    }
}

export const uploadProductImages = async(req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.fileName) {
            return res.status(400).json({ error: 'No fileName provided' });
        }

        const fileData = req.body.fileName;
        const fileName = `product-${Date.now()}.jpg`;

        const response = await imagekit.upload({
            file: fileData,
            fileName: fileName,
            folder: "/Eshop/Product/",            
        });

        return res.status(201).json({ 
            file_url: response.url,
            fileId: response.fileId
         });
    } catch (error) {
        console.error('Upload error:', error);
        return next(error);
    }
}

export const deleteProductImage = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.body;

        const response = await imagekit.deleteFile(fileId);

        return res.status(201).json({
            success: true,
            response
        })
    } catch (error) {
        return next(error);
    }
}