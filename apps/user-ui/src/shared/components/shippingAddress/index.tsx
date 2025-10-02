"use client";

import { useQueryClient } from "@tanstack/react-query";
import { countries } from "apps/user-ui/src/utils/countries";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const ShippingAddressSection = () => {
    const [showModal, setShowModal] = useState(false);
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors}
    } = useForm({
        defaultValues: {
            label: "Home",
            name: "",
            street: "",
            city: "",
            zip: "",
            country: "IN",
            isDefault: "false",
        }
    });

    const onsubmit = async() => {};

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Saved Address</h2>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline">
                    <Plus className="h-4 w-4" /> Add New Address
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white w-full max-w-md p-6 rounded-md shadow-md relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-green-800">
                            <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            Add New Address
                        </h3>
                        <form onSubmit={handleSubmit(onsubmit)} className="space-y-3">
                            <select {...register("label")} className="!w-full form-input py-1 px-4 cursor-pointer border !border-gray-700 !rounded-sm">
                                <option value="Home">Home</option>
                                <option value="Work">Work</option>
                                <option value="Other">Other</option>
                            </select>
                            <input
                                placeholder="Name"
                                {...register("name", {required: "Name is required"})}
                                className="form-input py-1 px-4 !w-full !border !border-gray-700 !rounded-sm"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs">{errors.name.message}</p>
                            )}
                            <input
                                placeholder="Street"
                                {...register("street", {required: "Street is required"})}
                                className="form-input py-1 px-4 !w-full !border !border-gray-700 !rounded-sm"
                            />
                            {errors.street && (
                                <p className="text-red-500 text-xs">{errors.street.message}</p>
                            )}
                            <input
                                placeholder="City"
                                {...register("city", {required: "City is required"})}
                                className="form-input py-1 px-4 !w-full !border !border-gray-700 !rounded-sm"
                            />
                            {errors.city && (
                                <p className="text-red-500 text-xs">{errors.city.message}</p>
                            )}
                            <input
                                placeholder="Zip Code"
                                {...register("zip", {required: "Zip is required"})}
                                className="form-input py-1 px-4 !w-full !border !border-gray-700 !rounded-sm"
                            />
                            {errors.zip && (
                                <p className="text-red-500 text-xs">{errors.zip.message}</p>
                            )}
                            <select {...register("country")} className="!w-full form-input py-1 px-4 cursor-pointer border !border-gray-700 !rounded-sm">
                                {countries.map((country) => (
                                    <option value={country.code} key={country.code}>{country.name}</option>
                                ))}
                            </select>
                            <select {...register("isDefault")} className="!w-full form-input py-1 px-4 cursor-pointer border !border-gray-700 !rounded-sm">
                                <option value="true">Set as Default</option>
                                <option value="false">Not Default</option>
                            </select>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition"
                            >
                                Save Address
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShippingAddressSection