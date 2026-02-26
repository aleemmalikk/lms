"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { post, postWithAuth, storeUserData, validateLoginAccess } from "../lib/api";

export default function OTPPage() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [pinData, setPinData] = useState({
    pin: new Array(4).fill(""),
    confirmPin: new Array(4).fill(""),
    otp: ""
  });
  const [pinStep, setPinStep] = useState(1);
  const inputs = useRef([]);
  const pinInputs = useRef([]);
  const confirmPinInputs = useRef([]);
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      router.push("/login");
      return;
    }
    if (inputs.current[0]) inputs.current[0].focus();
  }, [router]);

  // Enhanced role-based redirect with validation
  const handleRoleBasedRedirect = (userRole) => {
    console.log('🔄 Redirecting based on role:', userRole);

    // Validate if this role can login to this portal
    const accessCheck = validateLoginAccess(userRole);

    if (!accessCheck.allowed) {
      if (accessCheck.redirectUrl.startsWith('http')) {
        // External URL - use window.location
        alert(`🔐 ${accessCheck.message}. Redirecting to admin panel...`);
        window.location.href = accessCheck.redirectUrl;
      } else {
        // Internal route - use router
        alert(`❌ ${accessCheck.message}`);
        router.replace(accessCheck.redirectUrl);
      }
      return false;
    }

    // Proceed with normal redirection for allowed roles
    switch (userRole?.toLowerCase()) {
      case 'admin':
        router.replace("/admin");
        break;
      case 'dealer':
        router.replace("/dealer");
        break;
      case 'master':
        router.replace("/master");
        break;
      case 'retailer':
      default:
        router.replace("/");
        break;
    }
    return true;
  };

  // OTP Functions
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value && index < 5) inputs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) inputs.current[index - 1].focus();
      else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };


  const handleResendOtp = async () => {
    const username = localStorage.getItem("username");

    if (!username) {
      alert("Username missing. Please login again.");
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      // 🔥 SAME API AS LOGIN (resend OTP)
      const response = await post("auth/login/", {
        username,
        password: localStorage.getItem("temp_password") // important
      });

      alert("OTP resent successfully");

      // Clear old OTP boxes
      setOtp(new Array(6).fill(""));
      if (inputs.current[0]) inputs.current[0].focus();

    } catch (err) {
      console.error("❌ Resend OTP Error:", err);
      alert("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    const numbersOnly = pasteData.replace(/\D/g, "");
    if (numbersOnly.length === 6) {
      const otpArray = numbersOnly.split("").slice(0, 6);
      setOtp(otpArray);
      if (inputs.current[5]) inputs.current[5].focus();
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join("").trim();
    const username = localStorage.getItem("username");

    if (!enteredOtp || enteredOtp.length < 6) {
      alert("Please enter the full 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await post("auth/verify_otp/", {
        username,
        otp: enteredOtp,
      });

      console.log("✅ OTP Verification Response:", response);

      if (response.access && response.refresh) {
        // ✅ Store user data properly
        storeUserData({
          ...response,
          username: username // Ensure username is included
        });

        // Wait for localStorage to be updated
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log("✅ User data stored after OTP verification");

        // Check if user needs to set PIN
        if (response.needs_pin_setup || !response.is_pin_set) {
          setShowSetPin(true);
        } else {
          // Redirect based on role with validation
          const userRole = response.user?.role || response.role || localStorage.getItem("user_role");
          console.log("🎭 User Role after OTP:", userRole);

          if (userRole) {
            handleRoleBasedRedirect(userRole);
          } else {
            alert("Unable to determine user role. Please contact support.");
          }
        }
      } else {
        alert(response.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("❌ OTP Verification Error:", err);
      alert("Something went wrong during OTP verification");
    } finally {
      setLoading(false);
    }
  };

  // PIN Setup Functions (keep existing PIN functions the same)
  const handlePinChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newPin = [...pinData.pin];
    newPin[index] = element.value;
    setPinData({ ...pinData, pin: newPin });
    if (element.value && index < 3) pinInputs.current[index + 1].focus();
  };

  const handleConfirmPinChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newConfirmPin = [...pinData.confirmPin];
    newConfirmPin[index] = element.value;
    setPinData({ ...pinData, confirmPin: newConfirmPin });
    if (element.value && index < 3) confirmPinInputs.current[index + 1].focus();
  };

  const handlePinKeyDown = (e, index, type) => {
    if (e.key === "Backspace") {
      if (type === 'pin') {
        if (!pinData.pin[index] && index > 0) pinInputs.current[index - 1].focus();
        else if (pinData.pin[index]) {
          const newPin = [...pinData.pin];
          newPin[index] = "";
          setPinData({ ...pinData, pin: newPin });
        }
      } else {
        if (!pinData.confirmPin[index] && index > 0) confirmPinInputs.current[index - 1].focus();
        else if (pinData.confirmPin[index]) {
          const newConfirmPin = [...pinData.confirmPin];
          newConfirmPin[index] = "";
          setPinData({ ...pinData, confirmPin: newConfirmPin });
        }
      }
    }
  };

  const handleSetPin = () => {
    const enteredPin = pinData.pin.join("");

    if (enteredPin.length !== 4) {
      alert("Please enter a 4-digit PIN");
      return;
    }

    setPinStep(2);
    setTimeout(() => {
      if (confirmPinInputs.current[0]) confirmPinInputs.current[0].focus();
    }, 100);
  };

  const handleConfirmPin = async () => {
    const enteredPin = pinData.pin.join("");
    const enteredConfirmPin = pinData.confirmPin.join("");

    if (enteredPin !== enteredConfirmPin) {
      alert("PINs do not match. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const setPinResponse = await postWithAuth("wallets/set_pin/", {
        pin: enteredPin,
        confirm_pin: enteredConfirmPin
      });

      if (setPinResponse.message) {
        await completeSetup();
      }
    } catch (err) {
      console.error("Set PIN Error:", err);
      alert(err.message || "Failed to set PIN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completeSetup = async () => {
    try {
      await post("auth/complete_first_time_setup/", {});
    } catch (e) {
      console.log("First time setup API might not exist, continuing...");
    }

    // Redirect based on role after PIN setup with validation
    const userRole = localStorage.getItem("user_role");
    console.log("🎭 User Role after PIN setup:", userRole);
    handleRoleBasedRedirect(userRole);
  };

  const isOtpComplete = otp.every((digit) => digit !== "");
  const isPinComplete = pinData.pin.every((digit) => digit !== "");
  const isConfirmPinComplete = pinData.confirmPin.every((digit) => digit !== "");

  // If PIN setup is shown, render PIN setup UI
  if (showSetPin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 px-3 sm:px-4">
        <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-6 w-full max-w-sm text-center border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            {pinStep === 1 ? "Set Your Wallet PIN" : "Confirm Your PIN"}
          </h2>
          <p className="mb-4 text-gray-600 text-sm font-medium">
            {pinStep === 1
              ? "Create a 4-digit PIN to secure your wallet transactions"
              : "Please confirm your 4-digit PIN"
            }
          </p>

          {/* PIN Input Fields */}
          <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-5">
            {(pinStep === 1 ? pinData.pin : pinData.confirmPin).map((data, index) => (
              <input
                key={index}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={data}
                onChange={(e) => pinStep === 1
                  ? handlePinChange(e.target, index)
                  : handleConfirmPinChange(e.target, index)
                }
                onKeyDown={(e) => pinStep === 1
                  ? handlePinKeyDown(e, index, 'pin')
                  : handlePinKeyDown(e, index, 'confirm')
                }
                ref={(el) => pinStep === 1
                  ? (pinInputs.current[index] = el)
                  : (confirmPinInputs.current[index] = el)
                }
                className="w-11 h-12 text-center border border-gray-400 rounded-md text-lg font-semibold 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                autoComplete="off"
              />
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={pinStep === 1 ? handleSetPin : handleConfirmPin}
            disabled={(pinStep === 1 ? !isPinComplete : !isConfirmPinComplete) || loading}
            className={`w-full py-3 text-white rounded-md transition-all duration-200 font-semibold
              ${(pinStep === 1 ? !isPinComplete : !isConfirmPinComplete) || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
              }`}
          >
            {loading
              ? "Setting PIN..."
              : pinStep === 1
                ? "Continue"
                : "Set PIN"}
          </button>

          {/* Back Button for Confirm Step */}
          {pinStep === 2 && (
            <button
              onClick={() => {
                setPinStep(1);
                setTimeout(() => {
                  if (pinInputs.current[0]) pinInputs.current[0].focus();
                }, 100);
              }}
              className="w-full mt-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Back
            </button>
          )}
        </div>
      </div>
    );
  }

  // Original OTP Page UI
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 px-3 sm:px-4">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-6 w-full max-w-sm text-center border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
          Enter OTP
        </h2>
        <p className="mb-4 text-gray-600 text-sm font-medium">
          We've sent a 6-digit OTP to your registered email
        </p>

        {/* OTP Input Fields */}
        <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-5">
          {otp.map((data, index) => (
            <input
              key={index}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              ref={(el) => (inputs.current[index] = el)}
              className="w-9 h-11 sm:w-11 sm:h-12 text-center border border-gray-400 rounded-md text-base sm:text-lg font-semibold 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isOtpComplete || loading}
          className={`w-full py-2.5 sm:py-3 text-white rounded-md transition-all duration-200 font-semibold
            ${!isOtpComplete || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
            }`}
        >
          {loading
            ? "Verifying..."
            : isOtpComplete
              ? "Verify OTP"
              : "Enter 6-digit OTP"}
        </button>

        {/* Help Text */}
        {!isOtpComplete && (
          <p className="mt-3 text-xs text-gray-500">
            Please fill in all six boxes to continue
          </p>
        )}

        <div className="mt-5">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {loading ? "Resending..." : "Resend"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}