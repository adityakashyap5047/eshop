import SellerProfile from "apps/user-ui/src/shared/components/seller-profile";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance"
import { Metadata } from "next";

async function fetchSellerDetails(id: string) {
    const response = await axiosInstance.get(`/api/get-seller/${id}`);
    return response.data;
}

export async function generateMetadata ({
    params,
}: {
    params: Promise<{ id: string }>;
}) : Promise<Metadata> {
    const data = await fetchSellerDetails((await params).id);
    const shop = data.data;
    return {
        title: `${shop?.name} | Eshop Marketplace`,
        description: shop?.bio || "Explore products and services from trusted sellers on Ehsop.",
        openGraph: {
            title: `${shop?.name} | Eshop Marketplace`,
            description: shop?.bio || "Explore products and services from trusted sellers on Ehsop.",
            type: "website",
            images: [
                {
                    url: shop?.avatar || "https://ik.imagekit.io/adityakashyap5047/Eshop/Cover%20Picture/image.png?updatedAt=1758872565520",
                    width: 800,
                    height: 600,
                    alt: shop?.name || "Shop Logo",
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: `${shop?.name || "Eshop Marketplace"}`,
            description: shop?.bio || "Explore products and services from trusted sellers on Ehsop.",
            images: [
                {
                    url: shop?.avatar || "https://ik.imagekit.io/adityakashyap5047/Eshop/Cover%20Picture/image.png?updatedAt=1758872565520",
                    width: 800,
                    height: 600,
                    alt: shop?.name || "Shop Logo",
                }
            ]
        }
    }
}

const Page = async ({params}: {params: Promise<{id: string}>}) => {
    const data = await fetchSellerDetails((await params).id);
    const shop = data.data;
    return (
        <SellerProfile shop={shop} followersCount={shop?.followersCount || 0} />
    )
}

export default Page