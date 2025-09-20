import prisma from "@packages/libs/prisma";
import cron from "node-cron";

cron.schedule("0 * * * *", async () => {
    try {
        const now = new Date();
        const deletedProducts = await prisma.products.findMany({
            where: {
                isDeleted: true,
                deletedAt: {
                    lte: now
                }
            }
        });
        console.log(`${deletedProducts.length} expired products permanently deleted.`);
    } catch (error) {
        console.error("Error deleting expired products:", error);
    }
})