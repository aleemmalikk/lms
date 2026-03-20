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

  const showPopup = (message, type, showLoginButton = false) => {
    setPopup({
      show: true,
      message,
      type,
      showLoginButton,
    });

    // Agar success hai to 3 sec baad popup band karo
    // Error aur login button wala popup manually band hoga
    if (type === "success") {
      setTimeout(() => {
        setPopup((prev) => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  // Login button click handler
  const goToLogin = () => {
    setPopup({ show: false, message: "", type: "", showLoginButton: false });
    router.push('/login'); // Apne login page ke route se replace karein
  };

  const sendMobileOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}signup-auth/send_signup_otp/`, {
        mobile: form.mobile
      });

      // Agar successful hai to hi OTP screen dikhao
      setMobileStep("otp");
      setMobileTimer(30);
      
    } catch (err) {
      // Check karo agar mobile already registered hai
      const errorMessage = err?.response?.data?.error || "OTP send failed";
      
      if (errorMessage.toLowerCase().includes("already registered") || 
          errorMessage.toLowerCase().includes("already exists")) {
        
        // Popup dikhao login button ke saath
        showPopup(
          "This mobile number is already registered. Please login to continue.",
          "error",
          true // showLoginButton = true
        );
        
      } else {
        // Kisi aur error ke liye simple alert
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendMobileOtp = async () => {
    if (mobileTimer > 0) return;
    await sendMobileOtp();
  };

  const verifyMobileOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}signup-auth/verify_signup_otp/`,
        {
          mobile: form.mobile,
          otp: form.mobileOtp
        }
      );

      localStorage.setItem("temp_user_id", res.data.user_id);

      setMobileVerified(true);
      setTimeout(() => setStep(3), 500);

    } catch (err) {
      alert(err?.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const sendEmailOtp = async () => {
    setLoading(true);
    try {
      const user_id = localStorage.getItem("temp_user_id");

      await axios.post(`${BASE_URL}signup-auth/send_signup_email_otp/`, {
        email: form.email,
        user_id
      });

      setEmailStep("otp");
      setEmailTimer(30);

    } catch (err) {
      alert(err?.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendEmailOtp = async () => {
    if (emailTimer > 0) return;

    setLoading(true);
    try {
      const user_id = localStorage.getItem("temp_user_id");

      await axios.post(`${BASE_URL}signup-auth/resend_signup_email_otp/`, {
        user_id
      });

      setEmailTimer(30);

    } catch (err) {
      alert("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    setLoading(true);
    try {
      const user_id = localStorage.getItem("temp_user_id");

      const res = await axios.post(
        `${BASE_URL}signup-auth/verify_signup_email_otp/`,
        {
          email: form.email,
          otp: form.emailOtp,
          user_id
        }
      );

      localStorage.setItem("access_token", res.data.access);
      
      // Agar response mein refresh token bhi aata hai to use bhi save karo
      if (res.data.refresh) {
        localStorage.setItem("refresh_token", res.data.refresh);
      }

      setEmailVerified(true);

      setTimeout(() => {
        completeProfile();
      }, 500);

    } catch (err) {
      alert(err?.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

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

      // 🔥 IMPORTANT: Save user role in localStorage
      // Check different possible paths for role in response
      let userRole = 'user'; // default role
      
      if (response.data.role) {
        userRole = response.data.role;
      } else if (response.data.user && response.data.user.role) {
        userRole = response.data.user.role;
      } else if (response.data.user_role) {
        userRole = response.data.user_role;
      } else if (response.data.data && response.data.data.role) {
        userRole = response.data.data.role;
      }
      
      // Save role to localStorage
      localStorage.setItem("user_role", userRole);

      window.dispatchEvent(new Event("userLoggedIn"));
      
      // Optional: Save full user data
      localStorage.setItem("user_data", JSON.stringify(response.data));
      
      // Save user ID if available
      if (response.data.id) {
        localStorage.setItem("user_id", response.data.id);
      } else if (response.data.user && response.data.user.id) {
        localStorage.setItem("user_id", response.data.user.id);
      }

      // Log for debugging (remove in production)
      console.log("User Role Saved:", userRole);
      console.log("Full Response:", response.data);

      showPopup(
        response.data.message ||
          response.data.detail ||
          "Profile Completed! 🎉",
        "success",
      );

      // Redirect to dashboard after successful profile completion
      setTimeout(() => {
        // Role-based redirection
        if (userRole === 'admin') {
          router.push('/admin/dashboard');
        } else if (userRole === 'vendor' || userRole === 'seller') {
          router.push('/vendor/dashboard');
        } else {
          router.push('/'); // or '/dashboard' for regular users
        }
      }, 2000);

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
              
              {/* Close button */}
              <button 
                onClick={() => setPopup({ ...popup, show: false })}
                className="hover:bg-white/20 rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Login Button - sirf tab dikhega jab mobile already registered ho */}
            {popup.showLoginButton && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={goToLogin}
                  className="bg-white text-red-500 font-semibold py-2 px-4 rounded-lg 
                                hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
                >
                  <LogIn size={18} />
                  Go to Login
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
              placeholder="Enter Name Link With PAN CARD"
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
                  placeholder="Mobile Number Link With Aadhar Card"
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
                      disabled={loading}
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
                      disabled={loading}
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