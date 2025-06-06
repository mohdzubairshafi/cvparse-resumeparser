// app/profile/page.tsx
"use client";

import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Spinner from "@/components/Spinner";
import UsageStats from "@/components/UsageStats";
import ProfileCard from "@/components/ProfileCard";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <main className="min-h-screen w-full bg-gray-100 text-gray-900">
      <Toaster position="top-center" />
      <header className="bg-emerald-700 text-white py-6 px-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm mt-1">
          Welcome back, {user.firstName} {user.lastName}
        </p>
      </header>

      <section className="p-8 ">
        <ProfileCard />
      </section>

      {/*  Stats Section  */}
      <UsageStats />
    </main>
  );
}
