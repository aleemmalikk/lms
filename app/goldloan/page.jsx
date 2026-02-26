"use client";

import { useState, useEffect } from "react";
import { BASE_URL } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ================= TOKEN HELPER ================= */

const getAuthToken = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("access") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token")
  );
};

const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  window.location.href = "/login";
};

/* ================= POST WITH AUTH ================= */

async function postWithAuth(endpoint, body) {
  const token = getAuthToken();

  if (!token) {
    alert("No token found. Please login again.");
    logout();
    throw new Error("Authentication token missing.");
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    console.log(`Response from ${endpoint}:`, responseText);

    if (response.status === 401) {
      alert("Your session has expired. Please login again.");
      logout();
      throw new Error("Session expired");
    }

    if (!response.ok) {
      let errorMessage = responseText;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || responseText;
      } catch {
        // If response is not JSON, use as is
      }
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(responseText);
    } catch {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/* ================= COMPONENT ================= */

export default function GoldLoanPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [loanData, setLoanData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [tokenCheckInterval, setTokenCheckInterval] = useState(null);

  const [formData, setFormData] = useState({
    mobile: "",
    first_name: "",
    last_name: "",
    email: "",
    pincode: "",
    loan_amount: "",
  });

  /* ================= AUTH CHECK ================= */

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
    }

    const interval = setInterval(() => {
      const currentToken = getAuthToken();
      if (!currentToken) {
        clearInterval(interval);
        alert("Session expired. Please login again.");
        router.push("/login");
      }
    }, 60000);

    setTokenCheckInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [router]);

  /* ================= INPUT HANDLER ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "loan_amount" ? (value ? Number(value) : "") : value,
    });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLoanData(null);
    setOffers([]);
    setShowOffers(false);

    const token = getAuthToken();
    if (!token) {
      setError("Session expired. Please login again.");
      logout();
      setLoading(false);
      return;
    }

    try {
      const data = await postWithAuth(
        "creditlinks/gold_create/",
        formData
      );

      if (data?.leadId) {
        setLeadId(data.leadId);
        setLoanData(data);
        
        // Check if offers are present in the response
        if (data.offers && data.offers.length > 0) {
          setOffers(data.offers);
          setShowOffers(true);
        }
        
        setShowSuccess(true);
        setSubmitted(true);
        
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        throw new Error("Lead ID not received");
      }
    } catch (err) {
      setError(err.message);
      
      if (err.message.includes("expired") || err.message.includes("401")) {
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHECK LOAN STATUS ================= */

  const checkLoanStatus = async () => {
    if (!leadId) {
      setError("Lead ID missing");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError("Session expired. Please login again.");
      logout();
      return;
    }

    setCheckingStatus(true);
    setError(null);

    try {
      const data = await postWithAuth(
        "creditlinks/gold_status/",
        { lead_id: leadId }
      );

      console.log("Loan Status Response:", data);
      
      if (data && data.statuses && data.statuses.length > 0) {
        setOffers(data.statuses);
        setShowOffers(true);
      } else {
        setError("No offers found for this application");
      }
      
    } catch (err) {
      console.error("Status check error:", err);
      setError(err.message);
      
      if (err.message.includes("expired") || err.message.includes("401")) {
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  /* ================= RESET FORM ================= */

  const resetForm = () => {
    setSubmitted(false);
    setLeadId("");
    setLoanData(null);
    setOffers([]);
    setShowOffers(false);
    setError(null);
    setSelectedOffer(null);
    setFormData({
      mobile: "",
      first_name: "",
      last_name: "",
      email: "",
      pincode: "",
      loan_amount: "",
    });
  };

  /* ================= FORMAT CURRENCY ================= */

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /* ================= HANDLE OFFER CLICK ================= */

  const handleOfferClick = (offer) => {
    // Check token before proceeding
    const token = getAuthToken();
    if (!token) {
      alert("Session expired. Please login again.");
      logout();
      return;
    }
    
    // Open the offer link in a new tab
    if (offer.offerLink) {
      window.open(offer.offerLink, '_blank', 'noopener,noreferrer');
    } else {
      alert("No application link available for this offer");
    }
  };

  /* ================= RENDER OFFER CARDS ================= */

  const renderOfferCards = () => {
    if (!offers || offers.length === 0) return null;

    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Available Loan Offers</h3>
          <button
            onClick={resetForm}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            New Application
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer, index) => (
            <div
              key={offer.lenderId || index}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => handleOfferClick(offer)}
            >
              {/* Bank Header */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  {/* Bank Logo */}
                  <div className="w-16 h-16 bg-white rounded-lg shadow-sm overflow-hidden flex items-center justify-center p-2">
                    {offer.lenderLogo ? (
                      <img
                        src={offer.lenderLogo}
                        alt={offer.lenderName}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://cdn-icons-png.flaticon.com/512/2830/2830283.png";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-500">Logo</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Bank Name and Status */}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                      {offer.lenderName}
                    </h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                      offer.status === 'Application Started' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {offer.status || 'Available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Offer Details */}
              <div className="p-6 space-y-4">
                {/* Loan Amount */}
                {offer.offerAmountUpTo && (
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-gray-600">Maximum Loan Amount</span>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{formatCurrency(offer.offerAmountUpTo)}
                    </span>
                  </div>
                )}

                {/* Interest Rate */}
                {offer.offerInterestRate && (
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-semibold text-gray-900">
                      {offer.offerInterestRate}
                    </span>
                  </div>
                )}

                {/* Tenure */}
                {offer.offerTenure && (
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-gray-600">Tenure</span>
                    <span className="font-semibold text-gray-900">
                      {offer.offerTenure}
                    </span>
                  </div>
                )}

                {/* Processing Fee */}
                {offer.offerProcessingFees && (
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-semibold text-gray-900">
                      {offer.offerProcessingFees}
                    </span>
                  </div>
                )}

                {/* KFS Link */}
                {offer.kfs && (
                  <div className="pt-2">
                    <a
                      href={offer.kfs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Key Facts Statement
                    </a>
                  </div>
                )}

                {/* Apply Button */}
                <button
                  className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-3 rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all font-medium flex items-center justify-center space-x-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOfferClick(offer);
                  }}
                >
                  <span>Apply Now</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Offers Message */}
        {offers.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No offers available</h3>
            <p className="mt-2 text-sm text-gray-500">Please check back later or try with different details.</p>
          </div>
        )}
      </div>
    );
  };

  /* ================= RENDER LOAN DETAILS (Hidden Lead ID) ================= */

  const renderLoanDetails = () => {
    if (!loanData) return null;

    return (
      <div className="mt-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Application Submitted Successfully!</h3>
            <p className="text-sm text-gray-500 mt-1">
              Your gold loan application has been received
            </p>
          </div>
          <button
            onClick={resetForm}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            New Application
          </button>
        </div>

        {/* Applicant Details Card (Lead ID Hidden) */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-yellow-700 mb-1">Applicant Name</p>
                <p className="text-xl font-bold text-gray-900">{formData.first_name} {formData.last_name}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Application Active
            </span>
          </div>

          {/* Applicant Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
              <p className="font-semibold text-gray-900">{formData.mobile}</p>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-gray-900">{formData.email}</p>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
              <p className="font-semibold text-gray-900">₹{formatCurrency(formData.loan_amount)}</p>
            </div>
          </div>
        </div>

        {/* Check Offers Button */}
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <div className="mb-6">
            <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
              <svg className="h-12 w-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">View Available Offers</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Click below to see personalized gold loan offers from our partner banks
            </p>
          </div>

          <button
            onClick={checkLoanStatus}
            disabled={checkingStatus}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl hover:from-yellow-600 hover:to-amber-700 disabled:from-yellow-300 disabled:to-amber-300 transition-all font-medium text-lg shadow-lg"
          >
            {checkingStatus ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading Offers...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Offers
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gold Loan Application
          </h1>
          <p className="text-gray-600">
            Get instant gold loan against your gold ornaments at low interest rates
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {!submitted ? (
            /* Application Form */
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Form Fields */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Enter 10 digit mobile number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      required
                      pattern="[0-9]{10}"
                      maxLength="10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="Enter 6 digit pincode"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      required
                      pattern="[0-9]{6}"
                      maxLength="6"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Loan Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="loan_amount"
                      value={formData.loan_amount}
                      onChange={handleChange}
                      placeholder="Enter loan amount"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      required
                      min="1000"
                      step="1000"
                    />
                  </div>
                </div>

                {/* Gold Ornaments Info */}
                

                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-4 rounded-lg hover:from-yellow-600 hover:to-amber-700 disabled:from-yellow-300 disabled:to-amber-300 transition-all font-medium text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : "Apply for Gold Loan"}
                </button>
              </form>
            </div>
          ) : (
            /* After Submission */
            <div className="p-8">
              {/* Success Message */}
              {showSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="text-green-700">Application submitted successfully!</p>
                  </div>
                </div>
              )}

              {/* Show Loan Details or Offers */}
              {showOffers ? renderOfferCards() : renderLoanDetails()}

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}