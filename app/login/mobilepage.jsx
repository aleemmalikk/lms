"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { post } from "../lib/api.jsx";

export default function MobileOtpLogin() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!mobile) {
      setMessage("Please enter mobile number");
      return;
    }

    if (mobile.length !== 10) {
      setMessage("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await post("auth/send_mobile_otp/", {
        mobile: mobile,
      });

      console.log("Send OTP Response:", response);

      if (response.message || response.success) {
        setStep(2);
        setMessage("OTP sent successfully to your mobile");
      } else {
        setMessage(response.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP Error:", err);
      setMessage(
        err.response?.data?.error || err.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setMessage("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await post("auth/verify_mobile_otp/", {
        mobile: mobile,
        otp: otp,
      });

      console.log("Verify OTP Response:", response);

      if (response.access && response.refresh) {
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
        localStorage.setItem("username", response.username);
        localStorage.setItem("user_id", response.user_id);
        localStorage.setItem("user_role", response.role);
        localStorage.setItem("user_mobile", response.mobile || mobile);

        if (response.needs_pin_setup || !response.is_pin_set) {
          router.push("/");
        } else {
          const userRole = response.role;
          if (userRole === "admin" || userRole === "superadmin") {
            router.push("/admin");
          } else if (userRole === "dealer") {
            router.push("/dealer");
          } else if (userRole === "master") {
            router.push("/master");
          } else {
            router.push("/");
          }
        }
      } else {
        setMessage(response.error || "OTP verification failed");
      }
    } catch (err) {
      console.error("Verify OTP Error:", err);
      setMessage(
        err.response?.data?.error ||
          err.message ||
          "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await post("auth/resend_mobile_otp/", {
        mobile: mobile,
      });

      if (response.message || response.success) {
        setMessage("OTP resent successfully");
        setOtp("");
      } else {
        setMessage(response.error || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("Resend OTP Error:", err);
      setMessage(
        err.response?.data?.error || err.message || "Failed to resend OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(value);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="space-y-6 w-full">
      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="flex">
              <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                <span className="text-gray-600">+91</span>
              </div>
              <input
                type="tel"
                value={mobile}
                onChange={handleMobileChange}
                placeholder="Enter 10-digit mobile number"
                className=" text-black w-full px-4 py-3 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-[#112772] focus:border-transparent"
                required
                maxLength={10}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your 10-digit mobile number
            </p>
          </div>

          <button
            onClick={handleSendOtp}
            disabled={loading || mobile.length !== 10}
            className=" text-black w-full py-3 bg-[#112772] text-white font-medium rounded-md hover:bg-blue-900 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Enter OTP sent to +91 {mobile}
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit OTP"
              className=" text-black w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#112772] focus:border-transparent text-center text-lg font-semibold"
              required
              maxLength={6}
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setMessage("");
              }}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex-1 py-3 bg-[#112772] text-white font-medium rounded-md hover:bg-blue-900 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="text-sm text-[#112772] hover:underline font-semibold disabled:opacity-50"
            >
              {loading ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      {message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            message.toLowerCase().includes("failed") ||
            message.toLowerCase().includes("error") ||
            message.toLowerCase().includes("invalid") ||
            message.toLowerCase().includes("wrong")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
