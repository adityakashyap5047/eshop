"use client";

import ImagePlaceHolder from "apps/seller-ui/src/shared/components/image-placeholder/page";
import { ChevronRightIcon, Wand, X } from "lucide-react";
import ColorSelector from "apps/seller-ui/src/shared/components/color-selector";
import Input from "packages/components/input";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CustomSpecifications from "apps/seller-ui/src/shared/components/custom-specifications";
import CustomProperties from "apps/seller-ui/src/shared/components/custom-properties.tsx";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import RichTextEditor from "apps/seller-ui/src/shared/components/rich-text-editor";
import SizeSelector from "apps/seller-ui/src/shared/components/size-selector";
import Image from "next/image";
import { enhcancements } from "apps/seller-ui/src/utils/AI.enhancements";

interface UploadedImage {
  fileId: string;
  file_url: string;
}

const Page = () => {
  const {register, control, handleSubmit, formState: {errors}, setValue, watch} = useForm();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [pictureUploading, setPictureUploading] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);

  const {data, isLoading, isError} = useQuery({
    queryKey: ["categories"],
    queryFn: async() => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    staleTime: 1000 * 60 * 5, 
    retry: 2,
  });

  const {data: discountCodes = [], isLoading: discountLoading} = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    }
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subCategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    }
    );
  }

  const compressImage = (file: File, quality: number = 0.7, maxWidth: number = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async(file: File | null, index: number) => {
    if(!file) return;

    setPictureUploading(true);
    try {
      let base64String: string;
      
      if (file.size > 80000) { 
        base64String = await compressImage(file, 0.6, 600); // Compress to 60% quality, max 600px width
      } else {
        base64String = await convertFileToBase64(file);
      }
          
      const res = await axiosInstance.post("/product/api/upload-product-image", {
        fileName: base64String
      });
      
      const uploadedImage: UploadedImage = {
        fileId: res.data.fileId,
        file_url: res.data.file_url,
      }

      const updatedImages = [...images];

      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPictureUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {

    try {
      const updatedImages = [...images];

      const imageToRemove = updatedImages[index];
      if(imageToRemove && typeof imageToRemove === "object") {
        await axiosInstance.delete("/product/api/delete-product-image", {
          data: {fileId: imageToRemove.fileId}
        });
      }

      updatedImages.splice(index, 1);

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    }
  }

  const handleSaveDraft = () => {

  }

  console.log(selectedImage);

  return (
    <form className='w-full mx-auto p-8 shadow-md rounded-lg text-white' 
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">Create Product</h2>
      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRightIcon size={20} className="opacity-[0.8]"/>
        <span>Create Product</span>
      </div>

      <div className="py-4 w-full flex gap-6">
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              small={false}
              index={0}
              images={images}
              pictureUploading={pictureUploading}
              setSelectedImage={setSelectedImage}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images?.slice(1).map((_, index) => (
              <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              key={index}
              small
              index={index + 1}
              images={images}
              pictureUploading={pictureUploading}
              setSelectedImage={setSelectedImage}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>

        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            <div className="w-2/4">
              <Input
                label="Product Title*"
                placeholder="Enter product title"
                {...register("title", {required: "Product title is required"})}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>}
              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description* (Max 150 words)"
                  placeholder="Enter Product description for quick view"
                  {...register("description", {
                    required: "Product description is required",
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 || `Description cannot exceed 150 words (Current: ${wordCount} words)`
                      )
                    }
                  })}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
              </div>
              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="apple, flagship"
                  {...register("tags", {required: "Separate related products tags with a comma(,)"})}
                />
                {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags.message as string}</p>}
              </div>

              <div className="mt-2">
                <Input
                  label="Warranty*"
                  placeholder="1 Year / No Warranty"
                  {...register("warranty", {required: "Product warranty is required"})}
                />
                {errors.warranty && <p className="text-red-500 text-sm mt-1">{errors.warranty.message as string}</p>}
              </div>

              <div className="mt-2">
                <Input
                  label="Slug*"
                  placeholder="product_slug"
                  {...register("slug", {
                    required: "Slug is required!",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message: 
                        "Invalid slug format! Use only lowercase letters, numbers, and hyphens."
                    },
                    minLength: {
                      value: 3,
                      message: "Slug must be at least 3 characters long."
                    },
                    maxLength: {
                      value: 50,
                      message: "Slug cannot exceed 50 characters."
                    },
                  })}
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message as string}</p>}
              </div>

              <div className="mt-2">
                <Input
                  label="Brand"
                  placeholder="Apple, Samsung"
                  {...register("brand")}
                />
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message as string}</p>}
              </div>

              <div className="mt-2">
                <ColorSelector control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On Delivery*
                </label>

                <select 
                  {...register("cash_on_delivery", {
                  required: "Cash on Delivery is required",
                  })}
                  defaultValue={"yes"}
                  className="w-full border outline-none border-gray-700 bg-transparent rounded-md px-3 py-2 cursor-pointer"
                >
                  <option value="yes" className="bg-black">Yes</option>
                  <option value="no" className="bg-black">No</option>
                </select>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="w-2/4">
              <label className="block font-semibold text-gray-300 mb-1">
                Category*
              </label>
              {
                isLoading ? (
                  <p className="text-gray-400">Loading categories...</p>
                ) : isError ? (
                  <p className="text-red-500">Failed to load categories</p>
                ) : (
                  <Controller 
                    name="category"
                    control={control}
                    rules={{required: "Category is required"}}
                    render={({field}) => (
                      <select
                        {...field}
                        className="w-full border outline-none border-gray-700 bg-transparent rounded-md px-3 py-2 cursor-pointer"
                      >
                        <option value="" className="bg-black">
                          Select Category
                        </option>
                        {categories.map((category: string) => (
                          <option
                            key={category}
                            value={category}
                            className="bg-black"
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )
              }
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category.message as string}
                </p>
              )}

              <div className="mt-2">
                <label className="black font-semibold text-gray-300 mb-1">
                  Subcategory*
                </label>
                <Controller
                  name="subCategory"
                  control={control}
                  rules={{required: "Subcategory is required"}}
                  render={({field}) => (
                    <select
                      {...field}
                      disabled={!selectedCategory || subCategories.length === 0}
                      className="w-full mt-1 border outline-none border-gray-700 bg-transparent rounded-md px-3 py-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <option value="" className="bg-black">
                        Select Subcategory
                      </option>
                      {subCategories.map((subCategory: string) => (
                        <option
                          key={subCategory}
                          value={subCategory}
                          className="bg-black"
                        >
                          {subCategory}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.subCategory && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.subCategory.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description* (Min 100 words)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed description is required",
                    validate: (value) => {
                      const wordCount = value?.split(/\s+/).filter((word: string) => word).length;
                      return (
                        wordCount >= 100 || "Description must be at least 100 words!"
                      )
                    },
                  }}
                  render={({field}) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailed_description.message as string}
                  </p>  
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Video URL"
                  placeholder="https://www.youtube.com/embed/xyz123"
                  {...register("video_url", {
                    pattern: {
                      value:
                      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
                      message: "Please enter a valid YouTube URL",
                    },
                  })}
                />
                {errors.video_url && <p className="text-red-500 text-sm mt-1">{errors.video_url.message as string}</p>}
              </div>

              <div className="mt-2">
                <Input
                  label="Regular Price"
                  placeholder="20$"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: {value: 1, message: "Price must be at least 1"},
                    validate: (value) => !isNaN(value) || "Only numbers are allowed",
                  })}
                />
                {errors.regular_price && <p className="text-red-500 text-sm mt-1">{errors.regular_price.message as string}</p>}
              </div>

              <div className="mt-2">
                <Input
                  label="Sale Price*"
                  placeholder="15$"
                  {...register("sale_price", {
                    required: "Sale price is required",
                    valueAsNumber: true,
                    min: {value: 1, message: "Sale Price must be at least 1"},
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (regularPrice && value >= regularPrice) {
                        return "Sale Price must be less than Regular Price";
                      }
                      return true;
                    }
                  })}
                />
                {errors.sale_price && <p className="text-red-500 text-sm mt-1">{errors.sale_price.message as string}</p>}
              </div>

              <div className="mt-2">
                <Input
                  label="Stock*"
                  placeholder="100"
                  {...register("stock", {
                    required: "Stock is required",
                    valueAsNumber: true,
                    min: {value: 1, message: "Stock must be at least 1"},
                    max: {
                      value: 1000,
                      message: "Stock cannot exceed 1,000"
                    },
                    validate: (value) => {
                      if(isNaN(value)) return "Only numbers are allowed!"
                      if(!Number.isInteger(value)) return "Stock must be a whole number!"

                      return true;
                    }
                  })}
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message as string}</p>}
              </div>

              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>

              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1">
                  Select Discount Codes (optional)
                </label>
                {discountLoading ? (
                  <p className="text-gray-400">
                    Loading discount codes...
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((code: any) => (
                      <button
                        key={code.id}
                        type="button"
                        className={`px-3 py-1 rounded-md text-sm font-semibold border ${watch("discountCodes")?.includes(code.id) ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-700"}`}
                        onClick={() => {
                          const currentSelection = watch("discountCodes") || [];
                          const updatedSelection = currentSelection?.includes(code.id) ? currentSelection.filter((id: string) => id !== code.id) : [...currentSelection, code.id];
                          setValue("discountCodes", updatedSelection);
                        }}
                      >
                        {code?.public_name} ({code.discountValue}{code.discountType === "percentage" ? "%" : "$"})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            {isChanged && (
              <button 
                type="button"
                className="px-4 py-2 bg-gray-700 text-white rounded-md"
                onClick={handleSaveDraft}
              >
                Save Draft
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>

      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
            <div className="flex justify-between items-center pb-3 mb-4">
              <h2 className="text-lg font-semibold">Enhance Product Image</h2>
              <X size={20} className="cursor-pointer" onClick={() => setOpenImageModal(false)}/>
            </div>  
            <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600">
              <Image
                src={selectedImage}
                alt="Selected Project Image"
                layout="fill"
                className="h-[250px]"
              />
            </div>
            {selectedImage && (
              <div className="mt-4 space-y-2">
                <h3 className="text-white text-sm font-semibold">AI Enhancements</h3>
                <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto">
                  {enhcancements.map(({label, effect}) => (
                    <button key={effect} 
                      className={`p-2 rounded-md flex items-center justify-center gap-2 ${activeEffect === effect ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                      // onClick={() => setActiveEffect(effect)}
                    >
                      <Wand size={18}/> {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  )
}

export default Page