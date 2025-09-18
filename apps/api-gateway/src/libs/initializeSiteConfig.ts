import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initializeSiteConfig = async() => {
    try {
        const existingConfig = await prisma.site_config.findFirst();

        if (!existingConfig){
            await prisma.site_config.create({
                data: {
                    categories: [
                        "Electronics",
                        "Fashion",
                        "Home & Kitchen",
                        "Sports & Fitness",
                    ],
                    subCategories: {
                        "Electronics": ["Mobiles", "Laptops", "Accessories", "Gaming"],
                        "Fashion": ["Men", "Women", "Kids", "Footwear"],
                        "Home & Kitchen": ["Furniture", "Appliances", "Decor", "Cookware"],
                        "Sports & Fitness": ["Outdoor", "Gym Equipment", "Apparel", "Footwear"],
                    }
                }
            })
        } 
    } catch (error) {
        console.error("Error initializing site configuration:", error);
    }
}

export default initializeSiteConfig;