"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/app/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneIcon, KeyIcon, XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function Step1Mobile({ form, setForm, next, setAuthToken }) {
  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (step === "otp" && timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer, canResend]);

  const validateMobile = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!validateMobile(mobile)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${BASE_URL}signup-auth/send_signup_otp/`,
        { mobile }
      );

      // Update form with mobile number
      setForm({ ...form, mobile });
      
      setStep("otp");
      setTimer(30);
      setCanResend(false);
      setSuccess("OTP sent successfully!");
      
    } catch (err) {
      const message = err.response?.data?.message || 
                     err.response?.data?.error || 
                     "Failed to send OTP";
      
      // Check if mobile is already registered
      if (message.toLowerCase().includes("already")) {
        setSuccess("Mobile number already registered. You can login directly.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(
        `${BASE_URL}signup-auth/send_signup_otp/`,
        { mobile }
      );
      
      setTimer(30);
      setCanResend(false);
      setSuccess("OTP resent successfully!");
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${BASE_URL}signup-auth/verify_signup_otp/`,
        {
          mobile,
          otp
        }
      );

      const data = response.data;
      
      // Save tokens to localStorage
      if (data.access) {
        localStorage.setItem("access_token", data.access);
        setAuthToken(data.access);
      }
      
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }
      
      if (data.username) {
        localStorage.setItem("username", data.username);
      }
      
      if (data.role) {
        localStorage.setItem("role", data.role);
      }

      setSuccess("Verification successful! Redirecting...");
      
      // Wait a moment then proceed to next step
      setTimeout(() => {
        next();
      }, 1500);

    } catch (err) {
      const message = err.response?.data?.message || 
                     err.response?.data?.error || 
                     "Invalid OTP. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Edit mobile number
  const handleEditMobile = () => {
    setStep("mobile");
    setOtp("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-4">
          {step === "mobile" ? (
            <PhoneIcon className="w-10 h-10 text-indigo-600" />
          ) : (
            <KeyIcon className="w-10 h-10 text-purple-600" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {step === "mobile" ? "Enter Mobile Number" : "Verify OTP"}
        </h2>
        <p className="text-gray-500 mt-2">
          {step === "mobile" 
            ? "We'll send you a verification code" 
            : `Enter the 6-digit code sent to ${mobile}`
          }
        </p>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-green-50 rounded-lg flex items-center gap-2 border border-green-200"
          >
            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 border border-red-200"
          >
            <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {step === "mobile" ? (
        /* Mobile Number Input */
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                setError("");
              }}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter the mobile number registered with your Aadhaar
            </p>
          </div>

          <button
            onClick={handleSendOtp}
            disabled={mobile.length !== 10 || loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send OTP"
            )}
          </button>
        </motion.div>
      ) : (
        /* OTP Input */
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              placeholder="6-digit OTP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {timer > 0 ? (
                `Resend in ${timer}s`
              ) : (
                "OTP expired"
              )}
            </span>
            <button
              onClick={handleResendOtp}
              disabled={!canResend || loading}
              className={`font-medium ${
                canResend && !loading
                  ? "text-indigo-600 hover:text-indigo-800"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              Resend OTP
            </button>
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6 || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify & Continue"
            )}
          </button>

          <button
            onClick={handleEditMobile}
            disabled={loading}
            className="text-sm text-gray-500 hover:text-gray-700 w-full mt-2"
          >
            ← Edit Mobile Number
          </button>
        </motion.div>
      )}
    </div>
  );
}