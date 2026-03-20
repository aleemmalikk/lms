"use client";

import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/app/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function Step3Employment({ form, setForm, prev, authToken }) {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Get employment fields based on type
  const getEmploymentFields = () => {
    switch (form.employmentType) {
      case "salaried":
        return [
          { name: "companyName", label: "Company Name", type: "text" },
          { name: "monthlyIncome", label: "Monthly Income (₹)", type: "number" },
          { name: "profession", label: "Profession", type: "text" }
        ];

      case "self_employed":
        return [
          { name: "profession", label: "Profession", type: "text" },
          { name: "annualIncome", label: "Annual Income (₹)", type: "number" },
          { name: "businessName", label: "Business Name", type: "text" }
        ];

      case "business":
        return [
          { name: "businessName", label: "Business Name", type: "text" },
          { name: "annualTurnover", label: "Annual Turnover (₹)", type: "number" },
          { name: "companyName", label: "Company Name", type: "text" }
        ];

      default:
        return [];
    }
  };

  // Validate Aadhaar
  const validateAadhaar = (value) => {
    if (!value) return "Aadhaar number is required";
    if (!/^\d{12}$/.test(value)) return "Aadhaar must be exactly 12 digits";
    return "";
  };

  // Validate field
  const validateField = (name, value) => {
    if (!value || value.trim() === "") return `${name} is required`;

    if (name.toLowerCase().includes("income") || name.toLowerCase().includes("turnover")) {
      const num = Number(value);
      if (isNaN(num) || num <= 0) return "Please enter a valid amount";
    }

    return "";
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format Aadhaar input
    const formattedValue = name === "aadhaar"
      ? value.replace(/\D/g, "").slice(0, 12)
      : value;

    setForm({ ...form, [name]: formattedValue });

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validate entire form
  const validateForm = () => {
    let newErrors = {};

    // Validate employment type
    if (!form.employmentType) {
      newErrors.employmentType = "Please select employment type";
    }

    // Validate employment fields
    const fields = getEmploymentFields();
    fields.forEach((field) => {
      const error = validateField(field.label, form[field.name] || "");
      if (error) newErrors[field.name] = error;
    });

    // Validate Aadhaar
    const aadhaarError = validateAadhaar(form.aadhaar);
    if (aadhaarError) newErrors.aadhaar = aadhaarError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit profile
  const handleSubmit = async () => {
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get token from localStorage if not passed as prop
      const token = authToken || localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      // Prepare payload according to API requirements
      const payload = {
        first_name: form.name.split(" ")[0],
        last_name: form.name.split(" ")[1] || "",
        pan_number: form.pan,
        aadhar_number: form.aadhaar,
        date_of_birth: form.dob,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        employment_type: form.employmentType
      };

      // ✅ FIX 1: Remove extra bracket and fix employment fields
      if (form.employmentType === "salaried") {
        payload.company_name = form.companyName;
        payload.monthly_income = form.monthlyIncome;
        payload.profession = form.profession;

      } else if (form.employmentType === "self_employed") {
        payload.profession = form.profession;
        payload.annual_income = form.annualIncome;
        payload.business_name = form.businessName;

      } else if (form.employmentType === "business") {
        payload.business_name = form.businessName;
        payload.annual_turnover = form.annualTurnover;
        payload.company_name = form.companyName;
      }

      // ✅ FIX 2: Correct variable names for CIBIL and loan amount
      payload.cibil_score = form.cibil_score;
      payload.loan_amount = form.loan_amount;

      // ✅ FIX 3: Remove duplicate monthly_income (already added in salaried section)
      // payload.monthly_income = form.monthlyIncome;  // REMOVED

      console.log('Submitting payload:', payload);

      const response = await axios.patch(
        `${BASE_URL}users/update_profile/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Profile update response:', response.data);

      // Generate customer ID
      const id = "CUST" + Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
      setCustomerId(id);
      setShowSuccess(true);

    } catch (error) {
      console.error('Profile update error:', error);

      let errorMessage = "Profile update failed. Please try again.";

      if (error.response?.data) {
        const data = error.response.data;

        if (typeof data === "string") {
          errorMessage = data;
        } else if (typeof data === "object") {
          errorMessage =
            data.message ||
            data.error ||
            data.detail ||
            JSON.stringify(data);
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message;
      }

      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const employmentTypes = [
    { value: "salaried", label: "Salaried Employee", icon: "💼" },
    { value: "self_employed", label: "Self Employed", icon: "👔" },
    { value: "business", label: "Business Owner", icon: "🏢" },
    { value: "student", label: "Student", icon: "🎓" },
    { value: "unemployed", label: "Unemployed", icon: "📌" },
    { value: "other", label: "Other", icon: "🔧" }
  ];

  const fields = getEmploymentFields();

  return (
    <div className="max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Employment Details
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Please provide your employment information
            </p>

            {/* Submit Error */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 border border-red-200"
                >
                  <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {/* Employment Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type *
                </label>
                <select
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                  className="w-full border rounded-lg p-3"
                >
                  <option value="">Select Employment</option>
                  <option value="salaried">Salaried</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="business">Business Owner</option>
                  <option value="student">Student</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Dynamic Employment Fields */}
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} *
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors[field.name] ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                  )}
                </div>
              ))}

              {/* Aadhaar Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Number *
                </label>
                <input
                  type="text"
                  name="aadhaar"
                  value={form.aadhaar || ""}
                  onChange={handleChange}
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength="12"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.aadhaar ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.aadhaar && (
                  <p className="mt-1 text-sm text-red-600">{errors.aadhaar}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Your Aadhaar details are encrypted and securely stored
                </p>
              </div>

              {/* CIBIL Score Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CIBIL Score
                </label>
                <input
                  type="number"
                  name="cibil_score"
                  value={form.cibil_score || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter CIBIL score"
                  min="300"
                  max="900"
                />
              </div>

              {/* Loan Amount Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount (₹)
                </label>
                <input
                  type="number"
                  name="loan_amount"
                  value={form.loan_amount || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter loan amount"
                  min="0"
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={prev}
                  disabled={isSubmitting}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Complete Profile"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Success Screen */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto mb-6" />
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Onboarding Complete!
            </h2>

            <p className="text-gray-600 mb-8">
              Your profile has been successfully created. Here's your Customer ID:
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-xl mb-8"
            >
              <p className="text-sm opacity-90 mb-2">Your Customer ID</p>
              <p className="text-4xl font-bold tracking-wider">{customerId}</p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => window.location.href = "/dashboard"}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Go to Dashboard
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}