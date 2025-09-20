import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
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

export const createProduct = async(req: any, res: Response, next: NextFunction) => {
    try {
        const {
            title,
            description,
            detailed_description,
            warranty,
            custom_specifications,
            slug,
            tags,
            cash_on_delivery,
            brand,
            video_url,
            category,
            colors = [],
            sizes = [],
            discountCodes,
            stock,
            sale_price,
            regular_price,
            subCategory,
            customProperties,
            images = [],
        } = req.body;

        if(
            !title ||
            !slug || 
            !description ||
            !category ||
            !subCategory ||
            !sale_price ||
            !images ||
            !tags ||
            !stock || 
            !regular_price
        ) {
            return next(new ValidationError("Please provide all the required fields!"));
        }

        if(!req.seller?.id) {
            return next(new AuthError("Only seller can create a products"));
        }

        if(!req.seller?.shop?.id) {
            return next(new AuthError("Seller must have a shop to create products"));
        }

        const isSlugExists = await prisma.products.findUnique({
            where: {
                slug
            }
        });
        if(isSlugExists) {
            return next(new ValidationError("Slug already exists please use a different slug!"));
        }
        
        const product = await prisma.products.create({
            data: {
                title,
                description,
                detailed_description,
                warranty,
                cashOnDelivery: cash_on_delivery,
                slug, 
                shopId: req?.seller?.shop?.id!,
                tags: Array.isArray(tags) ? tags : tags.split(','),
                brand,
                video_url: video_url,
                category,
                subCategory,
                colors: colors || [],
                discount_codes: discountCodes?.map((codeId: string) => codeId),
                sizes: sizes || [],
                stock: parseInt(stock),
                sale_price: parseFloat(sale_price),
                regular_price: parseFloat(regular_price),
                custom_properties: customProperties || {},
                custom_specifications: custom_specifications || {},
                images: {
                    create: images.filter((img: any) => img && img.fileId && img.file_url)?.map((image: any) => ({
                        file_id: image.fileId,
                        url: image.file_url,
                    }))
                }
            }
        });

        return res.status(201).json({ success: true, product });
    } catch (error) {
        return next(error);   
    }
}