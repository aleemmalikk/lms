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

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();

  if (response.status === 401) {
    alert("Session expired. Please login again.");
    logout();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(responseText);
  }

  return JSON.parse(responseText);
}

/* ================= COMPONENT ================= */

export default function PersonalLoanPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [offersData, setOffersData] = useState(null);
  const [error, setError] = useState(null);
  const [showNoOfferPopup, setShowNoOfferPopup] = useState(false);
  const [isFetchingOffers, setIsFetchingOffers] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedUnmatched, setExpandedUnmatched] = useState(false);

  const [formData, setFormData] = useState({
    mobile: "",
    first_name: "",
    last_name: "",
    pan_number: "",
    dob: "",
    email: "",
    pincode: "",
    monthly_income: "",
    credit_score: "",
    employment_status: "",
    employer_name: "",
    office_pin_code: "",
  });

  /* ================= AUTH CHECK ================= */

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  /* ================= INPUT HANDLER ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "monthly_income" || name === "credit_score"
          ? value ? Number(value) : null
          : name === "pan_number"
          ? value.toUpperCase()
          : value,
    });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOffersData(null);
    setShowNoOfferPopup(false);

    try {
      const data = await postWithAuth(
        "creditlinks/personal_create/",
        formData
      );

      if (data?.leadId) {
        setLeadId(data.leadId);
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
    } finally {
      setLoading(false);
    }
  };

  /* ================= GET OFFERS ================= */

  const getOffers = async () => {
    if (!leadId) return alert("Lead ID missing");

    setIsFetchingOffers(true);
    setError(null);
    setOffersData(null);
    setShowNoOfferPopup(false);

    try {
      const data = await postWithAuth(
        "creditlinks/personal_offers/",
        { lead_id: leadId }
      );

      console.log("Offers Response:", data); // For debugging

      // Check if there are any offers
      const hasOffers = data?.offers && Array.isArray(data.offers) && data.offers.length > 0;

      if (hasOffers) {
        setOffersData(data);
        setShowNoOfferPopup(false);
      } else {
        setOffersData(data); // Still set the data to show unmatched offers
        if (!data?.offers || data.offers.length === 0) {
          setShowNoOfferPopup(true);
        }
      }
    } catch (err) {
      setError(err.message);
      setShowNoOfferPopup(true);
    } finally {
      setIsFetchingOffers(false);
    }
  };

  /* ================= RESET FORM ================= */

  const resetForm = () => {
    setSubmitted(false);
    setLeadId("");
    setOffersData(null);
    setShowNoOfferPopup(false);
    setError(null);
    setExpandedUnmatched(false);
    setFormData({
      mobile: "",
      first_name: "",
      last_name: "",
      pan_number: "",
      dob: "",
      email: "",
      pincode: "",
      monthly_income: "",
      credit_score: "",
      employment_status: "",
      employer_name: "",
      office_pin_code: "",
    });
  };

  /* ================= CLOSE POPUP ================= */

  const closePopup = () => {
    setShowNoOfferPopup(false);
  };

  /* ================= RENDER OFFERS ================= */

  const renderOffers = () => {
    if (!offersData) return null;

    const { offers = [], unmatchedOffers = [] } = offersData;

    return (
      <div className="mt-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Available Loan Offers</h3>
            {offers.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Found {offers.length} offer{offers.length > 1 ? 's' : ''} for you
              </p>
            )}
          </div>
          <button
            onClick={resetForm}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Create New Application
          </button>
        </div>
        
        {/* Matched Offers */}
        {offers.length > 0 ? (
          <div className="space-y-6">
            {offers.map((offer, index) => (
              <div 
                key={offer.lenderId || index} 
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {offer.lenderLogo && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        <img 
                          src={offer.lenderLogo} 
                          alt={offer.lenderName}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/48?text=Bank";
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {offer.lenderName}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        offer.status === 'Application Started' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {offer.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {offer.offerAmountUpTo && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{Number(offer.offerAmountUpTo).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">up to</p>
                    </div>
                  )}
                  
                  {offer.offerTenure && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Tenure</p>
                      <p className="text-lg font-semibold text-gray-900">{offer.offerTenure}</p>
                    </div>
                  )}
                  
                  {offer.offerInterestRate && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Interest Rate</p>
                      <p className="text-lg font-semibold text-gray-900">{offer.offerInterestRate}</p>
                    </div>
                  )}
                  
                  {offer.offerProcessingFees && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Processing Fee</p>
                      <p className="text-sm font-medium text-gray-900">{offer.offerProcessingFees}</p>
                    </div>
                  )}
                </div>

                {offer.kfs && (
                  <div className="mb-4">
                    <a 
                      href={offer.kfs} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Key Facts Statement (KFS)
                    </a>
                  </div>
                )}

                <button 
                  onClick={() => window.open(offer.offerLink, "_blank")}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all font-medium"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No matching offers found</h3>
            <p className="mt-2 text-sm text-gray-500">Check below for other lenders you might qualify for.</p>
          </div>
        )}

        {/* Unmatched Offers Section */}
        {unmatchedOffers && unmatchedOffers.length > 0 && (
          <div className="mt-8 border-t pt-8">
            <button
              onClick={() => setExpandedUnmatched(!expandedUnmatched)}
              className="flex items-center justify-between w-full text-left"
            >
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  Other Lenders You May Consider ({unmatchedOffers.length})
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  These lenders have different eligibility criteria
                </p>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedUnmatched ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedUnmatched && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {unmatchedOffers.map((offer) => (
                  <div key={offer.lenderId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      {offer.lenderLogo && (
                        <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                          <img 
                            src={offer.lenderLogo} 
                            alt={offer.lenderName}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/32?text=Bank";
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <h5 className="font-medium text-gray-900">{offer.lenderName}</h5>
                        <p className="text-xs text-gray-500">Amount: ₹{Number(offer.offerAmountUpTo).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800">
                        {offer.status}
                      </span>
                      <button className="text-indigo-600 text-sm hover:text-indigo-800">
                        Check Eligibility
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Personal Loan Application
          </h1>
          <p className="text-gray-600">
            Get instant personal loan offers from multiple banks
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Show Form only if not submitted */}
          {!submitted ? (
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(formData).map((key) => (
                    <div key={key} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {key.replaceAll("_", " ")}
                      </label>
                      <input
                        type={
                          key === "dob" ? "date" : 
                          key === "email" ? "email" : 
                          key === "mobile" ? "tel" : "text"
                        }
                        name={key}
                        value={formData[key] || ""}
                        onChange={handleChange}
                        placeholder={`Enter ${key.replaceAll("_", " ")}`}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        required
                      />
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:from-indigo-300 disabled:to-indigo-300 transition-all font-medium text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : "Check Eligibility & Get Offers"}
                </button>
              </form>
            </div>
          ) : (
            /* Show Lead Info and Offers Section after submission */
            <div className="p-8">
              {/* Success Message */}
              {showSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="text-green-700">Lead created successfully! Your Lead ID: <span className="font-bold">{leadId}</span></p>
                  </div>
                </div>
              )}

              {/* Lead Info and Get Offers Button */}
              {!offersData && !showNoOfferPopup && (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                      <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Lead Created Successfully!</h3>
                   
                  </div>

                  <button
                    onClick={getOffers}
                    disabled={isFetchingOffers}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-green-300 disabled:to-green-300 transition-all font-medium text-lg shadow-lg"
                  >
                    {isFetchingOffers ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Fetching Offers...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Get Offers
                      </>
                    )}
                  </button>

                  <div className="mt-6">
                    <button
                      onClick={resetForm}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      ← Create New Application
                    </button>
                  </div>
                </div>
              )}

              {/* Show Offers */}
              {offersData && renderOffers()}

              {/* Error Display */}
              {error && !showNoOfferPopup && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* No Offer Popup */}
      {showNoOfferPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl transform transition-all">
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
                <svg 
                  className="h-10 w-10 text-yellow-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Offers Available
              </h3>

              {/* Message */}
              <p className="text-gray-600 mb-6">
                We couldn't find any personal loan offers matching your profile at the moment. 
                This could be due to:
              </p>

              {/* Reasons */}
              <div className="text-left bg-gray-50 rounded-xl p-5 mb-6">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-3">•</span>
                    Credit score requirements not met
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-3">•</span>
                    Income criteria for selected amount
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-3">•</span>
                    Employment stability period
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-3">•</span>
                    Age or residence criteria
                  </li>
                </ul>
              </div>

              {/* Suggestions */}
              <p className="text-sm text-gray-500 mb-8">
                You can try updating your income details or check back later as new offers become available regularly.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    closePopup();
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Update Details
                </button>
                <button
                  onClick={closePopup}
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}