"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../components/Input";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type FormData = {
  email: string;
  password: string;
}

const Page = () => {

  const { register, handleSubmit } = useForm<FormData>();
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async(data: FormData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/login-admin`, 
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data: any) => {
      setServerError(null);
      router.push('/dashboard');
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid credentials";
      setServerError(errorMessage);
    }
  })
  
  const onSubmit = async (data: FormData) => {
    setServerError(null);
    loginMutation.mutate(data);
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="md:w-[450px] pb-8 bg-slate-800 rounded-md shadow">
        <form className="p-5" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-3xl pb-3 pt-4 font-semibold text-center text-white font-Poppins">
            Welcome Admin
          </h1>
          <Input
            label="Email"
            placeholder="support@eshop.com"
            className="text-white"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email address"
              }
            })}
          />
          <div className="mt-3">
            <Input
              label="Password"
              type="password"
              placeholder="******"
              className="text-white"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
            />
          </div>
          {serverError && (
            <p className="text-red-500 text-sm mt-2">{serverError}</p>
          )}
          <div className="mt-6">
            <button 
              type="submit"
              disabled={loginMutation.isPending}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors ${loginMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loginMutation.isPending ? (
                <div className="h-6 w-6 border-2 border-gray-100 border-t-transparent rounded-full animate-spin" />
              ) : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Page