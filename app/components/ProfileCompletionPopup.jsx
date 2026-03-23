"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Step1Personal from "./profileupdate/Step1Personal";
import Step2Address from "./profileupdate/Step2Address";
import Step3Employment from "./profileupdate/Step3Employment";
import { useRouter } from "next/navigation";

export default function ProfileCompletionPopup({
  open,
  profileData,
  setProfileData,
  onUpdate,
  onClose,
  onComplete, 
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const next = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prev = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const steps = [
    { number: 1, title: "Personal Details", icon: "👤" },
    { number: 2, title: "Address Information", icon: "📍" },
    { number: 3, title: "Employment Details", icon: "💼" },
  ];

  const pageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      await onUpdate();

      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 500);
      } else {
        router.push("/loan-eligibility");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Complete Your Profile ⚡
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div
                key={s.number}
                className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                    ${
                      step >= s.number
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {step > s.number ? "✓" : s.icon}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded
                      ${step > s.number ? "bg-indigo-600" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between px-1 mt-2">
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

        <div className="p-6">
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
                opacity: { duration: 0.2 },
              }}
            >
              {step === 1 && (
                <Step1Personal
                  form={profileData}
                  setForm={setProfileData}
                  next={next}
                  prev={prev}
                  isPopup={true}
                />
              )}

              {step === 2 && (
                <Step2Address
                  form={profileData}
                  setForm={setProfileData}
                  next={next}
                  prev={prev}
                  isPopup={true}
                />
              )}

              {step === 3 && (
                <Step3Employment
                  form={profileData}
                  setForm={setProfileData}
                  prev={prev}
                  onSubmit={handleUpdate}
                  isSubmitting={isSubmitting}
                  isPopup={true}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
