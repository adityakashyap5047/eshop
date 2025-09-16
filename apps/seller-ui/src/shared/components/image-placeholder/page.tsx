import { Pencil, WandSparkles, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react'

const ImagePlaceHolder = ({
    size, small, onImageChange, onRemove, defaultImage = null, index = null, setOpenImageModal,
}: {
    size: string,
    small?: boolean,
    onImageChange: (file: File | null, index: number) => void,
    onRemove: (index: number) => void,
    defaultImage?: string | null,
    index?:  any;
    setOpenImageModal: (openImageModal: boolean) => void,
}) => {
    const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            setImagePreview(URL.createObjectURL(file));
            onImageChange(file, index);
        }
    }

    return (
        <div className={`relative ${small ? "h-[180px]" : "h-[450px]"} w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center`}>
            <input 
                type="file" className='hidden' accept="image/*" onChange={handleFileChange} id={`image-upload-${index}`}
            />
            {imagePreview ? (
                <>
                    <button type='button' onClick={() => onRemove?.(index)}
                        className='absolute top-3 right-3 p-2 !rounded bg-red-600 shadow-lg'    
                    >
                        <X size={16} />
                    </button>
                    <button 
                        className='absolute top-3 right-[70px] p-2 !rounded bg-blue-500 shadow-lg cursor-pointer'
                        type='button'
                        onClick={() => setOpenImageModal(true)}
                    >
                        <WandSparkles size={16} />
                    </button>
                </>
            ) : (
                <label className='absolute top-3 right-3 p-2 !rounded bg-slate-700 shadow-lg cursor-pointer'
                    htmlFor={`image-upload-${index}`}
                >
                    <Pencil size={16} />
                </label>
            )}

            {imagePreview ? (
                <Image
                    src={imagePreview}
                    alt='uploaded image'
                    width={400}
                    height={300}
                    className='w-full h-full object-cover rounded-lg'
                />
            ) : (
                <>
                    <p className={`text-gray-400 ${small ? "text-xl" : "text-4xl"} font-semibold`}>
                        {size}
                    </p>
                    <p className={`text-gray-500 ${small ? "text-sm" : "text-lg"} pt-2 text-center`}>
                        Please choose an image <br />
                        according to the expected ratio
                    </p>
                </>
            )}
        </div>
    )
}

export default ImagePlaceHolder