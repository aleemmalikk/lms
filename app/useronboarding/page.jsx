"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getWithAuth } from "@/app/lib/api";

import Step1Mobile from "./Step1Mobile";
import Step2Personal from "./Step2Personal";
import Step3Address from "./Step3Address";
import Step4Employment from "./Step4Employment";

export default function OnboardingForm() {
  const [loading, setLoading] = useState(true);
  const [showOnboard, setShowOnboard] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [authToken, setAuthToken] = useState(null);

  const [form, setForm] = useState({
    mobile: "",
    otp: "",
    name: "",
    dob: "",
    pan: "",
    pincode: "",
    city: "",
    state: "",
    address: "",
    employmentType: "",
    companyName: "",
    monthlyIncome: "",
    profession: "",
    annualIncome: "",
    businessName: "",
    annualTurnover: "",
    aadhaar: ""
  });

  // Check user authentication and onboarding status
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("access_token");
        
        if (!token) {
          // No token means new user - show onboarding
          setShowOnboard(true);
          setLoading(false);
          return;
        }

        setAuthToken(token);

        // Check if user profile exists
        const response = await getWithAuth("users/update_profile/");
        
        // If we get here without error, user exists
        // Check if profile is complete based on response
        if (response && response.onboarded === true) {
          setShowOnboard(false); // Already onboarded
        } else {
          setShowOnboard(true); // Need to complete onboarding
        }
      } catch (error) {
        console.log('Error checking user:', error);
        
        // Check if error is because profile doesn't exist
        if (error.response?.status === 404 || 
            error.response?.data?.detail?.includes("not found")) {
          setShowOnboard(true); // New user needs onboarding
        } else {
          // For other errors, still show onboarding
          setShowOnboard(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const next = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prev = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const steps = [
    { number: 1, title: "Mobile Verification", icon: "📱" },
    { number: 2, title: "Personal Details", icon: "👤" },
    { number: 3, title: "Address Information", icon: "📍" },
    { number: 4, title: "Employment Details", icon: "💼" }
  ];

  const pageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!showOnboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Profile Already Completed
          </h2>
          <p className="text-gray-600 mb-6">
            Your onboarding is already completed. You can now access your dashboard.
          </p>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Join thousands of professionals on our platform
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, index) => (
              <div
                key={s.number}
                className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${
                    step >= s.number
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step > s.number ? "✓" : s.icon}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded
                    ${
                      step > s.number
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between px-2">
            {steps.map((s) => (
              <span
                key={s.number}
                className={`text-xs font-medium ${
                  step >= s.number ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="w-full"
            >
              {step === 1 && (
                <Step1Mobile 
                  form={form} 
                  setForm={setForm} 
                  next={next}
                  setAuthToken={setAuthToken}
                />
              )}

              {step === 2 && (
                <Step2Personal 
                  form={form} 
                  setForm={setForm} 
                  next={next} 
                  prev={prev} 
                />
              )}

              {step === 3 && (
                <Step3Address 
                  form={form} 
                  setForm={setForm} 
                  next={next} 
                  prev={prev} 
                />
              )}

              {step === 4 && (
                <Step4Employment 
                  form={form} 
                  setForm={setForm} 
                  prev={prev}
                  authToken={authToken}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Secured by 256-bit encryption • Your data is safe with us
          </p>
        </div>
      </div>
    </div>
  );
}
