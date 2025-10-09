import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
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
            throw new ValidationError('Discount code already available please use a different code!');
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
        return next(error);
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
            throw new NotFoundError('Discount code not found!');
        }

        if(discount_code.sellerId !== sellerId) {
            throw new ValidationError('Unauthorized access!');
        }

        await prisma.discount_codes.delete({
            where: {id}
        });

        return res.status(200).json({ success: true, message: 'Discount code deleted successfully!' });
    } catch (error) {
        return next(error);
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
            starting_date,
            ending_date,
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
            throw new ValidationError("Please provide all the required fields!");
        }

        if(!req.seller?.id) {
            throw new AuthError("Only seller can create a products");
        }

        if(!req.seller?.shop?.id) {
            throw new AuthError("Seller must have a shop to create products");
        }

        const isSlugExists = await prisma.products.findUnique({
            where: {
                slug
            }
        });
        if(isSlugExists) {
            throw new ValidationError("Slug already exists please use a different slug!");
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
                starting_date: starting_date || null,
                ending_date: ending_date || null,
                stock: parseInt(stock),
                sale_price: parseFloat(sale_price),
                regular_price: parseFloat(regular_price),
                totalSales: 0,
                custom_properties: customProperties || {},
                custom_specifications: custom_specifications || {},
                images: {
                    create: images.filter((img: any) => img && img.fileId && img.file_url)?.map((image: any) => ({
                        file_id: image.fileId,
                        url: image.file_url,
                    }))
                }
            },
            include: {
                images: true,
            }
        });

        return res.status(201).json({ success: true, product });
    } catch (error) {
        return next(error);   
    }
}

export const getShopProducts = async(req: any, res: Response, next: NextFunction) => {
    try {
        const products = await prisma.products.findMany({
            where: {
                shopId: req?.seller?.shop?.id
            }, 
            include: {
                images: true,
            }
        });

        return res.status(200).json({ success: true, products });
    } catch (error) {
        return next(error);
    }
}

export const deleteProduct = async(req: any, res: Response, next: NextFunction) => {
    try {
        const {productId} = req.params;

        const shopId = req.seller?.shop?.id;

        const product = await prisma.products.findUnique({
            where: {id: productId},
            select: {id: true, shopId: true, isDeleted: true}
        });

        if (!product) {
            throw new ValidationError("Product not found");
        }

        if (product.shopId !== shopId) {
            throw new AuthError("Unauthorized action");
        }

        if(product.isDeleted) {
            return res.status(400).json({message: "Product is already deleted"});
        }

        const deletedProduct = await prisma.products.update({
            where: {id: productId},
            data: {isDeleted: true, deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000)}
        })

        return res.status(200).json({success: true, message: "Product moved to deleted state. It will be permanently deleted after 24 hours unless restored.", deletedAt: deletedProduct.deletedAt});
    } catch (error) {
        return next(error);
    }
}

export const restoreProduct = async(req: any, res: Response, next: NextFunction) => {
    try {
        const {productId} = req.params;

        const shopId = req.seller?.shop?.id;

        const product = await prisma.products.findUnique({
            where: {id: productId},
            select: {id: true, shopId: true, isDeleted: true}
        });

        if (!product) {
            throw new ValidationError("Product not found");
        }

        if (product.shopId !== shopId) {
            throw new AuthError("Unauthorized action");
        }

        if(!product.isDeleted) {
            return res.status(400).json({message: "Product is not in deleted state"});
        }

        await prisma.products.update({
            where: {id: productId},
            data: {isDeleted: false, deletedAt: null}
        })

        return res.status(200).json({success: true, message: "Product restored successfully."});
    } catch (error) {
        return next(error);
    }
}

export const getAllProudcts = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const type = req.query.type;
        const baseFilter = {
            OR: [
                { starting_date: { equals: null } },
                { ending_date: { equals: null } }
            ]
        }
    
        const orderBy: Prisma.productsOrderByWithRelationInput = type === "latest" ? { createdAt: 'desc' as Prisma.SortOrder } : { totalSales: 'desc' as Prisma.SortOrder }

        const [products, total, top10Products] = await Promise.all([
            prisma.products.findMany({
                skip,
                take: limit,
                include: {
                    images: true,
                    Shop: true
                },
                where: baseFilter,
                orderBy,
            }),
            prisma.products.count({where: baseFilter}),
            prisma.products.findMany({
                take: 10,
                where: baseFilter,
                orderBy,
            })
        ]);

        res.status(200).json({
            products,
            top10By: type === "latest" ? "latest" : "topSales",
            top10Products,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });


    } catch (error) {
        next(error);
    }
    
}

export const getAllEvents = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
    
        const baseFilter = {
            AND: [
                { starting_date: { not: null } },
                { ending_date: { not: null } }
            ]
        }

        const [events, total, top10BySales] = await Promise.all([
            prisma.products.findMany({
                skip,
                take: limit,
                include: {
                    images: true,
                    Shop: true
                },
                where: baseFilter,
                orderBy: {
                    totalSales: 'desc'
                },
            }),
            prisma.products.count({where: baseFilter}),
            prisma.products.findMany({
                take: 10,
                where: baseFilter,
                orderBy: {
                    totalSales: 'desc'
                },
            })
        ]);

        res.status(200).json({
            events,
            top10BySales,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });


    } catch (error) {
        next(error);
    }
    
}

export const getProductDetails = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await prisma.products.findUnique({
            where: { slug: req.params.slug! },
            include: {
                images: true,
                Shop: true
            }
        });

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        return next(error);
    }
}

export const getFilteredProducts = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            priceRange = [0, 10000],
            categories = [],
            colors = [],
            sizes = [],
            page = 1,
            limit = 12,
        } = req.query;

        const parsedPriceRange = typeof priceRange === 'string' ? priceRange.split(',').map(Number) : [0, 10000];
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const skip = (parsedPage - 1) * parsedLimit;

        const filters: Record<string, any> = {
            sale_price: {
                gte: parsedPriceRange[0],
                lte: parsedPriceRange[1],
            },
            starting_date: null,
        };

        if (categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories) 
                    ? categories
                    : (categories as string).split(',')
            };
        }

        if(sizes && (sizes as string[]).length > 0) {
            filters.sizes = {
                hasSome: Array.isArray(sizes) ? sizes : [sizes],
            }
        };

        if(colors && (colors as string[]).length > 0) {
            filters.colors = {
                hasSome: Array.isArray(colors) ? colors : [colors],
            }
        }

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: filters,
                skip,
                take: parsedLimit,
                include: {
                    images: true,
                    Shop: true,
                },
            }),
            prisma.products.count({ where: filters })
        ])

        const totalPages = Math.ceil(total / parsedLimit);

        return res.status(200).json({
            products,
            pagination: {
                total,
                page: parsedPage,
                totalPages,
            }
        });
    } catch (error) {
        return next(error);
    }
}

export const getFilteredEvents = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            priceRange = [0, 10000],
            categories = [],
            colors = [],
            sizes = [],
            page = 1,
            limit = 12,
        } = req.query;

        const parsedPriceRange = typeof priceRange === 'string' ? priceRange.split(',').map(Number) : [0, 10000];
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const skip = (parsedPage - 1) * parsedLimit;

        const filters: Record<string, any> = {
            sale_price: {
                gte: parsedPriceRange[0],
                lte: parsedPriceRange[1],
            },
            NOT: {
                starting_date: null,
            }
        };

        if (categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories) 
                    ? categories
                    : (categories as string).split(',')
            };
        }

        if(sizes && (sizes as string[]).length > 0) {
            filters.sizes = {
                hasSome: Array.isArray(sizes) ? sizes : [sizes],
            }
        };

        if(colors && (colors as string[]).length > 0) {
            filters.colors = {
                hasSome: Array.isArray(colors) ? colors : [colors],
            }
        }

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: filters,
                skip,
                take: parsedLimit,
                include: {
                    images: true,
                    Shop: true,
                },
            }),
            prisma.products.count({ where: filters })
        ])

        const totalPages = Math.ceil(total / parsedLimit);

        return res.status(200).json({
            products,
            pagination: {
                total,
                page: parsedPage,
                totalPages,
            }
        });
    } catch (error) {
        return next(error);
    }
}

export const getFilteredShops = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            categories = [],
            countries = [],
            page = 1,
            limit = 12,
        } = req.query;

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const skip = (parsedPage - 1) * parsedLimit;

        const filters: Record<string, any> = {};

        if (categories && (categories as string[]).length > 0) {
            filters.category = {
                in: Array.isArray(categories) 
                    ? categories
                    : String(categories).split(',')
            };
        }
        
        if(countries && (countries as string[]).length > 0){
            filters.sellers = {
                some: {
                    country: {
                        in: Array.isArray(countries) ? countries : String(countries).split(','),
                    }
                }
            }
        }

        const [shops, total] = await Promise.all([
            prisma.shops.findMany({
                where: filters,
                skip,
                take: parsedLimit,
                include: {
                    sellers: true,
                    products: true,
                    followers: true,
                },
            }),
            prisma.shops.count({ where: filters })
        ])

        const totalPages = Math.ceil(total / parsedLimit);

        return res.status(200).json({
            shops,
            pagination: {
                total,
                page: parsedPage,
                totalPages,
            }
        });
    } catch (error) {
        return next(error);
    }
}

export const searchProducts = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const query = req.query.q as string;

        if(!query || query.trim().length === 0) {
            return res.status(400).json({error: "Search query is required" });
        };

        const products = await prisma.products.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { tags: { has: query } },
                ]
            },
            select: {
                id: true,
                title: true,
                slug: true,
            }, 
            take: 10,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({ products });
    } catch (error) {
        return next(error);
    }
}

export const topShops = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Aggregate total sales pr shop from orders
        const topShopData = await prisma.orders.groupBy({
            by: ['shopId'],
            _sum: {
                total: true,
            },
            orderBy: {
                _sum: {
                    total: 'desc'
                }
            },
            take: 10,
        });

        const shopIds = topShopData.map((item: any) => item.shopId);
        const shops = await prisma.shops.findMany({
            where: {
                id: {
                    in: shopIds
                }
            },
            select: {
                id: true,
                name: true,
                // avatar: true,
                coverBanner: true,
                address: true,
                ratings: true,
                followers: true,
                category: true,
            },
        });

        // // Merge sales with shop data
        const enrichedShops = shops.map((shop) => {
            const salesData = topShopData.find((s: any) => s.shopId === shop.id);
            return {
                ...shop,
                totalSales: salesData ? salesData._sum.total : 0
            }
        })

        const top10Shops = enrichedShops.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0)).slice(0, 10);
        
        return res.status(200).json({ shops: top10Shops });
    } catch (error) {
        return next(error);
    }
}