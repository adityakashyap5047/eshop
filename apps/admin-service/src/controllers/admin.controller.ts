import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { Request, Response, NextFunction } from "express";

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            prisma.products.findMany({
                where: {
                    starting_date: null,
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    sale_price: true,
                    stock: true,
                    createdAt: true,
                    ratings: true,
                    category: true,
                    images: {
                        select: {
                            url: true,
                        },
                        take: 1,
                    },
                    Shop: {
                        select: {name: true},
                    }
                }
            }),
            prisma.products.count({
                where: {
                    starting_date: null,
                }
            }),
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            success: true,
            data: products,
            meta: {
                totalProducts,
                currentPage: page,
                totalPages,
            }
        });
        
    } catch (error) {
        return next(error);
    }
}

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            prisma.products.findMany({
                where: {
                    AND: [
                        { starting_date: { not: null } },
                        { ending_date: { not: null } }
                    ]
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    sale_price: true,
                    stock: true,
                    createdAt: true,
                    starting_date: true,
                    ending_date: true,
                    ratings: true,
                    category: true,
                    images: {
                        select: {
                            url: true,
                        },
                        take: 1,
                    },
                    Shop: {
                        select: {name: true},
                    }
                }
            }),
            prisma.products.count({
                where: {
                    AND: [
                        { starting_date: { not: null } },
                        { ending_date: { not: null } }
                    ]
                }
            }),
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            success: true,
            data: products,
            meta: {
                totalProducts,
                currentPage: page,
                totalPages,
            }
        });
        
    } catch (error) {
        return next(error);
    }
}

export const getAllAdmins = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const admins = await prisma.users.findMany({
            where: {role: "admin"}
        })

        res.status(200).json({
            success: true,
            admins
        });
    } catch (error) {
        next(error)
    }
}

export const addNewAdmin = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {email, role} = req.body;

        const isUser = await prisma.users.findUnique({where: {email}});
        if(!isUser) {
            throw new ValidationError("Unauthorized");
        }

        const newAdmin = await prisma.users.update({
            where: { email },
            data: {
                role,
            }
        });

        res.status(201).json({
            success: true,
            newAdmin
        });
    } catch (error) {
        next(error);
    }
}

