"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getWithAuth,
  postWithAuth,
} from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRight
} from "lucide-react";

export default function LoanApplyPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [riskResult, setRiskResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);

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
  }, []);

  useEffect(() => {
    let completed = 0;
    const totalFields = Object.keys(customerDetails).length + Object.keys(formData).length;

    Object.values(customerDetails).forEach(val => {
      if (val && val.toString().trim() !== "") completed++;
    });

    Object.values(formData).forEach(val => {
      if (val && val.toString().trim() !== "" && val !== false) completed++;
    });

    setFormProgress(Math.round((completed / totalFields) * 100));
  }, [customerDetails, formData]);

  const fetchCategories = async () => {
    try {
      const data = await getWithAuth("loan-categories/");
      setCategories(data);
    } catch (error) {
      console.error(error);
      setMessageType("error");
      setMessage("Failed to load loan categories");
    }
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        {}
      );

      setRiskResult(submitRes);
      setMessageType("success");
      setMessage("Application processed successfully!");

      // 🔥 RESET FORM
      setCustomerDetails({
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

      setFormData({
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

      setCurrentStep(1);

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
    <div className="px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >

        <div className="flex justify-end">
          <Link href="/lons/apply/aplicantlist">
            <button className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition font-medium">
              View Applicant List
            </button>
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
          <p className="text-gray-600">Get instant eligibility decision in minutes</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Application Progress</span>
            <span className="text-sm font-medium text-blue-600">{formProgress}%</span>
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
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`flex items-center cursor-pointer ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                  }`}
                onClick={() => step.number <= 2 && setCurrentStep(step.number)}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 
                  transition-all duration-300
                  ${currentStep >= step.number
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                  }
                `}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
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
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${messageType === 'success' ? 'bg-green-50 border border-green-200' :
                messageType === 'error' ? 'bg-red-50 border border-red-200' :
                  'bg-blue-50 border border-blue-200'
                }`}
            >
              {messageType === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              {messageType === 'error' && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              {messageType === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
              <span className={messageType === 'success' ? 'text-green-700' : messageType === 'error' ? 'text-red-700' : 'text-blue-700'}>
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
                  <p className={`text-2xl font-bold ${riskResult?.status === 'approved' ? 'text-green-300' :
                    riskResult.status === 'rejected' ? 'text-red-300' :
                      'text-yellow-300'
                    }`}>
                    {riskResult?.status
                      ? riskResult.status.charAt(0).toUpperCase() + riskResult.status.slice(1)
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
                    <input
                      type="text"
                      name="pan_number"
                      value={customerDetails.pan_number}
                      onChange={handleCustomerChange}
                      required
                      className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="ABCDE1234F"
                    />
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
                      className="w-full text-black border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="400001"
                    />
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
                {Object.values(formData).some(val => val) && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Estimated Eligibility Score</p>
                        <p className="text-2xl font-bold text-green-600">{getEligibilityScore()}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                )}

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
                        <span className={`font-medium ${parseFloat(calculateFOIR()) <= 40 ? 'text-green-600' : 'text-orange-600'
                          }`}>
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
                    <span className="text-sm text-gray-700">Has 90+ Days Past Due (DPD)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <input
                      type="checkbox"
                      name="written_off"
                      checked={formData.written_off}
                      onChange={handleLoanChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Previously Written Off</span>
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

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-xl shadow-lg p-6 space-y-5"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Review & Submit
                </h2>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-3">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-600">Name:</span>
                      <span className="text-gray-800">{customerDetails.full_name}</span>
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-800">{customerDetails.email}</span>
                      <span className="text-gray-600">Phone:</span>
                      <span className="text-gray-800">{customerDetails.phone}</span>
                      <span className="text-gray-600">PAN:</span>
                      <span className="text-gray-800">{customerDetails.pan_number}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-3">Loan Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="text-gray-800">₹{formData.requested_amount}</span>
                      <span className="text-gray-600">Tenure:</span>
                      <span className="text-gray-800">{formData.tenure_months} months</span>
                      <span className="text-gray-600">Monthly Income:</span>
                      <span className="text-gray-800">₹{formData.avg_monthly_income}</span>
                      <span className="text-gray-600">FOIR:</span>
                      <span className="text-gray-800">{calculateFOIR()}%</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                  Back to Edit
                </button>
              </motion.div>
            )}
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
    </div>
  );
}