"use client";
import React, { useEffect } from "react";
import { availablePlans } from "@/lib/plan";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

type SubscribeResponse = {
  url: string;
};
type SubscribeError = {
  error: string;
};

async function subscribeToPlan(
  planType: string,
  userId: string,
  email: string
): Promise<SubscribeResponse> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      planType,
      userId,
      email,
    }),
  });

  if (!response.ok) {
    const errorData: SubscribeError = await response.json();
    throw new Error(errorData.error || "something Went Wrong in checkout");
  }

  const data: SubscribeResponse = await response.json();
  return data;
}

export default function Subscribe() {
  const { user } = useUser();
  const userId = user?.id;
  const email = user?.emailAddresses[0].emailAddress || "";
  const router = useRouter();

  const { data: subscription, isLoading: isSubLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetch("/api/profile/subscription-status");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch subscription.");
      }
      return res.json();
    },
    enabled: !!userId, // only run if user is signed in
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error === "inactive") {
      const hasToasted = sessionStorage.getItem("hasToasted");
      if (!hasToasted) {
        toast.error("Please subscribe to access this feature", {
          icon: "🔒",
          style: {
            background: "#ffdddd",
            color: "#b71c1c",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 4px 14px rgba(183, 28, 28, 0.4)",
            marginTop: "100px",
            fontWeight: "600",
            fontSize: "15px",
            border: "1px solid #b71c1c",
            maxWidth: "320px",
          },
          duration: 5000,
        });

        sessionStorage.setItem("hasToasted", "true");

        // Remove error param from URL without reload
        params.delete("error");
        const newUrl = `/subscribe${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        window.history.replaceState({}, "", newUrl);
      }
    }

    return () => {
      sessionStorage.removeItem("hasToasted");
    };
  }, []);

  const { mutate, isPending } = useMutation<
    SubscribeResponse,
    SubscribeError,
    { planType: string }
  >({
    mutationFn: async ({ planType }) => {
      if (!userId) {
        throw new Error("user not sign in ");
      }
      return subscribeToPlan(planType, userId, email);
    },
    onMutate: () => {
      toast.loading("Processing your subscription...");
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error("Something went wrong");
      console.log("Error:", error);
    },
  });

  // function handleSubscribe(planType: string) {
  //   if (!userId) {
  //     router.push("/sign-up");
  //     return;
  //   }
  //   mutate({ planType });
  // }

  function handleSubscribe(planType: string) {
    if (!userId) {
      router.push("/sign-up");
      return;
    }

    // If still loading subscription, block action
    if (isSubLoading) {
      toast.loading("Checking your subscription...");
      return;
    }

    // If user has active subscription, redirect to profile
    if (subscription?.subscription?.subscriptionActive) {
      toast("You already have an active subscription.", {
        icon: "✅",
        style: { background: "#e0ffe0", color: "#256029" },
      });
      router.push("/profile");
      return;
    }

    // If no active subscription, proceed to checkout
    mutate({ planType });
  }

  return (
    <div className="bg-gradient-to-b from-white to-green-50 mt-20 min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto px-4 py-16 min-h-[80vh] flex flex-col justify-center items-center text-center"
      >
        <h1 className="text-5xl font-extrabold text-green-800 mb-6">
          Subscribe to Resume Parser
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl">
          Unlock full access to our powerful resume parser. Upload resumes and
          get structured JSON data instantly.
        </p>
      </motion.section>
      {/* Pricing Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
        className="bg-gradient-to-br from-green-100 to-white py-32 mt-32"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-10">
          {availablePlans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.04, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`min-h-[500px] border rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all relative flex flex-col bg-white ${
                plan.isPopular ? "border-green-500 ring-2 ring-green-300" : ""
              }`}
            >
              {plan.isPopular && (
                <span className="absolute top-4 right-4 bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow">
                  Most Popular
                </span>
              )}
              <h2 className="text-3xl font-semibold text-green-800 mb-3">
                {plan.name}
              </h2>
              <p className="text-gray-600 mb-6 text-base">{plan.description}</p>
              <div className="text-4xl font-bold text-green-700 mb-4">
                ₹{plan.amount}
                <span className="text-sm font-medium text-gray-500">
                  /{plan.interval}
                </span>
              </div>
              <ul className="mb-8 space-y-3 flex-1 text-gray-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <span className="mr-2 text-green-500 mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-auto w-full py-3 px-4 rounded-lg font-semibold transition shadow-md ${
                  plan.isPopular
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-100 hover:bg-green-200 text-green-800"
                }`}
                onClick={() => handleSubscribe(plan.interval)}
                disabled={isPending}
              >
                {isPending
                  ? "Please wait, processing..."
                  : `Subscribe to ${plan.name}`}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.section>
      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-green-600 text-white text-center py-24 mt-32"
      >
        <h2 className="text-3xl font-bold mb-4">Start Parsing Resumes Today</h2>
        <p className="text-lg mb-6 max-w-xl mx-auto">
          Subscribe now and convert resumes to structured JSON data with ease.
        </p>
        <button className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition">
          Subscribe Now
        </button>
      </motion.section>
      <Toaster position="top-right" />
    </div>
  );
}
