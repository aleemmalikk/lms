"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { postWithAuth } from "../lib/api";

export default function PinSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const pinInputs = useRef([]);
  const confirmPinInputs = useRef([]);

  useEffect(() => {
    if (pinInputs.current[0]) pinInputs.current[0].focus();
  }, []);

  const handlePinChange = (value, index) => {
    if (isNaN(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    
    if (value && index < 3) {
      pinInputs.current[index + 1].focus();
    }
  };

  const handleConfirmPinChange = (value, index) => {
    if (isNaN(value)) return;
    
    const newConfirmPin = [...confirmPin];
    newConfirmPin[index] = value;
    setConfirmPin(newConfirmPin);
    
    if (value && index < 3) {
      confirmPinInputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index, type) => {
    if (e.key === "Backspace") {
      if (type === 'pin') {
        if (!pin[index] && index > 0) {
          pinInputs.current[index - 1].focus();
        } else if (pin[index]) {
          const newPin = [...pin];
          newPin[index] = "";
          setPin(newPin);
        }
      } else {
        if (!confirmPin[index] && index > 0) {
          confirmPinInputs.current[index - 1].focus();
        } else if (confirmPin[index]) {
          const newConfirmPin = [...confirmPin];
          newConfirmPin[index] = "";
          setConfirmPin(newConfirmPin);
        }
      }
    }
  };

  const handleSetPin = () => {
    const enteredPin = pin.join("");
    if (enteredPin.length !== 4) {
      setMessage("Please enter a complete 4-digit PIN");
      return;
    }
    setStep(2);
    setTimeout(() => {
      if (confirmPinInputs.current[0]) confirmPinInputs.current[0].focus();
    }, 100);
  };

  const handleConfirmPin = async () => {
    const enteredPin = pin.join("");
    const enteredConfirmPin = confirmPin.join("");

    if (enteredPin !== enteredConfirmPin) {
      setMessage("PINs do not match. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await postWithAuth("wallets/set_pin/", {
        pin: enteredPin,
        confirm_pin: enteredConfirmPin
      });

      if (response.message) {
        // Mark first time setup as complete
        try {
          await postWithAuth("auth/complete_first_time_setup/", {});
        } catch (e) {
          console.log("First time setup API might not exist");
        }
        
        // Redirect to home
        router.push("/");
      }
    } catch (err) {
      console.error("Set PIN Error:", err);
      setMessage(err.message || "Failed to set PIN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isPinComplete = pin.every(digit => digit !== "");
  const isConfirmPinComplete = confirmPin.every(digit => digit !== "");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          {step === 1 ? "Set Wallet PIN" : "Confirm PIN"}
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          {step === 1 
            ? "Create a 4-digit PIN to secure your wallet"
            : "Please confirm your 4-digit PIN"
          }
        </p>

        {/* PIN Inputs */}
        <div className="flex justify-center gap-3 mb-6">
          {(step === 1 ? pin : confirmPin).map((digit, index) => (
            <input
              key={index}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => step === 1 
                ? handlePinChange(e.target.value, index)
                : handleConfirmPinChange(e.target.value, index)
              }
              onKeyDown={(e) => step === 1 
                ? handleKeyDown(e, index, 'pin')
                : handleKeyDown(e, index, 'confirm')
              }
              ref={(el) => step === 1 
                ? (pinInputs.current[index] = el)
                : (confirmPinInputs.current[index] = el)
              }
              className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg text-lg font-bold focus:border-[#112772] focus:outline-none"
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={step === 1 ? handleSetPin : handleConfirmPin}
            disabled={(step === 1 ? !isPinComplete : !isConfirmPinComplete) || loading}
            className="w-full py-3 bg-[#112772] text-white rounded-lg font-semibold hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : step === 1 ? "Continue" : "Set PIN"}
          </button>

          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="w-full py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
          )}
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes("Failed") || message.includes("match") || message.includes("error")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}