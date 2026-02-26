"use client";
import NextImage from "next/image";
import { useState } from "react";
import EmailLogin from "./emaillogin";
import MobileOtpLogin from "./mobilepage";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("email");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e7ff] to-[#f8fafc] p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Image Section - Fixed for proper image display */}
        <div className="relative flex flex-col justify-center items-center text-white text-center bg-[#112772] min-h-[250px] md:min-h-[300px]">
          {/* Image with proper containment */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <NextImage
              src="/image/lms.jpg"
              alt="Login Visual"
              width={300}
              height={200}
              className="object-contain w-auto h-auto max-w-full max-h-full"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#112772]/90 via-[#112772]/70 to-transparent"></div>
          <div className="relative z-10 px-4">
            <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-wide">
              Welcome Back!
            </h2>
            <p className="text-xs md:text-sm max-w-sm mx-auto text-gray-200">
              Log in to access all features
            </p>
          </div>
        </div>

        {/* Right Login Section */}
        <div className="p-6 md:p-8 bg-white flex flex-col justify-center">
          {/* Tabs */}
          <div className="flex mb-4 border-b border-gray-200">
            <button
              className={`flex-1 py-2 text-sm font-semibold transition-all duration-300 ${
                activeTab === "email"
                  ? "text-[#112772] border-b-2 border-[#112772]"
                  : "text-gray-500 hover:text-[#112772]"
              }`}
              onClick={() => setActiveTab("email")}
            >
              Email Login
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold transition-all duration-300 ${
                activeTab === "mobileOtp"
                  ? "text-[#112772] border-b-2 border-[#112772]"
                  : "text-gray-500 hover:text-[#112772]"
              }`}
              onClick={() => setActiveTab("mobileOtp")}
            >
              Mobile OTP
            </button>
          </div>

          {/* Login Form Container */}
          <div className="animate-fadeIn">
            {activeTab === "email" && <EmailLogin />}
            {activeTab === "mobileOtp" && <MobileOtpLogin />}
          </div>

          {/* Footer */}
          <p className="text-center text-gray-400 text-xs mt-4">
            © {new Date().getFullYear()} Your Company Name. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}