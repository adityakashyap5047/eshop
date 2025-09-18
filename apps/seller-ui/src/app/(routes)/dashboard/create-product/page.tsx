"use client";

import ImagePlaceHolder from "apps/seller-ui/src/shared/components/image-placeholder/page";
import { ChevronRightIcon } from "lucide-react";
import ColorSelector from "apps/seller-ui/src/shared/components/color-selector";
import Input from "packages/components/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import CustomSpecifications from "apps/seller-ui/src/shared/components/custom-specifications";

const Page = () => {
  const {register, control, handleSubmit, formState: {errors}, setValue} = useForm();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const onSubmit = (data: any) => {
    console.log(data);
  };

    const handleImageChange = (file: File | null, index: number) => {
      const updatedImages = [...images];
      updatedImages[index] = file;

      if (index === images.length - 1 && images.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", updatedImages);
    };

    const handleRemoveImage = (index: number) => {
        setImages((prevImages) => {
          let updatedImages = [...prevImages];

          if (index === -1) {
            updatedImages[0] = null;
          } else {
              updatedImages.splice(index, 1);
          }

          if (!updatedImages.includes(null) && updatedImages.length < 8) {
            updatedImages.push(null);
          }

          return updatedImages;
        })

        setValue("images", images);
    }

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
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default Page