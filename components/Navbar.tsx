"use client";
import { SignedIn, SignedOut, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import Spinner from "./Spinner";
import toast from "react-hot-toast";

export default function Navbar() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) return <Spinner />;
  // Handler for CvParse link click
  function handleCvParseClick() {
    toast("Processing, please wait...", {
      style: {
        marginTop: "100px", // push down below navbar
      },
    });
    // The toast will show and remain until you dismiss or replace it elsewhere
  }
  return (
    <motion.nav
      className="bg-white shadow-md px-6 py-4 flex justify-between items-center fixed w-full z-50 top-0"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <Image src="/logo.png" width={50} height={50} alt="logo" />
        <span className="font-bold text-xl text-green-700">CvParse</span>
      </Link>

      {/* Navigation */}
      <div className="flex items-center space-x-6 text-gray-700 text-sm font-medium">
        <SignedOut>
          <Link href="/" className="hover:text-green-600 transition">
            Home
          </Link>
          <Link href="/#about" className="hover:text-green-600 transition">
            About Us
          </Link>
          <Link href="/subscribe" className="hover:text-green-600 transition">
            Pricing
          </Link>
          <Link
            href="/sign-in"
            className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
          >
            Sign Up
          </Link>
        </SignedOut>

        <SignedIn>
          <Link href="/" className="hover:text-green-600 transition">
            Home
          </Link>
          <Link href="/subscribe" className="hover:text-green-600 transition">
            Pricing
          </Link>
          <Link href="/dashboard" className="hover:text-green-600 transition">
            Dashboard
          </Link>
          <Link
            href="/parser"
            className="hover:text-green-600 transition"
            onClick={handleCvParseClick}
          >
            CvParse
          </Link>
          <Link href="/profile" className="hover:text-green-600 transition">
            Profile
          </Link>

          {user?.imageUrl ? (
            <Link href="/profile">
              <Image
                src={user.imageUrl}
                width={40}
                height={40}
                alt="profile pic"
                className="rounded-full border hover:shadow-lg transition"
              />
            </Link>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center bg-gray-300 rounded-full">
              U
            </div>
          )}

          <SignOutButton>
            <button className="bg-red-500 text-white px-3 py-2 rounded-xl hover:bg-red-600 transition">
              Sign Out
            </button>
          </SignOutButton>
        </SignedIn>
      </div>
    </motion.nav>
  );
}
