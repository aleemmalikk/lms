"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../lib/api";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  X,
  LogIn,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    mobileOtp: "",
    email: "",
    emailOtp: "",
  });

  const [mobileStep, setMobileStep] = useState("input");
  const [emailStep, setEmailStep] = useState("input");

  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [mobileTimer, setMobileTimer] = useState(0);
  const [emailTimer, setEmailTimer] = useState(0);

  const [loading, setLoading] = useState(false);

  // Popup state
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "", // 'success', 'error', ya 'login'
    showLoginButton: false,
  });

  // ⏱ TIMER EFFECT
  useEffect(() => {
    if (mobileTimer > 0) {
      const t = setTimeout(() => setMobileTimer(mobileTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [mobileTimer]);

  useEffect(() => {
    if (emailTimer > 0) {
      const t = setTimeout(() => setEmailTimer(emailTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [emailTimer]);

  // Popup auto-hide effect - sirf non-login popups ke liye
  useEffect(() => {
    if (popup.show && !popup.showLoginButton) {
      const timer = setTimeout(() => {
        setPopup({
          show: false,
          message: "",
          type: "",
          showLoginButton: false,
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.show, popup.showLoginButton]);

  // INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    let v = value;

    if (name === "mobile") {
      v = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "mobileOtp" || name === "emailOtp") {
      v = value.replace(/\D/g, "").slice(0, 6);
    }

    setForm((p) => ({ ...p, [name]: v }));
  };

  // Popup helper function
  const showPopup = (message, type, showLoginButton = false) => {
    setPopup({ show: true, message, type, showLoginButton });
  };

  // Login page par redirect
  const goToLogin = () => {
    router.push("/login"); // Apne login route ke according change karein
  };

  // 📱 SEND OTP
  const sendMobileOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}signup-auth/send_signup_otp/`,
        {
          mobile: form.mobile,
        },
      );

      showPopup(
        response.data.message || response.data.detail || "OTP sent!",
        "success",
      );

      setMobileStep("otp");
      setMobileTimer(30);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Something went wrong";

      // Check if mobile is already registered
      if (
        errorMessage.toLowerCase().includes("already registered") ||
        errorMessage.toLowerCase().includes("already exists") ||
        error.response?.status === 400
      ) {
        showPopup(errorMessage + "! Please login to continue.", "error", true);
      } else {
        showPopup(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RESEND MOBILE OTP
  const resendMobileOtp = async () => {
    if (mobileTimer > 0) return;
    await sendMobileOtp();
  };

  // VERIFY MOBILE
  const verifyMobileOtp = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${BASE_URL}signup-auth/verify_signup_otp/`,
        {
          mobile: form.mobile,
          otp: form.mobileOtp,
        },
      );

      if (res.data.access) {
        localStorage.setItem("access_token", res.data.access);
      }

      showPopup(
        res.data.message || res.data.detail || "Mobile verified!",
        "success",
      );
      setMobileVerified(true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Verification failed";
      showPopup(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // 📧 SEND EMAIL OTP
  const sendEmailOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}send-email-otp/`, {
        email: form.email,
      });

      showPopup(
        response.data.message || response.data.detail || "OTP sent to email!",
        "success",
      );
      setEmailStep("otp");
      setEmailTimer(30);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to send OTP";
      showPopup(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RESEND EMAIL OTP
  const resendEmailOtp = async () => {
    if (emailTimer > 0) return;
    await sendEmailOtp();
  };

  // VERIFY EMAIL
  const verifyEmailOtp = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}verify-email-otp/`, {
        email: form.email,
        otp: form.emailOtp,
      });

      if (res.data.success) {
        showPopup(
          res.data.message || res.data.detail || "Email verified!",
          "success",
        );
        setEmailVerified(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Invalid OTP";
      showPopup(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // FINAL
  const completeProfile = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.patch(
        `${BASE_URL}users/update_profile/`,
        {
          first_name: form.name,
          email: form.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      showPopup(
        response.data.message ||
          response.data.detail ||
          "Profile Completed! 🎉",
        "success",
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to complete profile";
      showPopup(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative">
        {/* Custom Popup */}
        {popup.show && (
          <div
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown
            ${popup.type === "error" ? "bg-red-500" : "bg-green-500"} 
            text-white px-6 py-4 rounded-lg shadow-lg flex flex-col gap-3 min-w-[320px]`}
          >
            <div className="flex items-center gap-2">
              {popup.type === "error" ? (
                <AlertCircle size={20} />
              ) : (
                <CheckCircle size={20} />
              )}
              <span className="flex-1">{popup.message}</span>
            </div>

            {/* Login Button - sirf tab dikhega jab mobile already registered ho */}
            {popup.showLoginButton && (
              <div className="flex justify-end">
                <button
                  onClick={goToLogin}
                  className="bg-white text-red-500 font-semibold py-2 px-4 rounded-lg 
                                hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        )}

        <h2 className="text-2xl font-bold text-center mb-6">
          Create Account 🚀
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <input
              name="name"
              placeholder="Enter name link with PAN Card"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl"
            />

            <button
              onClick={() => setStep(2)}
              disabled={!form.name}
              className="w-full bg-indigo-600 text-white py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2 MOBILE */}
        {step === 2 && (
          <div className="space-y-4">
            {mobileStep === "input" && (
              <>
                <input
                  name="mobile"
                  placeholder="Mobile number link with Aadhar Card"
                  value={form.mobile}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-xl"
                />

                <button
                  onClick={sendMobileOtp}
                  disabled={form.mobile.length !== 10 || loading}
                  className="w-full bg-black text-white py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {mobileStep === "otp" && (
              <>
                <input
                  name="mobileOtp"
                  placeholder="Enter OTP"
                  value={form.mobileOtp}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-xl text-center"
                />

                <button
                  onClick={verifyMobileOtp}
                  disabled={form.mobileOtp.length !== 6 || loading}
                  className="w-full bg-green-600 text-white py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                {/* 🔥 RESEND UI */}
                <div className="text-center text-sm mt-2">
                  {mobileTimer > 0 ? (
                    <span className="text-gray-500">
                      Resend in {mobileTimer}s
                    </span>
                  ) : (
                    <button
                      onClick={resendMobileOtp}
                      className="text-indigo-600 font-medium"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </>
            )}

            {mobileVerified && (
              <p className="text-green-600 text-sm flex items-center gap-1">
                <CheckCircle size={16} /> Verified
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border py-2 rounded-xl"
              >
                Back
              </button>

              <button
                onClick={() => setStep(3)}
                disabled={!mobileVerified}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 EMAIL */}
        {step === 3 && (
          <div className="space-y-4">
            {emailStep === "input" && (
              <>
                <input
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-xl"
                />

                <button
                  onClick={sendEmailOtp}
                  disabled={!form.email || loading}
                  className="w-full bg-black text-white py-2 rounded-xl disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {emailStep === "otp" && (
              <>
                <input
                  name="emailOtp"
                  placeholder="OTP"
                  value={form.emailOtp}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-xl text-center"
                />

                <button
                  onClick={verifyEmailOtp}
                  disabled={form.emailOtp.length !== 6 || loading}
                  className="w-full bg-green-600 text-white py-2 rounded-xl disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                {/* 🔥 RESEND */}
                <div className="text-center text-sm mt-2">
                  {emailTimer > 0 ? (
                    <span className="text-gray-500">
                      Resend in {emailTimer}s
                    </span>
                  ) : (
                    <button
                      onClick={resendEmailOtp}
                      className="text-indigo-600 font-medium"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </>
            )}

            {emailVerified && (
              <p className="text-green-600 text-sm flex items-center gap-1">
                <CheckCircle size={16} /> Verified
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border py-2 rounded-xl"
              >
                Back
              </button>

              <button
                onClick={completeProfile}
                disabled={!emailVerified || loading}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl disabled:opacity-50"
              >
                {loading ? "Completing..." : "Complete 🎉"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
