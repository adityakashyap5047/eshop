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

const sendBanEmail = async (email: string, userName: string, reason?: string): Promise<boolean> => {
    try {
        const mailOptions = {
            from: `Admin Panel <${process.env.SMTP_USER}>`,
            to: `${email}`,
            subject: `Account Suspended - E-Shop`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #d32f2f; text-align: center;">Account Suspended</h2>
                    <p style="color: #555; font-size: 16px;">Hello ${userName},</p>
                    <p style="color: #555; font-size: 16px;">
                        We regret to inform you that your account has been suspended by our administration team.
                    </p>
                    ${reason ? `
                    <div style="background-color: #ffebee; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #d32f2f;">
                        <h3 style="color: #d32f2f; margin-top: 0;">Reason for Suspension:</h3>
                        <p style="color: #555; margin: 10px 0;">${reason}</p>
                    </div>
                    ` : ''}
                    <p style="color: #555; font-size: 16px;">
                        If you believe this action was taken in error or would like to appeal this decision, 
                        please contact our support team at <a href="mailto:${process.env.SMTP_USER}">${process.env.SMTP_USER}</a>.
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This is an automated message from E-Shop Admin Panel. Please do not reply to this email.
                    </p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
};

const sendUnbanEmail = async (email: string, userName: string): Promise<boolean> => {
    try {
        const mailOptions = {
            from: `Admin Panel <${process.env.SMTP_USER}>`,
            to: `${email}`,
            subject: `Account Restored - E-Shop`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #388e3c; text-align: center;">Account Restored</h2>
                    <p style="color: #555; font-size: 16px;">Hello ${userName},</p>
                    <p style="color: #555; font-size: 16px;">
                        Good news! Your account has been restored and you now have full access to E-Shop.
                    </p>
                    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #388e3c;">
                        <h3 style="color: #388e3c; margin-top: 0;">You can now:</h3>
                        <ul style="color: #555;">
                            <li>Log in to your account</li>
                            <li>Access all platform features</li>
                            <li>Continue your activities on E-Shop</li>
                        </ul>
                    </div>
                    <p style="color: #555; font-size: 16px;">
                        We appreciate your understanding and look forward to seeing you back on the platform.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" 
                           style="background-color: #388e3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Login to Your Account
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This is an automated message from E-Shop Admin Panel. Please do not reply to this email.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error(`Failed to send unban email to ${email}:`, error);
        return false;
    }
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

export const banUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, reason } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
        
        const user = await prisma.users.findUnique({
            where: { id: userId }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        if (user.isOwner) {
            return res.status(403).json({
                success: false,
                message: "Cannot ban the owner admin"
            });
        }
        
        const existingBan = await prisma.banned.findUnique({
            where: { email: user.email }
        });
        
        if (existingBan) {
            return res.status(400).json({
                success: false,
                message: "User is already banned"
            });
        }
        
        try {
            const result = await prisma.$transaction(async (tx) => {
                const bannedUser = await tx.banned.create({
                    data: {
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        password: user.password,
                        following: user.following,
                        createdAt: user.createdAt,
                        updatedAt: new Date()
                    }
                });

                // Migrate all related orders to the banned user
                await tx.orders.updateMany({
                    where: { userId: userId },
                    data: { 
                        userId: bannedUser.id,
                        bannedId: bannedUser.id 
                    }
                });

                // Migrate all reviews to the banned user
                await tx.shopReviews.updateMany({
                    where: { userId: userId },
                    data: { 
                        userId: bannedUser.id,
                        bannedId: bannedUser.id 
                    }
                });

                // Migrate all follower relationships
                await tx.followers.updateMany({
                    where: { userId: userId },
                    data: { 
                        userId: bannedUser.id,
                        bannedId: bannedUser.id 
                    }
                });

                // Now safe to delete the user after all relations are migrated
                await tx.users.delete({
                    where: { id: userId }
                });

                return bannedUser;
            }, { timeout: 20000, maxWait: 10000 });

            const emailSent = await sendBanEmail(user.email, user.name, reason);
            
            return res.status(200).json({
                success: true,
                message: `User ${user.email} has been banned successfully`,
                bannedUser: {
                    id: result.id,
                    email: result.email,
                    name: result.name,
                    role: result.role,
                    bannedAt: result.updatedAt
                },
                reason: reason || "No reason provided",
                emailSent: emailSent
            });
        } catch (txError: any) {
            console.error("Transaction error in banUser:", txError);

            // If transaction timed out (P2028), fall back to a safer non-transactional approach
            if (txError?.code === 'P2028') {
                try {
                    // Create banned user (handle unique constraint)
                    let bannedUser;
                    try {
                        bannedUser = await prisma.banned.create({
                            data: {
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                password: user.password,
                                following: user.following,
                                createdAt: user.createdAt,
                                updatedAt: new Date()
                            }
                        });
                    } catch (createErr: any) {
                        if (createErr.code === 'P2002') {
                            // already exists in banned collection
                            bannedUser = await prisma.banned.findUnique({ where: { email: user.email } });
                        } else {
                            throw createErr;
                        }
                    }

                    // Migrate all related data to banned user
                    if (bannedUser) {
                        // Migrate orders
                        await prisma.orders.updateMany({
                            where: { userId: userId },
                            data: { 
                                userId: bannedUser.id,
                                bannedId: bannedUser.id 
                            }
                        });

                        // Migrate reviews
                        await prisma.shopReviews.updateMany({
                            where: { userId: userId },
                            data: { 
                                userId: bannedUser.id,
                                bannedId: bannedUser.id 
                            }
                        });

                        // Migrate followers
                        await prisma.followers.updateMany({
                            where: { userId: userId },
                            data: { 
                                userId: bannedUser.id,
                                bannedId: bannedUser.id 
                            }
                        });
                    }

                    // Delete original user if still exists
                    try {
                        await prisma.users.delete({ where: { id: userId } });
                    } catch (delErr: any) {
                        // If user was already deleted by another process, ignore
                        if (delErr.code !== 'P2025') {
                            throw delErr;
                        }
                    }

                    const emailSent = await sendBanEmail(user.email, user.name, reason);

                    return res.status(200).json({
                        success: true,
                        message: `User ${user.email} has been banned successfully (fallback)`,
                        bannedUser: {
                            id: bannedUser?.id,
                            email: bannedUser?.email,
                            name: bannedUser?.name,
                            role: bannedUser?.role,
                            bannedAt: bannedUser?.updatedAt
                        },
                        reason: reason || "No reason provided",
                        emailSent: emailSent,
                        note: "Operation completed using fallback (non-transactional) path due to transaction timeout"
                    });
                } catch (fallbackErr) {
                    console.error("Fallback banUser error:", fallbackErr);
                    return res.status(500).json({
                        success: false,
                        message: "Failed to ban user due to transaction timeout and fallback failure"
                    });
                }
            }

            throw txError; // rethrow other transaction errors to be handled by outer catch
        }
        
        
    } catch (error: any) {
        console.error("Error in banUser:", error);
        
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: "User is already banned"
            });
        }
        
        return next(error);
    }
};

export const unbanUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.body;
        
        // Input validation
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
                
        // Find the banned user
        const bannedUser = await prisma.banned.findUnique({
            where: { id: userId }
        });
        
        if (!bannedUser) {
            return res.status(404).json({
                success: false,
                message: "Banned user not found"
            });
        }
        
        // Check if user already exists in users collection
        const existingUser = await prisma.users.findUnique({
            where: { email: bannedUser.email }
        });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already active"
            });
        }
        
        // Use an interactive transaction with extended timeout, with a fallback on timeout
        try {
            const result = await prisma.$transaction(async (tx) => {
                // Move banned user back to users collection
                const restoredUser = await tx.users.create({
                    data: {
                        name: bannedUser.name,
                        email: bannedUser.email,
                        role: bannedUser.role,
                        isOwner: false, // Reset owner status for security
                        password: bannedUser.password,
                        following: bannedUser.following,
                        createdAt: bannedUser.createdAt,
                        updatedAt: new Date()
                    }
                });

                // Migrate all related orders back to the restored user
                await tx.orders.updateMany({
                    where: { bannedId: userId },
                    data: { 
                        userId: restoredUser.id,
                        bannedId: null 
                    }
                });

                // Migrate all reviews back to the restored user
                await tx.shopReviews.updateMany({
                    where: { bannedId: userId },
                    data: { 
                        userId: restoredUser.id,
                        bannedId: null 
                    }
                });

                // Migrate all follower relationships back
                await tx.followers.updateMany({
                    where: { bannedId: userId },
                    data: { 
                        userId: restoredUser.id,
                        bannedId: null 
                    }
                });

                // Remove user from banned collection
                await tx.banned.delete({
                    where: { id: userId }
                });

                return restoredUser;
            }, { timeout: 20000, maxWait: 10000 });
            
            // Send unban notification email
            const emailSent = await sendUnbanEmail(bannedUser.email, bannedUser.name);

            return res.status(200).json({
                success: true,
                message: `User ${bannedUser.email} has been unbanned successfully`,
                restoredUser: {
                    id: result.id,
                    email: result.email,
                    name: result.name,
                    role: result.role,
                    unbannedAt: result.updatedAt
                },
                emailSent: emailSent
            });
        } catch (txError: any) {
            console.error("Transaction error in unbanUser:", txError);

            if (txError?.code === 'P2028') {
                // fallback: create user then delete from banned
                try {
                    let restoredUser;
                    try {
                        restoredUser = await prisma.users.create({
                            data: {
                                name: bannedUser.name,
                                email: bannedUser.email,
                                role: bannedUser.role,
                                isOwner: false,
                                password: bannedUser.password,
                                following: bannedUser.following,
                                createdAt: bannedUser.createdAt,
                                updatedAt: new Date()
                            }
                        });
                    } catch (createErr: any) {
                        if (createErr.code === 'P2002') {
                            // already exists in users collection
                            restoredUser = await prisma.users.findUnique({ where: { email: bannedUser.email } });
                        } else {
                            throw createErr;
                        }
                    }

                    // Migrate all related data back to restored user
                    if (restoredUser) {
                        // Migrate orders back
                        await prisma.orders.updateMany({
                            where: { bannedId: userId },
                            data: { 
                                userId: restoredUser.id,
                                bannedId: null 
                            }
                        });

                        // Migrate reviews back
                        await prisma.shopReviews.updateMany({
                            where: { bannedId: userId },
                            data: { 
                                userId: restoredUser.id,
                                bannedId: null 
                            }
                        });

                        // Migrate followers back
                        await prisma.followers.updateMany({
                            where: { bannedId: userId },
                            data: { 
                                userId: restoredUser.id,
                                bannedId: null 
                            }
                        });
                    }

                    // Delete from banned collection if still exists
                    try {
                        await prisma.banned.delete({ where: { id: userId } });
                    } catch (delErr: any) {
                        if (delErr.code !== 'P2025') {
                            throw delErr;
                        }
                    }

                    // Send unban notification email
                    const emailSent = await sendUnbanEmail(bannedUser.email, bannedUser.name);

                    return res.status(200).json({
                        success: true,
                        message: `User ${bannedUser.email} has been unbanned successfully (fallback)`,
                        restoredUser: {
                            id: restoredUser?.id,
                            email: restoredUser?.email,
                            name: restoredUser?.name,
                            role: restoredUser?.role,
                            unbannedAt: restoredUser?.updatedAt
                        },
                        emailSent: emailSent,
                        note: "Operation completed using fallback (non-transactional) path due to transaction timeout"
                    });
                } catch (fallbackErr) {
                    console.error("Fallback unbanUser error:", fallbackErr);
                    return res.status(500).json({
                        success: false,
                        message: "Failed to unban user due to transaction timeout and fallback failure"
                    });
                }
            }

            throw txError;
        }
        
    } catch (error: any) {
        console.error("Error in unbanUser:", error);
        
        // Handle specific Prisma errors
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: "Banned user not found"
            });
        }
        
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: "User is already active"
            });
        }
        
        return next(error);
    }
};

export const getAllBannedUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [bannedUsers, totalBannedUsers] = await Promise.all([
            prisma.banned.findMany({
                skip,
                take: limit,
                orderBy: { updatedAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            }),
            prisma.banned.count(),
        ]);

        const totalPages = Math.ceil(totalBannedUsers / limit);

        return res.status(200).json({
            success: true,
            data: bannedUsers,
            meta: {
                totalBannedUsers,
                currentPage: page,
                totalPages
            }
        });
    } catch (error) {
        console.error("Error in getAllBannedUsers:", error);
        return next(error);
    }
};