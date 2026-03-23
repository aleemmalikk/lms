"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  IndianRupee,
  Percent,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BASE_URL } from "../lib/api";

export default function LoanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    pan: "",
  });
  const autoCheck = searchParams.get("autoCheck") === "true";

  const [loading, setLoading] = useState(false);
  const [panLoading, setPanLoading] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [pendingMobile, setPendingMobile] = useState(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken")
    );
  };


  useEffect(() => {
    if (autoCheck) {
      autoFetchAndCheck();
    }
  }, [autoCheck]);

  const validatePAN = (pan) => {
    if (!pan) return "PAN number is required";
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!regex.test(pan)) return "Invalid PAN format (ABCDE1234F)";
    return "";
  };

  const autoFetchAndCheck = async () => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await axios.get(`${BASE_URL}users/my_profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = res.data;

      if (!user.cibil_score || !user.monthly_income || !user.loan_amount) {
        setPopupMessage("Please complete your profile first");
        setPendingMobile(user.phone_number);
        setShowPopup(true);
        return;
      }

      setLoading(true);

      const result = await axios.post(
        `${BASE_URL}loan-eligibility/check/`,
        {
          name: user.first_name,
          mobile: user.phone_number,
          pan_number: user.pan_number,
          cibil_score: Number(user.cibil_score),
          monthly_income: Number(user.monthly_income),
          loan_amount: Number(user.loan_amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = result.data;

      if (data.status === "eligible") {
        setEligibilityResult({
          status: "approved",
          eligible_loans: data.eligible_loans || [],
          message: `Found ${data.eligible_loans.length} loans`,
        });
      } else {
        setEligibilityResult({
          status: "rejected",
          reasons: data.reason || [],
          suggested_products: data.suggested_products || [],
          reapply_after_days: data.reapply_after_days,
          message: "Not eligible",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPAN = async (pan) => {
    setPanLoading(true);
    try {
      const token = getToken();
      const res = await axios.post(
        `${BASE_URL}bbps/bbps/verify-pan/`,
        { pan_number: pan },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );

      const data = res.data;
      const panName = data?.name || data?.data?.name;

      if (panName) {
        setForm((prev) => ({
          ...prev,
          name: panName,
        }));
        setPanVerified(true);
        setErrors((prev) => ({ ...prev, pan: "" }));
      } else {
        setErrors((prev) => ({ ...prev, pan: "Name not found in PAN" }));
      }
    } catch (error) {
      const data = error?.response?.data;
      const msg =
        data?.message || data?.pan_number?.[0] || "PAN verification failed";
      setErrors((prev) => ({ ...prev, pan: msg }));
      setPanVerified(false);
    } finally {
      setPanLoading(false);
    }
  };

  useEffect(() => {
    const mobileFromUrl = searchParams.get("mobile");
    if (mobileFromUrl) {
      setForm((prev) => ({
        ...prev,
        mobile: mobileFromUrl,
      }));
      fetchUserProfile(mobileFromUrl);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (form.mobile.length !== 10) {
      newErrors.mobile = "Enter 10 digit mobile number";
    }

    if (!form.pan) {
      newErrors.pan = "PAN number is required";
    } else {
      const panError = validatePAN(form.pan);
      if (panError) newErrors.pan = panError;
    }

    if (!panVerified) {
      newErrors.pan = newErrors.pan || "Please verify PAN first";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchUserProfile = async (mobile) => {
    setProfileLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}public-user/check_mobile/?mobile=${mobile}`,
      );

      if (!res.data.exists) {
        // Show popup without auto-redirect
        setPopupMessage(
          "Your profile is incomplete. Click OK to complete your profile.",
        );
        setPendingMobile(mobile);
        setShowPopup(true);
        return;
      }

      const user = res.data.user;
      if (!user.cibil_score || !user.monthly_income || !user.loan_amount) {
        // Show popup without auto-redirect
        setPopupMessage(
          "Your profile is incomplete. Click OK to complete your profile.",
        );
        setPendingMobile(mobile);
        setShowPopup(true);
        return;
      }

      sessionStorage.setItem(
        "userProfile",
        JSON.stringify({
          cibil: user.cibil_score,
          income: user.monthly_income,
          loanAmount: user.loan_amount,
        }),
      );
    } catch (error) {
      console.error("User fetch error:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const checkEligibility = async (formData) => {
    try {
      const profileData = JSON.parse(
        sessionStorage.getItem("userProfile") || "{}",
      );

      const response = await axios.post(`${BASE_URL}loan-eligibility/check/`, {
        name: form.name,
        mobile: form.mobile,
        pan_number: form.pan,
        cibil_score: Number(profileData.cibil),
        monthly_income: Number(profileData.income),
        loan_amount: Number(profileData.loanAmount),
      });

      return response.data;
    } catch (error) {
      console.error("Eligibility check error:", error);
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to check eligibility",
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setEligibilityResult(null);

    try {
      const result = await checkEligibility(form);

      if (result.status === "eligible" && result.eligible_loans?.length > 0) {
        setEligibilityResult({
          status: "approved",
          customer: result.customer,
          eligible_loans: result.eligible_loans || [],
          message: `Found ${result.eligible_loans.length} loan offer(s) for you`,
        });
      } else if (result.status === "not_eligible") {
        setEligibilityResult({
          status: "rejected",
          customer: result.customer,
          reasons: result.reason || [],
          reapply_after_days: result.reapply_after_days,
          suggested_products: result.suggested_products || [],
          message: "Not eligible for the requested loan amount",
        });
      }
    } catch (error) {
      setEligibilityResult({
        status: "error",
        message:
          error.message || "Failed to check eligibility. Please try again.",
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
    });
    setPanVerified(false);
    setEligibilityResult(null);
    setErrors({});
    sessionStorage.removeItem("userProfile");
  };

  const handleRedirect = () => {
    if (pendingMobile) {
      router.push(`/`);
      setShowPopup(false);
      setPendingMobile(null);
    }
  };

  const cancelRedirect = () => {
    setShowPopup(false);
    setPendingMobile(null);
    setProfileLoading(false);
  };

  return (
    <div className="pt-10 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#2563eb] rounded-t-2xl p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Loan Eligibility Check
          </h1>
          <p className="text-white/80 mt-2">
            Enter PAN, Name & Mobile to check eligibility
          </p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-8">
          {eligibilityResult && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-lg ${eligibilityResult.status === "approved"
                    ? "bg-green-50 border-2 border-green-200"
                    : eligibilityResult.status === "rejected"
                      ? "bg-red-50 border-2 border-red-200"
                      : "bg-yellow-50 border-2 border-yellow-200"
                  }`}
              >
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
                    <h2
                      className={`text-xl font-bold ${eligibilityResult.status === "approved"
                          ? "text-green-800"
                          : eligibilityResult.status === "rejected"
                            ? "text-red-800"
                            : "text-yellow-800"
                        }`}
                    >
                      {eligibilityResult.status === "approved"
                        ? "You're Eligible!"
                        : eligibilityResult.status === "rejected"
                          ? "Not Eligible"
                          : "Error"}
                    </h2>
                    <p
                      className={`text-sm ${eligibilityResult.status === "approved"
                          ? "text-green-700"
                          : eligibilityResult.status === "rejected"
                            ? "text-red-700"
                            : "text-yellow-700"
                        }`}
                    >
                      {eligibilityResult.message}
                    </p>
                  </div>
                </div>

                {eligibilityResult.status === "rejected" &&
                  eligibilityResult.reasons?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-red-800 mb-2">
                        Reason for Rejection:
                      </h3>
                      <div className="bg-red-100 p-4 rounded-lg">
                        <ul className="list-disc list-inside space-y-2">
                          {eligibilityResult.reasons.map((reason, index) => (
                            <li
                              key={index}
                              className="text-sm text-red-800 font-medium"
                            >
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {eligibilityResult.reapply_after_days > 0 && (
                        <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                          <p className="text-sm text-orange-800 flex items-center gap-2">
                            <span className="font-semibold">
                              ⏰ Reapply after:
                            </span>
                            <span className="bg-orange-200 px-2 py-0.5 rounded-full text-orange-800">
                              {eligibilityResult.reapply_after_days} days
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                {eligibilityResult.status === "rejected" &&
                  (!eligibilityResult.reasons ||
                    eligibilityResult.reasons.length === 0) && (
                    <div className="mt-4">
                      <div className="bg-red-100 p-4 rounded-lg">
                        <p className="text-sm text-red-800 font-medium">
                          "reapply_after_days": 30,
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              {eligibilityResult.status === "approved" &&
                eligibilityResult.eligible_loans?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Available Loan Offers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {eligibilityResult.eligible_loans.map((loan) => (
                        <div
                          key={loan.id}
                          className="bg-white shadow-md rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                        >
                          <div className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#2563eb] p-3">
                            <div className="flex justify-between items-center">
                              <h3 className="text-sm font-semibold text-white line-clamp-1">
                                {loan.name}
                              </h3>
                              <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/30">
                                {loan.category?.name || "Loan"}
                              </span>
                            </div>
                          </div>

                          <div className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-700">
                                <div className="p-1.5 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-md">
                                  <IndianRupee className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-xs">
                                  ₹
                                  {parseFloat(loan.min_amount).toLocaleString()}{" "}
                                  - ₹
                                  {parseFloat(loan.max_amount).toLocaleString()}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-700">
                                <div className="p-1.5 bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] rounded-md">
                                  <Percent className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-xs">
                                  {loan.interest_rate}%
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-700">
                                <div className="p-1.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-md">
                                  <Clock className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-xs">
                                  {loan.min_tenure} - {loan.max_tenure} months
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-700">
                                <div className="p-1.5 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-md">
                                  <Tag className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-xs">
                                  Fee: ₹
                                  {parseFloat(
                                    loan.processing_fee,
                                  ).toLocaleString()}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-1">
                                  <Tag className="h-3 w-3 text-gray-400" />
                                  <span className="text-[10px] text-gray-400">
                                    ID: {loan.id}
                                  </span>
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

              {eligibilityResult.status === "rejected" &&
                eligibilityResult.suggested_products?.length > 0 && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">
                        Suggested Products for You
                      </h3>
                      <p className="text-sm text-gray-600">
                        Based on your profile, you might be eligible for these
                        products:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {eligibilityResult.suggested_products.map(
                        (product, index) => (
                          <div
                            key={index}
                            className="bg-white shadow-md rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                          >
                            <div className="bg-gradient-to-r from-purple-800 to-purple-600 p-3">
                              <div className="flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-white line-clamp-1">
                                  {product.name || "Suggested Product"}
                                </h3>
                                <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/30">
                                  Recommended
                                </span>
                              </div>
                            </div>

                            <div className="p-3">
                              <div className="space-y-2">
                                {(product.min_amount || product.amount) && (
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <div className="p-1.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-md">
                                      <IndianRupee className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-xs">
                                      {product.min_amount && product.max_amount
                                        ? `₹${parseFloat(product.min_amount).toLocaleString()} - ₹${parseFloat(product.max_amount).toLocaleString()}`
                                        : `₹${parseFloat(product.amount || product.min_amount).toLocaleString()}`}
                                    </span>
                                  </div>
                                )}

                                {product.interest_rate && (
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <div className="p-1.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-md">
                                      <Percent className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-xs">
                                      {product.interest_rate}%
                                    </span>
                                  </div>
                                )}

                                {product.tenure && (
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <div className="p-1.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-md">
                                      <Clock className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-xs">
                                      {product.tenure} months
                                    </span>
                                  </div>
                                )}

                                {product.type && (
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <div className="p-1.5 bg-gradient-to-r from-purple-600 to-purple-800 rounded-md">
                                      <Tag className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-xs">
                                      {product.type}
                                    </span>
                                  </div>
                                )}

                                {product.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2 border-t border-gray-100 pt-2">
                                    {product.description}
                                  </p>
                                )}

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
                        ),
                      )}
                    </div>
                  </div>
                )}

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

        <p className="text-center text-sm text-gray-500 mt-4">
          By checking eligibility, you agree to our Terms & Conditions and
          Privacy Policy
        </p>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Profile Incomplete
                </h3>
              </div>

              <p className="text-gray-600 mb-6">{popupMessage}</p>

              <div className="flex gap-3">
                <button
                  onClick={cancelRedirect}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRedirect}
                  className="flex-1 bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#2563eb] text-white py-2 rounded-lg hover:from-[#1e3a8a] hover:via-[#2563eb] hover:to-[#3b82f6] transition-all duration-300 font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
