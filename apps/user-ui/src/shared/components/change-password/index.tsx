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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Current Password
                    </label>
                    <input type="password" {...register("currentPassword", { required: "Current password is required" })} className="form-input border-2 border-gray-400 outline-none rounded-sm px-2 py-1 w-full" placeholder="Enter current password"/>
                    {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{String(errors.currentPassword.message)}</p>}
                </div>
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <input type="password" {...register("newPassword", { required: "New password is required", minLength: { value: 6, message: "Password must be at least 6 characters" }, validate: {
                        hasLower: (value) => /[a-z]/.test(value) || "Password must contain at least one lowercase letter",
                        hasUpper: (value) => /[A-Z]/.test(value) || "Password must contain at least one uppercase letter",
                        hasNumber: (value) => /[0-9]/.test(value) || "Password must contain at least one number",
                        hasSpecial: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value) || "Password must contain at least one special character"
                    } })} className="form-input border-2 border-gray-400 outline-none rounded-sm px-2 py-1 w-full" placeholder="Enter new password"/>
                    {errors.newPassword && <p className="text-red-500 text-sm mt-1">{String(errors.newPassword.message)}</p>}
                </div>
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Confirm New Password
                    </label>
                    <input type="password" {...register("confirmPassword", { required: "Please confirm your new password", validate: (value) => value === watch("newPassword") || "Passwords do not match" })} className="form-input border-2 border-gray-400 outline-none rounded-sm px-2 py-1 w-full" placeholder="Confirm new password"/>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{String(errors.confirmPassword.message)}</p>}
                </div>

                <button type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-1 bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Changing..." : "Change Password"}
                </button>
            </form>
            {error && <p className="text-red-500 text-center text-sm">{error}</p>}
            {message && <p className="text-green-500 text-center text-sm">{message}</p>}
        </div>
    )
}

export default ChangePassword