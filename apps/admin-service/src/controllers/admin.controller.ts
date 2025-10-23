import prisma from "@packages/libs/prisma";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const generateStrongPassword = (): string => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
    
    for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

const sendPasswordEmail = async (email: string, password: string, role: string): Promise<boolean> => {
    try {
        const mailOptions = {
            from: `Admin Panel <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Welcome! Your ${role} Account has been Created`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Welcome to E-Shop </h2>
                    <p style="color: #555; font-size: 16px;">Hello,</p>
                    <p style="color: #555; font-size: 16px;">
                        Your account has been created successfully with <strong>${role}</strong> privileges.
                    </p>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Your Login Credentials:</h3>
                        <p style="color: #555; margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="color: #555; margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 5px 10px; border-radius: 3px; font-size: 14px;">${password}</code></p>
                    </div>
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="color: #856404; margin: 0; font-weight: bold;">Security Notice:</p>
                        <p style="color: #856404; margin: 5px 0 0 0;">
                            Please log in and change your password immediately for security reasons.
                        </p>
                    </div>
                    <p style="color: #555; font-size: 16px;">
                        If you have any questions, please contact the system administrator.
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This is an automated email. Please do not reply to this message.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

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

export const addNewRole = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {email, role} = req.body;
        console.log(`Processing role change request: email=${email}, role=${role}`);

        if (!email || !role) {
            return res.status(400).json({
                success: false,
                message: "Email and role are required"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        const validRoles = ["admin", "user"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Valid roles are: admin, user, moderator"
            });
        }

        let user = await prisma.users.findUnique({
            where: { email: email.toLowerCase().trim() }
        });
        let generatedPassword: string | null = null;
        let emailSent = false;
        let isNewUser = false;

        if (!user) {
            const role = "user";
            try {
                generatedPassword = generateStrongPassword();
                const hashedPassword = await bcrypt.hash(generatedPassword, 12);
                user = await prisma.users.create({
                    data: {
                        email: email.toLowerCase().trim(),
                        role: role,
                        password: hashedPassword,
                        name: email.split("@")[0],
                    }
                });
                
                isNewUser = true;
                emailSent = await sendPasswordEmail(email, generatedPassword, role);
                
                if (!emailSent) {
                    console.warn(`Failed to send email to ${email}, but user was created successfully`);
                }
            } catch (createError: any) {
                if (createError.code === 'P2002') {
                    console.log(`User ${email} was created by another request, fetching existing user`);
                    user = await prisma.users.findUnique({
                        where: { email: email.toLowerCase().trim() }
                    });
                    
                    if (!user) {
                        throw new Error(`User creation failed and user still doesn't exist: ${email}`);
                    }
                    
                    if (user.role === "admin" && user.isOwner === true) {
                        return res.status(400).json({
                            success: false,
                            message: "Cannot change role of the owner admin"
                        });
                    }
                    
                    user = await prisma.users.update({
                        where: { email: email.toLowerCase().trim() },
                        data: { role }
                    });
                } else {
                    throw createError;
                }
            }
        } else {
            if (user.role === "admin" && user.isOwner === true) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot change role of the owner admin"
                });
            }
            
            user = await prisma.users.update({
                where: { email: email.toLowerCase().trim() },
                data: { role }
            });
        }

        return res.status(201).json({
            success: true,
            message: isNewUser && generatedPassword 
                ? `User created successfully with role '${role}'. ${emailSent ? 'Password sent to email.' : 'Failed to send email - please contact user directly.'}`
                : `User role updated to '${role}' successfully.`,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                createdAt: user.createdAt
            },
            passwordGenerated: !!generatedPassword,
            emailSent: emailSent,
            isNewUser: isNewUser
        });
    } catch (error: any) {
        console.error("Error in addNewRole:", error);
        
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: "A user with this email already exists"
            });
        }
        
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: "User not found for update operation"
            });
        }
        
        if (error.message && error.message.includes('Invalid')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        
        return next(error);
    }
}

export const getAllCustomizations = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const config = await prisma.site_config.findFirst();

        return res.status(200).json({
            categories: config?.categories || [],
            subCategories: config?.subCategories || [],
            logo: config?.logo || null,
            banner: config?.banner || null,
        })
    } catch (error) {
        return next(error);
    }
}

export const getAllUsers = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [users, totalUsers] = await Promise.all([
            prisma.users.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                }
            }),
            prisma.users.count(),
        ]);

        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            success: true,
            data: users,
            meta: {
                totalUsers,
                currentPage: page,
                totalPages
            }
        })
    } catch (error) {
        next(error);
    }
}

export const getAllSellers = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [sellers, totalSellers] = await Promise.all([
            prisma.sellers.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    shop: {
                        select: {
                            name: true,
                            address: true,
                        }
                    }
                }
            }),
            prisma.sellers.count(),
        ]);

        const totalPages = Math.ceil(totalSellers / limit);

        res.status(200).json({
            success: true,
            data: sellers,
            meta: {
                totalSellers,
                currentPage: page,
                totalPages
            }
        })
    } catch (error) {
        next(error);
    }
}
