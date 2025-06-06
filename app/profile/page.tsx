// app/profile/page.tsx
"use client";

import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { availablePlans, Plan } from "@/lib/plan"; // Adjust the path based on your project structure
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast"; // Import toast
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  if (!isSignedIn) {
    RedirectToSignIn;
  }
  // State to manage selected priceId
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  // Fetch Subscription Details
  const {
    data: subscription,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetch("/api/profile/subscription-status");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch subscription.");
      }
      return res.json();
    },
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Adjusted Matching Logic Using priceId
  const currentPlan = availablePlans.find(
    (plan) => plan.interval === subscription?.subscription?.subscriptionTier
  );

  // Mutation: Change Subscription Plan
  const changePlanMutation = useMutation<
    unknown, // Replace with actual response type if available
    Error,
    string // The newPriceId
  >({
    mutationFn: async (newPlan: string) => {
      const res = await fetch("/api/profile/change-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPlan }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Failed to change subscription plan."
        );
      }
      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription plan updated successfully.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation: Unsubscribe
  const unsubscribeMutation = useMutation<
    unknown, // Replace with actual response type if available
    Error,
    void
  >({
    mutationFn: async () => {
      const res = await fetch("/api/profile/unsubscribe", {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to unsubscribe.");
      }
      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      router.push("/subscribe");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Handler for confirming plan change
  const handleConfirmChangePlan = () => {
    if (selectedPlan) {
      changePlanMutation.mutate(selectedPlan);
      setSelectedPlan("");
    }
  };

  // Handle Change Plan Selection with Confirmation
  const handleChangePlan = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedPlan = e.target.value;
    if (newSelectedPlan) {
      setSelectedPlan(newSelectedPlan);
    }
  };

  // Handle Unsubscribe Button Click
  const handleUnsubscribe = () => {
    if (
      confirm(
        "Are you sure you want to unsubscribe? You will lose access to premium features."
      )
    ) {
      unsubscribeMutation.mutate();
    }
  };

  // Loading or Not Signed In States
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-100">
        <Spinner />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-100">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gradient-to-b from-green-100 via-green-200 to-green-300"
    >
      <Toaster position="top-center" /> {/* Hero Section */}
      <section className="py-20 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold text-green-900 mb-4"
        >
          Welcome, {user.firstName} {user.lastName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-green-800"
        >
          Manage your profile and subscription below.
        </motion.p>
      </section>
      {/* Cards Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center"
        >
          <img
            src={user.imageUrl || "/default-avatar.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full mb-4 object-cover shadow-md"
          />
          <h2 className="text-2xl font-semibold text-green-900">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-green-700 mt-2">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </motion.div>

        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-green-900 text-center mb-6">
            Subscription
          </h3>

          {isLoading ? (
            <div className="flex justify-center items-center gap-2">
              <Spinner />
              <span className="text-green-700">Loading...</span>
            </div>
          ) : isError ? (
            <p className="text-red-600 text-center">{error?.message}</p>
          ) : subscription ? (
            <>
              {/* Current Plan */}
              <div className="mb-6 text-center">
                {currentPlan ? (
                  <>
                    <p className="text-green-800 text-lg">
                      <strong>Plan:</strong> {currentPlan.name}
                    </p>
                    <p className="text-green-800">
                      <strong>Amount:</strong> ₹{currentPlan.amount}{" "}
                      {currentPlan.currency}
                    </p>
                    <p className="text-green-800">
                      <strong>Status:</strong>{" "}
                      {subscription.subscription.subscriptionActive
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </>
                ) : (
                  <p className="text-red-600">Current plan not found.</p>
                )}
              </div>

              {/* Change Plan */}
              <div className="mb-6">
                <select
                  onChange={handleChangePlan}
                  defaultValue={currentPlan?.interval || ""}
                  disabled={changePlanMutation.isPending}
                  className="w-full p-3 rounded-lg border border-green-300 text-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="" disabled>
                    Select a new plan
                  </option>
                  {availablePlans.map((plan, i) => (
                    <option key={i} value={plan.interval}>
                      {plan.name} - ₹{plan.amount} / {plan.interval}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleConfirmChangePlan}
                  disabled={changePlanMutation.isPending || !selectedPlan}
                  className={`mt-4 w-full py-3 rounded-lg text-white font-semibold transition ${
                    changePlanMutation.isPending || !selectedPlan
                      ? "bg-green-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {changePlanMutation.isPending ? "Updating..." : "Save Change"}
                </button>
              </div>

              {/* Unsubscribe */}
              <div>
                <button
                  onClick={handleUnsubscribe}
                  disabled={unsubscribeMutation.isPending}
                  className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                    unsubscribeMutation.isPending
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {unsubscribeMutation.isPending
                    ? "Unsubscribing..."
                    : "Unsubscribe"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-green-700 text-center">
              You are not subscribed to any plan.
            </p>
          )}
        </motion.div>
      </section>
      {/* CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center py-16 bg-green-700 text-white px-4"
      >
        <h2 className="text-3xl font-bold mb-4">Want more features?</h2>
        <p className="text-lg mb-6">
          Explore premium plans and unlock advanced tools.
        </p>
        <button
          onClick={() => router.push("/subscribe")}
          className="bg-white text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-green-100 transition"
        >
          View Plans
        </button>
      </motion.section>
    </motion.main>
  );
}
