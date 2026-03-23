"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BASE_URL, postWithAuth, getAuthToken } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  CreditCard,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  Home,
  Briefcase,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  TrendingUp,
  Shield,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function LoanApplyPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [riskResult, setRiskResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [panVerifying, setPanVerifying] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    pan_number: "",
    aadhar_number: "",
    address: "",
    city: "",
    pincode: "",
    employment_type: "salaried",
    employer_name: "",
    years_in_current_job: "",
  });

  const [formData, setFormData] = useState({
    category: "",
    requested_amount: "",
    tenure_months: "",
    cibil_score: "",
    avg_monthly_income: "",
    existing_emi: "",
    has_90_dpd: false,
    written_off: false,
    bounce_count: 0,
    fraud_score: 0,
  });

  useEffect(() => {
    fetchCategories();
    fetchUserProfile(); // Auto-fetch profile on load
  }, []);

  useEffect(() => {
    let completed = 0;
    const totalFields =
      Object.keys(customerDetails).length + Object.keys(formData).length;

    Object.values(customerDetails).forEach((val) => {
      if (val && val.toString().trim() !== "") completed++;
    });

    Object.values(formData).forEach((val) => {
      if (val && val.toString().trim() !== "" && val !== false) completed++;
    });

    setFormProgress(Math.round((completed / totalFields) * 100));
  }, [customerDetails, formData]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}loan-categories/`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
      setMessageType("error");
      setMessage("Failed to load loan categories");
    }
  };

  // Auto-fetch user profile with correct field mapping
  // Auto-fetch user profile with correct field mapping
  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setLoadingProfile(false);
        return;
      }

      const res = await axios.get(`${BASE_URL}users/my_profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const profile = res.data;
      console.log("Profile data:", profile);

      if (profile) {
        const fullName = profile.first_name && profile.last_name
          ? `${profile.first_name} ${profile.last_name}`.trim()
          : profile.first_name || profile.full_name || "";

        setCustomerDetails(prev => ({
          ...prev,
          full_name: fullName || prev.full_name,
          email: profile.email || prev.email,
          phone: profile.phone_number || profile.phone || profile.mobile || prev.phone,
          date_of_birth: profile.date_of_birth || profile.dob || prev.date_of_birth,
          pan_number: profile.pan_number || profile.pan || prev.pan_number,
          aadhar_number: profile.aadhar_number || profile.aadhaar || prev.aadhar_number,
          address: profile.address || prev.address,
          city: profile.city || prev.city,
          pincode: profile.pincode || prev.pincode,
          employment_type: profile.employment_type || prev.employment_type,
          employer_name: profile.employer_name || profile.company_name || prev.employer_name,
          years_in_current_job: profile.years_in_current_job || prev.years_in_current_job,
        }));

        if (profile.cibil_score) {
          setFormData(prev => ({
            ...prev,
            cibil_score: profile.cibil_score
          }));
        }
        if (profile.monthly_income || profile.avg_monthly_income) {
          setFormData(prev => ({
            ...prev,
            avg_monthly_income: profile.monthly_income || profile.avg_monthly_income
          }));
        }

        if (profile.loan_amount) {
          setFormData(prev => ({
            ...prev,
            requested_amount: profile.loan_amount
          }));
          setMessageType("success");
          setTimeout(() => setMessage(""), 3000);
        }

        setMessageType("success");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessageType("error");
      setMessage("Failed to load profile");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoadingProfile(false);
    }
  };

  const verifyPAN = async (pan) => {
    if (!pan || pan.length !== 10) return;

    setPanVerifying(true);
    try {
      const token = getAuthToken();
      const res = await axios.post(
        `${BASE_URL}bbps/bbps/verify-pan/`,
        { pan_number: pan },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      const data = res.data;
      const panName = typeof data === "object" ? data?.name || data?.data?.name : null;

      if (panName) {
        setCustomerDetails(prev => ({
          ...prev,
          full_name: panName
        }));
        setMessageType("success");
        setMessage("✅ PAN verified! Name auto-filled.");
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessageType("error");
        setMessage("PAN verification failed. Please check your PAN number.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("PAN verification error:", error);
      setMessageType("error");
      setMessage("PAN verification failed. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setPanVerifying(false);
    }
  };

  // Fetch pincode details
  const fetchPincodeDetails = async (pincode) => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data[0]?.Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setCustomerDetails(prev => ({
            ...prev,
            city: postOffice.District
          }));
          setMessageType("success");
          setMessage(`📍 City auto-filled: ${postOffice.District}`);
          setTimeout(() => setMessage(""), 2000);
        }
      } catch (error) {
        console.error("Error fetching pincode details:", error);
      }
    }
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-fill triggers
    if (name === "pan_number" && value.length === 10) {
      verifyPAN(value);
    } else if (name === "pincode") {
      fetchPincodeDetails(value);
    }
  };

  const handleLoanChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const calculateFOIR = () => {
    const income = parseFloat(formData.avg_monthly_income);
    const emi = parseFloat(formData.existing_emi);

    if (!income || !emi || income === 0) return 0;

    return ((emi / income) * 100).toFixed(2);
  };

  const getEligibilityScore = () => {
    let score = 0;
    if (formData.cibil_score >= 750) score += 30;
    else if (formData.cibil_score >= 700) score += 20;
    else if (formData.cibil_score >= 650) score += 10;

    const foir = parseFloat(calculateFOIR());
    if (foir <= 30) score += 25;
    else if (foir <= 40) score += 15;
    else if (foir <= 50) score += 5;

    if (!formData.has_90_dpd && !formData.written_off) score += 20;

    return score;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setRiskResult(null);

    try {
      const foirValue = calculateFOIR();

      const createRes = await postWithAuth("loan-applications/", {
        ...formData,
        ...customerDetails,
        foir: foirValue,
      });

      const submitRes = await postWithAuth(
        `loan-applications/${createRes.id}/submit/`,
        {},
      );

      setRiskResult(submitRes);
      setMessageType("success");
      setShowSuccessPopup(true);


    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Application failed");
    }

    setLoading(false);
  };

  const steps = [
    { number: 1, title: "Personal Information", icon: User },
    { number: 2, title: "Loan Details", icon: CreditCard },
    { number: 3, title: "Review & Submit", icon: FileText },
  ];

  return (
    <div className="px-20 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-end">
          <Link
            href="/my-applications/apply/aplicantlist"
            className="text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline font-semibold"
          >
            View rejected applications →
          </Link>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            Loan Application
          </motion.h1>
          <p className="text-gray-600">
            Get instant eligibility decision in minutes
          </p>
          {loadingProfile && (
            <p className="text-xs text-blue-600 mt-2">Loading your profile...</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Application Progress
            </span>
            <span className="text-sm font-medium text-blue-600">
              {formProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${formProgress}%` }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full"
            />
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
            >
              <div
                className={`flex items-center cursor-pointer ${currentStep >= step.number ? "text-blue-600" : "text-gray-400"
                  }`}
                onClick={() => step.number <= 2 && setCurrentStep(step.number)}
              >
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 
                  transition-all duration-300
                  ${currentStep >= step.number
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                    }
                `}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
                    }`}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Message Alert */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${messageType === "success"
                ? "bg-green-50 border border-green-200"
                : messageType === "error"
                  ? "bg-red-50 border border-red-200"
                  : "bg-blue-50 border border-blue-200"
                }`}
            >
              {messageType === "success" && (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              {messageType === "error" && (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              {messageType === "info" && (
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <span
                className={
                  messageType === "success"
                    ? "text-green-700"
                    : messageType === "error"
                      ? "text-red-700"
                      : "text-blue-700"
                }
              >
                {message}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Risk Result Display */}
        <AnimatePresence>
          {riskResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-6 p-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Risk Evaluation Result
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-100 text-sm">Risk Score</p>
                  <p className="text-2xl font-bold">{riskResult.risk_score}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Status</p>
                  <p
                    className={`text-2xl font-bold ${riskResult?.status === "approved"
                      ? "text-green-300"
                      : riskResult.status === "rejected"
                        ? "text-red-300"
                        : "text-yellow-300"
                      }`}
                  >
                    {riskResult?.status
                      ? riskResult.status.charAt(0).toUpperCase() +
                      riskResult.status.slice(1)
                      : "Rejected"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Steps */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-xl shadow-lg p-6 space-y-5"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={customerDetails.full_name}
                      onChange={handleCustomerChange}
                      required
                      className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={customerDetails.email}
                      onChange={handleCustomerChange}
                      required
                      className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={customerDetails.phone}
                      onChange={handleCustomerChange}
                      required
                      className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={customerDetails.date_of_birth}
                      onChange={handleCustomerChange}
                      required
                      className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      PAN Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="pan_number"
                        value={customerDetails.pan_number}
                        onChange={handleCustomerChange}
                        required
                        maxLength="10"
                        className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                        placeholder="ABCDE1234F"
                      />
                      {panVerifying && (
                        <div className="absolute right-3 top-3">
                          <Loader className="w-4 h-4 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter PAN to auto-fill name</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      name="aadhar_number"
                      value={customerDetails.aadhar_number}
                      onChange={handleCustomerChange}
                      required
                      className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="1234 5678 9012"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={customerDetails.address}
                      onChange={handleCustomerChange}
                      required
                      className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={customerDetails.city}
                      onChange={handleCustomerChange}
                      required
                      className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={customerDetails.pincode}
                      onChange={handleCustomerChange}
                      required
                      maxLength="6"
                      className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="400001"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter pincode to auto-fill city</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Employment Type
                    </label>
                    <select
                      name="employment_type"
                      value={customerDetails.employment_type}
                      onChange={handleCustomerChange}
                      className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="salaried">Salaried</option>
                      <option value="self_employed">Self Employed</option>
                      <option value="business">Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Employer Name
                    </label>
                    <input
                      type="text"
                      name="employer_name"
                      value={customerDetails.employer_name}
                      onChange={handleCustomerChange}
                      className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Company name"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-xl shadow-lg p-6 space-y-5"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Loan Details
                </h2>

                {/* Eligibility Score Card */}
                {/* {Object.values(formData).some((val) => val) && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Estimated Eligibility Score
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {getEligibilityScore()}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                )} */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Loan Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleLoanChange}
                      required
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Requested Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="requested_amount"
                      value={formData.requested_amount}
                      onChange={handleLoanChange}
                      required
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="500000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Tenure (Months)
                    </label>
                    <input
                      type="number"
                      name="tenure_months"
                      value={formData.tenure_months}
                      onChange={handleLoanChange}
                      required
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Monthly Income (₹)
                    </label>
                    <input
                      type="number"
                      name="avg_monthly_income"
                      value={formData.avg_monthly_income}
                      onChange={handleLoanChange}
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="100000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Existing EMI (₹)
                    </label>
                    <input
                      type="number"
                      name="existing_emi"
                      value={formData.existing_emi}
                      onChange={handleLoanChange}
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="25000"
                    />
                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">FOIR:</span>
                        <span
                          className={`font-medium ${parseFloat(calculateFOIR()) <= 40
                            ? "text-green-600"
                            : "text-orange-600"
                            }`}
                        >
                          {calculateFOIR()}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      CIBIL Score
                    </label>
                    <input
                      type="number"
                      name="cibil_score"
                      value={formData.cibil_score}
                      onChange={handleLoanChange}
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="750"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Fraud Score
                    </label>
                    <input
                      type="number"
                      name="fraud_score"
                      value={formData.fraud_score}
                      onChange={handleLoanChange}
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <input
                      type="checkbox"
                      name="has_90_dpd"
                      checked={formData.has_90_dpd}
                      onChange={handleLoanChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      Has 90+ Days Past Due (DPD)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <input
                      type="checkbox"
                      name="written_off"
                      checked={formData.written_off}
                      onChange={handleLoanChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      Previously Written Off
                    </span>
                  </label>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
                  >
                    Review Application
                  </button>
                </div>
              </motion.div>
            )}

            <div id="print-area">
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl shadow-lg p-6 space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-blue-600" />
                      Review & Submit
                    </h2>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Ready to Submit
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* Personal Information Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200"
                    >
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-200">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-lg">Personal Information</h3>
                        <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">✓ Verified</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Full Name</p>
                          <p className="font-semibold text-gray-800">{customerDetails.full_name || "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Email</p>
                          <p className="text-gray-700">{customerDetails.email || "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Phone</p>
                          <p className="text-gray-700">{customerDetails.phone || "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Date of Birth</p>
                          <p className="text-gray-700">{customerDetails.date_of_birth || "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">PAN Number</p>
                          <p className="font-mono text-gray-700">{customerDetails.pan_number || "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Aadhar Number</p>
                          <p className="font-mono text-gray-700">•••• •••• {customerDetails.aadhar_number?.slice(-4) || "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Address</p>
                          <p className="text-gray-700">{customerDetails.address || "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">City</p>
                          <p className="text-gray-700">{customerDetails.city || "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Pincode</p>
                          <p className="text-gray-700">{customerDetails.pincode || "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Employment Type</p>
                          <p className="capitalize text-gray-700">{customerDetails.employment_type || "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Employer Name</p>
                          <p className="text-gray-700">{customerDetails.employer_name || "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Years in Job</p>
                          <p className="text-gray-700">{customerDetails.years_in_current_job || "—"}</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Loan Details Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200"
                    >
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-purple-200">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <CreditCard className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-lg">Loan Details</h3>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Loan Category</p>
                          <p className="font-semibold text-purple-700">
                            {categories.find(cat => cat.id == formData.category)?.name || "Not selected"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Requested Amount</p>
                          <p className="text-xl font-bold text-blue-600">
                            ₹{formData.requested_amount ? Number(formData.requested_amount).toLocaleString() : "0"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Tenure</p>
                          <p className="text-gray-700 font-medium">{formData.tenure_months || "0"} months</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Monthly Income</p>
                          <p className="text-gray-700">₹{formData.avg_monthly_income ? Number(formData.avg_monthly_income).toLocaleString() : "0"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Existing EMI</p>
                          <p className="text-gray-700">₹{formData.existing_emi ? Number(formData.existing_emi).toLocaleString() : "0"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">FOIR Ratio</p>
                          <p className={`font-bold ${parseFloat(calculateFOIR()) <= 40 ? "text-green-600" : "text-orange-600"}`}>
                            {calculateFOIR()}%
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">CIBIL Score</p>
                          <p className={`font-bold text-lg ${formData.cibil_score >= 750 ? "text-green-600" :
                            formData.cibil_score >= 650 ? "text-yellow-600" : "text-red-600"
                            }`}>
                            {formData.cibil_score || "—"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Fraud Score</p>
                          <p className="text-gray-700">{formData.fraud_score || "0"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wide">Bounce Count</p>
                          <p className="text-gray-700">{formData.bounce_count || "0"}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-purple-200 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${formData.has_90_dpd ? "bg-red-500" : "bg-green-500"}`}></div>
                          <span className="text-sm text-gray-600">90+ Days Past Due:</span>
                          <span className={`text-sm font-medium ${formData.has_90_dpd ? "text-red-600" : "text-green-600"}`}>
                            {formData.has_90_dpd ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${formData.written_off ? "bg-red-500" : "bg-green-500"}`}></div>
                          <span className="text-sm text-gray-600">Written Off:</span>
                          <span className={`text-sm font-medium ${formData.written_off ? "text-red-600" : "text-green-600"}`}>
                            {formData.written_off ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Eligibility Summary Card - Enhanced */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className={`rounded-xl p-5 border-2 ${getEligibilityScore() >= 60 ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300" :
                        getEligibilityScore() >= 40 ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300" :
                          "bg-gradient-to-r from-red-50 to-rose-50 border-red-300"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${getEligibilityScore() >= 60 ? "bg-green-100" :
                            getEligibilityScore() >= 40 ? "bg-yellow-100" : "bg-red-100"
                            }`}>
                            <TrendingUp className={`w-5 h-5 ${getEligibilityScore() >= 60 ? "text-green-600" :
                              getEligibilityScore() >= 40 ? "text-yellow-600" : "text-red-600"
                              }`} />
                          </div>
                          <h3 className="font-bold text-gray-800 text-lg">Eligibility Summary</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Overall Score</p>
                          <p className={`text-3xl font-bold ${getEligibilityScore() >= 60 ? "text-green-600" :
                            getEligibilityScore() >= 40 ? "text-yellow-600" : "text-red-600"
                            }`}>
                            {getEligibilityScore()}/100
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/60 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">CIBIL Score</p>
                          <p className={`text-xl font-bold ${formData.cibil_score >= 750 ? "text-green-600" :
                            formData.cibil_score >= 650 ? "text-yellow-600" : "text-red-600"
                            }`}>
                            {formData.cibil_score || "—"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formData.cibil_score >= 750 ? "Excellent" :
                              formData.cibil_score >= 700 ? "Good" :
                                formData.cibil_score >= 650 ? "Fair" : "Poor"}
                          </p>
                        </div>

                        <div className="bg-white/60 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">FOIR Ratio</p>
                          <p className={`text-xl font-bold ${parseFloat(calculateFOIR()) <= 30 ? "text-green-600" :
                            parseFloat(calculateFOIR()) <= 40 ? "text-yellow-600" : "text-orange-600"
                            }`}>
                            {calculateFOIR()}%
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {parseFloat(calculateFOIR()) <= 30 ? "Ideal" :
                              parseFloat(calculateFOIR()) <= 40 ? "Acceptable" : "High"}
                          </p>
                        </div>

                        <div className="bg-white/60 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">Recommendation</p>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {getEligibilityScore() >= 60 ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-semibold text-green-600">Highly Likely</span>
                              </>
                            ) : getEligibilityScore() >= 40 ? (
                              <>
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                <span className="text-sm font-semibold text-yellow-600">Moderate Chance</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-red-600" />
                                <span className="text-sm font-semibold text-red-600">Low Chance</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Eligibility Score</span>
                          <span>{getEligibilityScore()}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getEligibilityScore()}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${getEligibilityScore() >= 60 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                              getEligibilityScore() >= 40 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                                "bg-gradient-to-r from-red-500 to-rose-500"
                              }`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2 no-print">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Processing Your Application...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          Submit Application
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full px-6 py-2.5 rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all font-medium text-gray-700"
                    >
                      ← Back to Edit
                    </button>
                  </div>

                  {/* Security Note */}
                  <div className="text-center pt-2 no-print">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3" />
                      Your information is encrypted and secure
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        </form>

        {/* Trust Badges */}
        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>256-bit SSL Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>RBI Registered</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>No Hidden Charges</span>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-6 w-[400px] text-center shadow-xl"
            >
              <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-3" />

              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Application Submitted
              </h2>

              <p className="text-gray-600 mb-5">
                Application processed successfully!
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSuccessPopup(false); 
                    setCurrentStep(3);    

                    setTimeout(() => {
                      window.print();
                    }, 300);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Print
                </button>

                <Link
                  href="/"
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg text-center hover:bg-gray-300"
                >
                  Go Home
                </Link>
              </div>

              <button
                onClick={() => setShowSuccessPopup(false)}
                className="mt-4 text-sm text-gray-500 hover:underline"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}