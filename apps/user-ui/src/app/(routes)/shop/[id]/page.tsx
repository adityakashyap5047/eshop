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

    return {
        title: `${data?.shop?.name} | Eshop Marketplace`,
        description: data?.shop?.bio || "Explore products and services from trusted sellers on Ehsop.",
        openGraph: {
            title: `${data?.shop?.name} | Eshop Marketplace`,
            description: data?.shop?.bio || "Explore products and services from trusted sellers on Ehsop.",
            type: "website",
            images: [
                {
                    url: data?.shop?.avatar || "https://ik.imagekit.io/adityakashyap5047/Eshop/Cover%20Picture/image.png?updatedAt=1758872565520",
                    width: 800,
                    height: 600,
                    alt: data?.shop?.name || "Shop Logo",
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: `${data?.shop?.name} | Eshop Marketplace`,
            description: data?.shop?.bio || "Explore products and services from trusted sellers on Ehsop.",
            images: [
                {
                    url: data?.shop?.avatar || "https://ik.imagekit.io/adityakashyap5047/Eshop/Cover%20Picture/image.png?updatedAt=1758872565520",
                    width: 800,
                    height: 600,
                    alt: data?.shop?.name || "Shop Logo",
                }
            ]
        }
    }
}

const Page = async ({params}: {params: Promise<{id: string}>}) => {
    const data = await fetchSellerDetails((await params).id);

    return (
        <SellerProfile shop={data?.shop} followersCount={data?.followersCount || 0} />
    )
}

export default Page