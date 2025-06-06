"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white py-16 px-6">
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Brand Intro */}
        <div className="col-span-1">
          <h3 className="text-2xl font-bold mb-4">CvParse</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Instantly transform resumes into clean, structured JSON. Designed
            for recruiters, ATS platforms, and developers who need accurate,
            customizable resume data.
          </p>
        </div>

        {/* Product Links */}
        <div>
          <h4 className="font-semibold mb-3 text-lg">Product</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/subscribe" className="hover:text-white transition">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-white transition">
                Features
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-white transition">
                Use Cases
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-semibold mb-3 text-lg">Resources</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-white transition">
                API Documentation
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-white transition">
                Guides & Tutorials
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-white transition">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-white transition">
                Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold mb-3 text-lg">Company</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-white transition">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-white transition">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-white transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-white transition">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="text-center text-gray-500 text-sm mt-16 border-t border-gray-800 pt-6">
        © 2025 CvParse — All rights reserved. Built with ❤️ using Next.js &
        Tailwind CSS.
      </div>
    </footer>
  );
}
