"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { IndianRupee, Percent, Clock, Tag, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.29.196:8000/apis/";

export default function LoanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    pan: "",
    cibil: "",
    income: "",
    loanAmount: ""
  });

  const [loading, setLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "mobile") {

      const clean = value.replace(/\D/g, "");

      if (clean.length === 10) {
        fetchUserProfile(clean);
      }

    }

  };


  useEffect(() => {

    const mobileFromUrl = searchParams.get("mobile");

    if (mobileFromUrl) {

      setForm(prev => ({
        ...prev,
        mobile: mobileFromUrl
      }));

      fetchUserProfile(mobileFromUrl);

    }

  }, [searchParams]);


  const validateForm = () => {

    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!form.mobile) {
      newErrors.mobile = "Mobile number is required"
    }

    if (!form.pan) {
      newErrors.pan = "PAN number is required"
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (form.pan && !panRegex.test(form.pan)) {
      newErrors.pan = "Invalid PAN format"
    }

    if (!form.cibil || !form.income || !form.loanAmount) {
      newErrors.profile = "User profile not loaded. Enter valid mobile."
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }


  const fetchUserProfile = async (mobile) => {

    setProfileLoading(true);

    try {

      const res = await axios.get(
        `${BASE_URL}public-user/check_mobile/?mobile=${mobile}`
      );

      if (!res.data.exists) {

        router.push(`/useronboarding?mobile=${mobile}`);
        return;
      }

      const user = res.data.user;

      if (!user.cibil_score || !user.monthly_income || !user.loan_amount) {

        alert("User profile incomplete. Please complete onboarding.");

        router.push(`/useronboarding?mobile=${mobile}`);

        return;
      }

      setForm(prev => ({
        ...prev,
        cibil: user.cibil_score,
        income: user.monthly_income,
        loanAmount: user.loan_amount
      }));

    } catch (error) {

      console.error("User fetch error:", error);

    } finally {

      setProfileLoading(false);

    }

  };

  const checkEligibility = async (formData) => {
    try {

      const response = await axios.post(`${BASE_URL}loan-eligibility/check/`, {

        name: form.name,
        mobile: form.mobile,
        pan_number: form.pan,

        cibil_score: Number(form.cibil),
        monthly_income: Number(form.income),
        loan_amount: Number(form.loanAmount)

      });

      return response.data;

    } catch (error) {

      console.error("Eligibility check error:", error);

      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to check eligibility"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setEligibilityResult(null);

    try {
      const result = await checkEligibility(form);

      // Handle the API response structure
      if (result.status === "eligible" && result.eligible_loans?.length > 0) {
        setEligibilityResult({
          status: "approved",
          customer: result.customer,
          eligible_loans: result.eligible_loans || [],
          message: `Found ${result.eligible_loans.length} loan offer(s) for you`
        });
      } else if (result.status === "not_eligible") {
        setEligibilityResult({
          status: "rejected",
          customer: result.customer,
          reasons: result.reason || [],
          reapply_after_days: result.reapply_after_days,
          suggested_products: result.suggested_products || [],
          message: "Not eligible for the requested loan amount"
        });
      }

    } catch (error) {
      setEligibilityResult({
        status: "error",
        message: error.message || "Failed to check eligibility. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      mobile: "",
      pan: "",
      cibil: "",
      income: "",
      loanAmount: ""
    });
    setEligibilityResult(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-300 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#2563eb] rounded-t-2xl p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Loan Eligibility Check</h1>
          <p className="text-white/80 mt-2">Fill in your details to check loan eligibility instantly</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-8">
          {!eligibilityResult ? (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ${errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  maxLength="10"
                  placeholder="Enter 10 digit mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] ${errors.mobile ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                )}
              </div>

              {/* PAN */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  PAN Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pan"
                  placeholder="ABCDE1234F"
                  value={form.pan}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "pan",
                        value: e.target.value.toUpperCase()
                      }
                    })
                  }
                  className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] uppercase ${errors.pan ? 'border-red-500' : 'border-gray-300'
                    }`}
                  maxLength="10"
                />
                {errors.pan && (
                  <p className="text-red-500 text-xs mt-1">{errors.pan}</p>
                )}

                {errors.profile && (
                  <p className="text-red-500 text-xs mt-1">{errors.profile}</p>
                )}
              </div>


              {/* Button - Full width */}
              <div className="md:col-span-2">

                {profileLoading && (
                  <p className="text-sm text-blue-600 mb-2">
                    Fetching user profile...
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading || profileLoading}
                  className="w-full bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#2563eb] text-white py-3 rounded-lg hover:from-[#1e3a8a] hover:via-[#2563eb] hover:to-[#3b82f6] font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking Eligibility...
                    </>
                  ) : (
                    "Check Eligibility"
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Eligibility Result */
            <div className="space-y-6">
              {/* Result Header */}
              <div className={`p-6 rounded-lg ${eligibilityResult.status === "approved"
                ? "bg-green-50 border-2 border-green-200"
                : eligibilityResult.status === "rejected"
                  ? "bg-red-50 border-2 border-red-200"
                  : "bg-yellow-50 border-2 border-yellow-200"
                }`}>
                <div className="flex items-center gap-3">
                  {eligibilityResult.status === "approved" ? (
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  ) : eligibilityResult.status === "rejected" ? (
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                  )}
                  <div>
                    <h2 className={`text-xl font-bold ${eligibilityResult.status === "approved"
                      ? "text-green-800"
                      : eligibilityResult.status === "rejected"
                        ? "text-red-800"
                        : "text-yellow-800"
                      }`}>
                      {eligibilityResult.status === "approved"
                        ? "You're Eligible!"
                        : eligibilityResult.status === "rejected"
                          ? "Not Eligible"
                          : "Error"}
                    </h2>
                    <p className={`text-sm ${eligibilityResult.status === "approved"
                      ? "text-green-700"
                      : eligibilityResult.status === "rejected"
                        ? "text-red-700"
                        : "text-yellow-700"
                      }`}>
                      {eligibilityResult.message}
                    </p>
                  </div>
                </div>

                {/* Show rejection reasons - FIXED: Now properly displays the reason array */}
                {eligibilityResult.status === "rejected" && eligibilityResult.reasons?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-red-800 mb-2">Reason for Rejection:</h3>
                    <div className="bg-red-100 p-4 rounded-lg">
                      <ul className="list-disc list-inside space-y-2">
                        {eligibilityResult.reasons.map((reason, index) => (
                          <li key={index} className="text-sm text-red-800 font-medium">{reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Show reapply after days */}
                    {eligibilityResult.reapply_after_days > 0 && (
                      <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                        <p className="text-sm text-orange-800 flex items-center gap-2">
                          <span className="font-semibold">⏰ Reapply after:</span>
                          <span className="bg-orange-200 px-2 py-0.5 rounded-full text-orange-800">
                            {eligibilityResult.reapply_after_days} days
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* If no reasons but status is rejected */}
                {eligibilityResult.status === "rejected" && (!eligibilityResult.reasons || eligibilityResult.reasons.length === 0) && (
                  <div className="mt-4">
                    <div className="bg-red-100 p-4 rounded-lg">
                      <p className="text-sm text-red-800 font-medium">
                        "reapply_after_days": 30,                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Eligible Loans Grid */}
              {eligibilityResult.status === "approved" && eligibilityResult.eligible_loans?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Available Loan Offers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eligibilityResult.eligible_loans.map((loan) => (
                      <div key={loan.id} className="bg-white shadow-md rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                        {/* Card Header - Matching navbar gradient */}
                        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#2563eb] p-3">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-white line-clamp-1">{loan.name}</h3>
                            <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/30">
                              {loan.category?.name || 'Loan'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3">
                          <div className="space-y-2">
                            {/* Amount */}
                            <div className="flex items-center gap-2 text-gray-700">
                              <div className="p-1.5 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-md">
                                <IndianRupee className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-xs">
                                ₹{parseFloat(loan.min_amount).toLocaleString()} - ₹{parseFloat(loan.max_amount).toLocaleString()}
                              </span>
                            </div>

                            {/* Interest Rate */}
                            <div className="flex items-center gap-2 text-gray-700">
                              <div className="p-1.5 bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] rounded-md">
                                <Percent className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-xs">{loan.interest_rate}%</span>
                            </div>

                            {/* Tenure */}
                            <div className="flex items-center gap-2 text-gray-700">
                              <div className="p-1.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-md">
                                <Clock className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-xs">{loan.min_tenure} - {loan.max_tenure} months</span>
                            </div>

                            {/* Processing Fee */}
                            <div className="flex items-center gap-2 text-gray-700">
                              <div className="p-1.5 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-md">
                                <Tag className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-xs">Fee: ₹{parseFloat(loan.processing_fee).toLocaleString()}</span>
                            </div>

                            {/* Footer with ID and Apply Button - Matching reference exactly */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-1">
                                <Tag className="h-3 w-3 text-gray-400" />
                                <span className="text-[10px] text-gray-400">ID: {loan.id}</span>
                              </div>
                              <Link href={`/my-applications/apply`}>
                                <button className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#2563eb] text-white px-3 py-1.5 rounded-lg text-xs hover:from-[#1e3a8a] hover:via-[#2563eb] hover:to-[#3b82f6] transition-all duration-300 font-medium shadow-sm">
                                  Apply Now
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Products Grid */}
              {eligibilityResult.status === "rejected" && eligibilityResult.suggested_products?.length > 0 && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Suggested Products for You</h3>
                    <p className="text-sm text-gray-600">Based on your profile, you might be eligible for these products:</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eligibilityResult.suggested_products.map((product, index) => (
                      <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                        {/* Card Header - Purple theme for suggested products */}
                        <div className="bg-gradient-to-r from-purple-800 to-purple-600 p-3">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-white line-clamp-1">
                              {product.name || 'Suggested Product'}
                            </h3>
                            <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/30">
                              Recommended
                            </span>
                          </div>
                        </div>

                        <div className="p-3">
                          <div className="space-y-2">
                            {/* Amount */}
                            {(product.min_amount || product.amount) && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <div className="p-1.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-md">
                                  <IndianRupee className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-xs">
                                  {product.min_amount && product.max_amount
                                    ? `₹${parseFloat(product.min_amount).toLocaleString()} - ₹${parseFloat(product.max_amount).toLocaleString()}`
                                    : `₹${parseFloat(product.amount || product.min_amount).toLocaleString()}`
                                  }
                                </span>
                              </div>
                            )}

                            {/* Interest Rate */}
                            {product.interest_rate && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <div className="p-1.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-md">
                                  <Percent className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-xs">{product.interest_rate}%</span>
                              </div>
                            )}

                            {/* Tenure */}
                            {product.tenure && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <div className="p-1.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-md">
                                  <Clock className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-xs">{product.tenure} months</span>
                              </div>
                            )}

                            {/* Type */}
                            {product.type && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <div className="p-1.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-md">
                                  <Tag className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-xs">{product.type}</span>
                              </div>
                            )}

                            {/* Description */}
                            {product.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 border-t border-gray-100 pt-2">
                                {product.description}
                              </p>
                            )}

                            {/* Footer with Apply Button */}
                            <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                              <Link href={`/my-applications/apply`}>
                                <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1.5 rounded-lg text-xs hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-medium shadow-sm">
                                  Apply Now
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Check Another Application
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-4">
          By checking eligibility, you agree to our Terms & Conditions and Privacy Policy
        </p>
      </div>
    </div>
  );
}