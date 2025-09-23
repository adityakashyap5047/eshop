import ProductDetails from "apps/user-ui/src/shared/product/product-details";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance"
import { Metadata } from "next";

async function fetchProductDetails(slug: string) {
    const response = await axiosInstance.get(`/product/api/get-product/${slug}/`)
    return response.data.product;
}

export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata>{
    const product = await fetchProductDetails((await params).slug);

    return {
        title: `${product?.title} | E-Shop`,
        description: product?.description || 'E-Shop is the best place to buy products online.',
        openGraph: {
            title: `${product?.title} | E-Shop`,
            description: product?.description || 'E-Shop is the best place to buy products online.',
            images: [product?.images?.[0]?.url || '/default-image.jpg'],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product?.title} | E-Shop`,
            description: product?.description || 'E-Shop is the best place to buy products online.',
            images: [product?.images?.[0]?.url || '/default-image.jpg'],
        }
    }
}

const page = async ({params}: {params: Promise<{slug: string}>}) => {
    
    const productDetails = await fetchProductDetails((await params).slug);

    return (
        <ProductDetails productDetails={productDetails} />
    )
}

export default page