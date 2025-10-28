"use client";

import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { ChevronRightIcon, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const tabs = ['Categories', 'Logo', 'Banner'];

const Customization = () => {
    const [activeTab, setActiveTab] = useState("Categories");
    const [categories, setCategories] = useState<string[]>([]);
    const [subCategories, setSubCategories] = useState<Record<string, string[]>>({});
    const [logo, setLogo] = useState<string | null>(null);
    const [banner, setBanner] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState(""); 
    const [newSubCategory, setNewSubCategory] = useState(""); 
    const [selectedCategory, setSelectedCategory] = useState("");
    const [logoUploading, setLogoUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const [logoDragActive, setLogoDragActive] = useState(false);
    const [bannerDragActive, setBannerDragActive] = useState(false);

    const handleLogoUpload = async (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }
        
        setLogoUploading(true);
        
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = async () => {
                try {
                    const base64Data = reader.result as string;
                    const res = await axiosInstance.post("/admin/api/upload-logo", {
                        file: base64Data
                    });
                    setLogo(res.data.logo);
                    toast.success("Logo uploaded successfully");
                } catch (error) {
                    console.error("Logo upload failed", error);
                    toast.error("Failed to upload logo");
                } finally {
                    setLogoUploading(false);
                }
            };
            
            reader.onerror = () => {
                toast.error("Failed to read file");
                setLogoUploading(false);
            };
        } catch (error) {
            console.error("Logo upload failed", error);
            toast.error("Failed to upload logo");
            setLogoUploading(false);
        }
    };

    const handleBannerUpload = async (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }
        
        setBannerUploading(true);
        
        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = async () => {
                try {
                    const base64Data = reader.result as string;
                    const res = await axiosInstance.post("/admin/api/upload-banner", {
                        file: base64Data
                    });
                    setBanner(res.data.banner);
                    toast.success("Banner uploaded successfully");
                } catch (error) {
                    console.error("Banner upload failed", error);
                    toast.error("Failed to upload banner");
                } finally {
                    setBannerUploading(false);
                }
            };
            
            reader.onerror = () => {
                toast.error("Failed to read file");
                setBannerUploading(false);
            };
        } catch (error) {
            console.error("Banner upload failed", error);
            toast.error("Failed to upload banner");
            setBannerUploading(false);
        }
    };

    useEffect(() => {
        const fetchCustomization = async() => {
            try {
                const res = await axiosInstance.get("/admin/api/get-all");
                const data = res.data;

                setCategories(data.categories || []);
                setSubCategories(data.subCategories || {});
                setLogo(data.logo || null);
                setBanner(data.banner || null);
            } catch (error) {
                console.error("Failed to fetch customization data", error);
            }
        }

        fetchCustomization();
    }, []);

    const handleAddCategory = async() => {
        if(!newCategory.trim()) return;
        try {
            await axiosInstance.post("/admin/api/add-category", {
                category: newCategory
            });
            setCategories((prev) => [...prev, newCategory]);
            setNewCategory("");
        } catch (error) {
            console.error("Error adding category", error);
        }
    }

    const handleAddSubCategory = async() => {
        if(!newSubCategory.trim() || !selectedCategory) return;
        try {
            await axiosInstance.post("/admin/api/add-subcategory", {
                category: selectedCategory,
                subCategory: newSubCategory,
            });
            setSubCategories((prev) => ({
                ...prev,
                [selectedCategory]: [...(prev[selectedCategory] || []), newSubCategory],
            }));
            setNewSubCategory("");
        } catch (error) {
            console.error("Error adding subcategory", error);
        } 
    }

    return (
        <div className="w-full min-h-screen p-8">
            <h2 className="text-2xl text-white font-semibold mb-2">Customization</h2>

            <div className="flex items-center mb-4">
                <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
                    Dashboard            
                </Link>
                <ChevronRightIcon className="text-gray-200" size={20} />
                <span className="text-white">Customization</span>
            </div>

            <div className="flex items-center gap-6 mt-6 border-b border-gray-700">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`text-white ${activeTab === tab && "border-b-2"}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="mt-8 text-white">
                {activeTab === "Categories" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categories.length === 0 ? (
                            <p className="text-gray-400">No categories found.</p>
                        ) : (
                            categories.map((cat, idx) => (
                                <div key={idx} className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                                    <p className="font-semibold mb-2">{cat}</p>
                                    {subCategories?.[cat]?.length > 0 ? (
                                        <ul className="ml-4 text-gray-400 space-y-1">
                                            {subCategories[cat].map((sub, i) => (
                                                <li key={i} className="text-sm">{sub}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="ml-4 text-xs text-gray-500 italic">
                                            No subCategories
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                        <div className="pt-4 space-x-2">
                            <input 
                                type="text"
                                placeholder="New category"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="px-3 py-1 rounded-md outline-none text-sm bg-gray-800 text-white"
                            />
                            <button
                                onClick={handleAddCategory}
                                className="text-sm mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"
                            >
                                Add Category
                             </button>
                        </div>
                        <div className="pt-4 flex items-center gap-2 flex-wrap">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-gray-800 rounded-md px-2 py-1 cursor-pointer outline-none text-white border border-gray-600"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat, idx) => (
                                    <option key={idx} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <input 
                                type="text" 
                                placeholder="New subcategory"
                                value={newSubCategory}
                                onChange={(e) => setNewSubCategory(e.target.value)}
                                className="px-3 py-1 rounded-md outline-none text-sm bg-gray-800 text-white"
                            />
                            <button
                                onClick={handleAddSubCategory}
                                className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"
                            >
                                Add Subcategory 
                            </button>
                        </div>
                    </div>
                )}
                {activeTab === "Logo" && (
                    <div className="max-w-2xl">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ImageIcon size={20} className="text-blue-400" />
                                Platform Logo
                            </h3>
                            
                            {/* Current Logo Preview */}
                            {logo && (
                                <div className="mb-6 relative">
                                    <p className="text-sm text-gray-400 mb-3">Current Logo:</p>
                                    <div className="relative inline-block">
                                        <div className="bg-white p-4 rounded-lg border-2 border-gray-600">
                                            <Image
                                                src={logo}
                                                alt="Platform Logo"
                                                width={200}
                                                height={200}
                                                className="w-auto h-32 object-contain"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setLogo(null);
                                                toast.success("Logo removed");
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full p-1.5 transition-colors"
                                            title="Remove logo"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Upload Area */}
                            <div className="space-y-4">
                                <label
                                    htmlFor="logo-upload"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setLogoDragActive(true);
                                    }}
                                    onDragLeave={() => setLogoDragActive(false)}
                                    onDrop={async (e) => {
                                        e.preventDefault();
                                        setLogoDragActive(false);
                                        const file = e.dataTransfer.files?.[0];
                                        if (file && file.type.startsWith('image/')) {
                                            await handleLogoUpload(file);
                                        } else {
                                            toast.error("Please upload an image file");
                                        }
                                    }}
                                    className={`relative block w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                                        logoDragActive
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'
                                    } ${logoUploading ? 'pointer-events-none opacity-60' : ''}`}
                                >
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) await handleLogoUpload(file);
                                        }}
                                        className="hidden"
                                        disabled={logoUploading}
                                    />
                                    <div className="space-y-3">
                                        {logoUploading ? (
                                            <>
                                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                                <p className="text-gray-300">Uploading logo...</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={48} className="mx-auto text-gray-400" />
                                                <div>
                                                    <p className="text-gray-300 font-medium mb-1">
                                                        Click to upload or drag and drop
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        PNG, JPG, GIF up to 10MB
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </label>
                                <p className="text-xs text-gray-500 text-center">
                                    Recommended: Square image, 512x512px or larger
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "Banner" && (
                    <div className="max-w-4xl">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ImageIcon size={20} className="text-blue-400" />
                                Platform Banner
                            </h3>
                            
                            {banner && (
                                <div className="mb-6 relative">
                                    <p className="text-sm text-gray-400 mb-3">Current Banner:</p>
                                    <div className="relative inline-block w-full">
                                        <div className="bg-gray-900 p-4 rounded-sm border-2 border-gray-600">
                                            <Image
                                                src={banner}
                                                alt="Platform Banner"
                                                width={1200}
                                                height={300}
                                                className="w-full h-48 object-cover rounded-sm"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setBanner(null);
                                                toast.success("Banner removed");
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full p-1.5 transition-colors"
                                            title="Remove banner"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Upload Area */}
                            <div className="space-y-4">
                                <label
                                    htmlFor="banner-upload"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setBannerDragActive(true);
                                    }}
                                    onDragLeave={() => setBannerDragActive(false)}
                                    onDrop={async (e) => {
                                        e.preventDefault();
                                        setBannerDragActive(false);
                                        const file = e.dataTransfer.files?.[0];
                                        if (file && file.type.startsWith('image/')) {
                                            await handleBannerUpload(file);
                                        } else {
                                            toast.error("Please upload an image file");
                                        }
                                    }}
                                    className={`relative block w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                                        bannerDragActive
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'
                                    } ${bannerUploading ? 'pointer-events-none opacity-60' : ''}`}
                                >
                                    <input
                                        id="banner-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) await handleBannerUpload(file);
                                        }}
                                        className="hidden"
                                        disabled={bannerUploading}
                                    />
                                    <div className="space-y-3">
                                        {bannerUploading ? (
                                            <>
                                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                                <p className="text-gray-300">Uploading banner...</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={48} className="mx-auto text-gray-400" />
                                                <div>
                                                    <p className="text-gray-300 font-medium mb-1">
                                                        Click to upload or drag and drop
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        PNG, JPG, GIF up to 10MB
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </label>
                                <p className="text-xs text-gray-500 text-center">
                                    Recommended: Wide image, 1920x400px or similar aspect ratio
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Customization