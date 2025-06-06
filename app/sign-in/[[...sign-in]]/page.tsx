"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="mt-[100px] mb-[100px] min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-xl px-4 sm:px-6 lg:px-8">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/create-profile"
          appearance={{
            elements: {
              card: "shadow-xl rounded-2xl px-6 py-8",
              headerTitle: "text-3xl font-bold text-center text-gray-800",
              headerSubtitle: "text-lg text-center text-gray-600 mb-4",
              formFieldLabel: "text-base text-gray-700",
              formFieldInput:
                "text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500",
              formButtonPrimary:
                "bg-green-600 hover:bg-green-700 text-white text-base font-semibold py-2 rounded-md",
            },
            variables: {
              fontSize: "16px",
              colorPrimary: "#16a34a", // Tailwind green-600
              borderRadius: "0.75rem", // Tailwind rounded-xl
            },
          }}
        />
      </div>
    </div>
  );
}
