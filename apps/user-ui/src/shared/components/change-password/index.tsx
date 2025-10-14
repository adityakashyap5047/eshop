"use client"

import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { useState } from "react";
import { useForm } from "react-hook-form"

const ChangePassword = () => {

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm();

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const onSubmit = async (data: any) => {
        setError("");
        setMessage("");

        try {
            await axiosInstance.post("/api/change-password", {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            });
            setMessage("Password changed successfully");
            reset();
        } catch (error: any) {
            setError(error.response?.data?.message || "An error occurred while changing the password");
        }
    }

    return (
        <div className="max-w-md mx-auto space-y-6">
            <form className="space-y-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                    Current Password
                </label>
            </form>
        </div>
    )
}

export default ChangePassword