import { PlusCircle, Trash2 } from 'lucide-react';
import Input from 'packages/components/input';
import React from 'react'
import { Controller, useFieldArray } from 'react-hook-form'

const CustomSpecifications = ({control, errors}: any) => {

    const {fields, append, remove} = useFieldArray({
        control,
        name: "custom_specifications"
    });

  return (
    <div>
        <label className='block font-semibold text-gray-300 mb-1'>
            Custom Specifications
        </label>
        <div className="flex flex-col gap-3">
            {fields?.map((item, index) => (
                <div className="flex gap-2 items-center justify-center" key={index}>
                    <Controller
                        name={`custom_specifications.${index}.name`}
                        control={control}
                        rules={{required: "Specification name is required"}}
                        render={({ field }) => (
                            <Input
                                labelClass='!text-gray-700 !text-sm'
                                label='Specification Name'
                                placeholder='e.g. Battery Life, Weight, Material'
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        name={`custom_specifications.${index}.value`}
                        control={control}
                        rules={{required: "Specification value is required"}}
                        render={({ field }) => (
                            <Input
                                labelClass='!text-gray-700 !text-sm'
                                label='Specification Value'
                                placeholder='e.g. 10 hours, 1.5 kg, Plastic'
                                {...field}
                            />
                        )}
                    />
                    <button type='button'
                        className='text-red-500 hover:text-red-700 mt-6'
                        onClick={() => remove(index)}
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            ))}

            <button
                type='button'
                className='flex items-center gap-2 text-blue-500 hover:text-blue-600'
                onClick={() => append({name: "", value: ""})}
            >
                <PlusCircle size={20} /> Add Specification 
            </button>
        </div>
        {errors?.custom_specifications && (
            <p className='text-red-500 text-xs mt-1'>
                {errors.custom_specifications.message as String}
            </p>
        )}
    </div>
  )
}

export default CustomSpecifications