"use client";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { motion } from "framer-motion";

type ApiResponse = {
  message: string;
  error?: string;
};
async function createProfileRequest() {
  const response = await fetch("/api/create-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application:json",
    },
  });
  const data = await response.json();
  return data as ApiResponse;
}
export default function CreateProfile() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { mutate, isPending } = useMutation<ApiResponse, Error>({
    mutationFn: createProfileRequest,
    onSuccess: (data) => {
      router.push("/dashboard");
      // console.log("success; ", data);
    },
    onError: (err) => {
      router.push("/profile");
      // console.log("error ", err);
    },
  });
  useEffect(() => {
    if (isLoaded && isSignedIn && !isPending) {
      mutate();
    }
  }, [isLoaded, isSignedIn]);

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white p-10 rounded-2xl shadow-xl flex flex-col items-center space-y-6 max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h1 className="text-3xl font-bold text-emerald-700 text-center">
          Setting up your profile...
        </h1>
        <p className="text-gray-500 text-center">
          Please wait while we get everything ready for you.
        </p>

        {/* Custom Spinner */}
        <motion.div
          className="w-20 h-20 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin"
          animate={{
            rotate: 360,
            transition: { repeat: Infinity, ease: "linear", duration: 1 },
          }}
        />

        {/* Optional wave animation */}
        <motion.div
          className="flex space-x-2 mt-6"
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: [0.6, 1, 0.6],
            transition: {
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror",
            },
          }}
        >
          <div className="w-3 h-3 bg-emerald-600 rounded-full" />
          <div className="w-3 h-3 bg-emerald-600 rounded-full" />
          <div className="w-3 h-3 bg-emerald-600 rounded-full" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
