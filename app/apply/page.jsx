"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../lib/api";
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

export default function OnboardingForm() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    mobileOtp: "",
    email: "",
    emailOtp: ""
  });

  const [mobileStep, setMobileStep] = useState("input");
  const [emailStep, setEmailStep] = useState("input");

  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [mobileTimer, setMobileTimer] = useState(0);
  const [emailTimer, setEmailTimer] = useState(0);

  const [loading, setLoading] = useState(false);

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

  const sendMobileOtp = async () => {
    try {
      await axios.post(`${BASE_URL}signup-auth/send_signup_otp/`, {
        mobile: form.mobile
      });

      setMobileStep("otp");
      setMobileTimer(30);

    } catch (err) {
      alert(err?.response?.data?.error || "OTP send failed");
    }

    setMobileStep("otp");
    setMobileTimer(30);
  };

  const resendMobileOtp = async () => {
    if (mobileTimer > 0) return;

    await sendMobileOtp();
  };

  const verifyMobileOtp = async () => {
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
    }
  };

  const sendEmailOtp = async () => {
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
    }
  };

  const resendEmailOtp = async () => {
    if (emailTimer > 0) return;

    try {
      const user_id = localStorage.getItem("temp_user_id");

      await axios.post(`${BASE_URL}signup-auth/resend_signup_email_otp/`, {
        user_id
      });

      setEmailTimer(30);

    } catch (err) {
      alert("Failed to resend OTP");
    }
  };

  const verifyEmailOtp = async () => {
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

      setEmailVerified(true);

      setTimeout(() => {
        completeProfile();
      }, 500);

      alert("🎉 Signup Complete & Logged In!");

    } catch (err) {
      alert(err?.response?.data?.error || "Invalid OTP");
    }
  };

  const completeProfile = async () => {
    setLoading(true);

    const token = localStorage.getItem("access_token");

    await axios.patch(
      `${BASE_URL}users/update_profile/`,
      {
        first_name: form.name,
        email: form.email
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("🎉 Profile Completed!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">
          Create Account 🚀
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <input
              name="name"
              placeholder="Enter name as per pan card"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl"
            />

            <button
              onClick={() => setStep(2)}
              disabled={!form.name}
              className="w-full bg-indigo-600 text-white py-2 rounded-xl"
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
                  placeholder="Mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-xl"
                />

                <button
                  onClick={sendMobileOtp}
                  className="w-full bg-black text-white py-2 rounded-xl"
                >
                  Send OTP
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
                  className="w-full bg-green-600 text-white py-2 rounded-xl"
                >
                  Verify OTP
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
              <button onClick={() => setStep(1)} className="flex-1 border py-2 rounded-xl">
                Back
              </button>

              <button
                onClick={() => setStep(3)}
                disabled={!mobileVerified}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl"
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
                  className="w-full bg-black text-white py-2 rounded-xl"
                >
                  Send OTP
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
                  className="w-full bg-green-600 text-white py-2 rounded-xl"
                >
                  Verify OTP
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
              <button onClick={() => setStep(2)} className="flex-1 border py-2 rounded-xl">
                Back
              </button>

              <button
                onClick={completeProfile}
                disabled={!emailVerified || loading}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl"
              >
                Complete 🎉
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}