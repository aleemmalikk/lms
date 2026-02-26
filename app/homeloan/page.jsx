"use client";

import { useState, useEffect } from "react";
import { BASE_URL } from "@/app/lib/api";
import { useRouter } from "next/navigation";

// Helper function to get auth token - check common token keys
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Check all possible token storage locations
    return (
      localStorage.getItem('token') || 
      localStorage.getItem('access_token') || 
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('token') || 
      sessionStorage.getItem('access_token') || 
      sessionStorage.getItem('authToken')
    );
  }
  return null;
};

// Helper function to handle logout
const logout = () => {
  if (typeof window !== 'undefined') {
    // Clear all possible token storage
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refresh_token');
    
    // Redirect to login page
    window.location.href = '/login';
  }
};

// Post with Auth function
async function postWithAuth(endpoint, body, config = {}) {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No authentication token found in storage");
      // Redirect to login if no token
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error("No authentication token found. Please login again.");
    }

    const isFormData = body instanceof FormData;

    const headers = {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...config.headers,
    };

    console.log("🔵 POST Request:", {
      url: `${BASE_URL}${endpoint}`,
      method: "POST",
      headers: { ...headers, Authorization: "Bearer [HIDDEN]" }, // Hide token in logs
      body: isFormData ? "FormData" : body,
    });

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: isFormData ? body : JSON.stringify(body),
      ...config,
    });

    console.log(" POST Response Status:", response.status, response.statusText);

    const responseClone = response.clone();

    if (!response.ok) {
      let errorData;
      try {
        errorData = await responseClone.json();
      } catch (e) {
        try {
          errorData = await response.text();
        } catch (textError) {
          errorData = `Failed to parse error response: ${textError.message}`;
        }
      }

      console.error(" POST Error:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      if (response.status === 401) {
        logout();
        throw new Error("Session expired. Please login again.");
      }

      throw new Error(
        errorData.detail ||
        errorData.message ||
        errorData.error ||
        `HTTP error! status: ${response.status}`
      );
    }

    const responseData = await response.json();
    console.log(" POST Success:", responseData);
    return responseData;
  } catch (error) {
    console.error(" POST Request Failed:", error);
    throw error;
  }
}

export default function Home() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showNoOffersPopup, setShowNoOffersPopup] = useState(false);
  const [formData, setFormData] = useState({
    mobile: "",
    first_name: "",
    last_name: "",
    pan_number: "",
    dob: "",
    email: "",
    pincode: "",
    monthly_income: "",
    loan_amount: "",
    property_type: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setError("Please login to continue");
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Auto-hide popup after 5 seconds
  useEffect(() => {
    if (showNoOffersPopup) {
      const timer = setTimeout(() => {
        setShowNoOffersPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNoOffersPopup]);

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6V7m0 0V5m0 2h2m-2 0H9" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please login to access the loan application.</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  // Validation functions for each field
  const validateMobile = (mobile) => {
    if (!mobile) return "Mobile number is required";
    if (!/^\d{10}$/.test(mobile)) return "Enter a valid 10-digit mobile number";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
    return "";
  };

  const validateFirstName = (name) => {
    if (!name) return "First name is required";
    if (name.length < 2) return "First name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "First name can only contain letters";
    return "";
  };

  const validateLastName = (name) => {
    if (!name) return "Last name is required";
    if (name.length < 2) return "Last name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Last name can only contain letters";
    return "";
  };

  const validatePAN = (pan) => {
    if (!pan) return "PAN number is required";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) return "Enter a valid PAN number (e.g., ABCDE1234F)";
    return "";
  };

  const validateDOB = (dob) => {
    if (!dob) return "Date of birth is required";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) return "You must be at least 18 years old";
    if (age > 100) return "Please enter a valid date of birth";
    return "";
  };

  const validatePincode = (pincode) => {
    if (!pincode) return "Pincode is required";
    if (!/^\d{6}$/.test(pincode)) return "Enter a valid 6-digit pincode";
    return "";
  };

  const validateMonthlyIncome = (income) => {
    if (!income) return "Monthly income is required";
    if (income <= 0) return "Income must be greater than 0";
    if (income < 10000) return "Minimum monthly income should be ₹10,000";
    if (income > 10000000) return "Income seems too high";
    return "";
  };

  const validateLoanAmount = (amount, income) => {
    if (!amount) return "Loan amount is required";
    if (amount <= 0) return "Loan amount must be greater than 0";
    if (amount < 100000) return "Minimum loan amount is ₹1,00,000";
    if (amount > 100000000) return "Loan amount seems too high";
    if (income && amount > income * 60) return "Loan amount cannot exceed 60 times your monthly income";
    return "";
  };

  const validatePropertyType = (type) => {
    if (!type) return "Please select a property type";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-format PAN to uppercase
    const processedValue = name === "pan_number" ? value.toUpperCase() : value;
    
    setFormData({
      ...formData,
      [name]: processedValue,
    });

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: "",
      });
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      const mobileError = validateMobile(formData.mobile);
      if (mobileError) errors.mobile = mobileError;
      
      const emailError = validateEmail(formData.email);
      if (emailError) errors.email = emailError;
    }
    
    if (step === 2) {
      const firstNameError = validateFirstName(formData.first_name);
      if (firstNameError) errors.first_name = firstNameError;
      
      const lastNameError = validateLastName(formData.last_name);
      if (lastNameError) errors.last_name = lastNameError;
      
      const dobError = validateDOB(formData.dob);
      if (dobError) errors.dob = dobError;
      
      const panError = validatePAN(formData.pan_number);
      if (panError) errors.pan_number = panError;
    }
    
    if (step === 3) {
      const pincodeError = validatePincode(formData.pincode);
      if (pincodeError) errors.pincode = pincodeError;
      
      const incomeError = validateMonthlyIncome(formData.monthly_income);
      if (incomeError) errors.monthly_income = incomeError;
      
      const loanError = validateLoanAmount(formData.loan_amount, formData.monthly_income);
      if (loanError) errors.loan_amount = loanError;
      
      const propertyError = validatePropertyType(formData.property_type);
      if (propertyError) errors.property_type = propertyError;
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const errors = validateStep(3);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors before submitting");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResponseData(null);

    try {
      // Use postWithAuth instead of direct fetch
      const data = await postWithAuth('creditlinks/housing_create/', {
        ...formData,
        monthly_income: Number(formData.monthly_income),
        loan_amount: Number(formData.loan_amount),
      });

      setResponseData(data);
      
      // Check if offers array exists and has items
      if (!data.offers || data.offers.length === 0) {
        setShowNoOffersPopup(true);
        // Still show the response but with no offers message
        setCurrentStep(4);
      } else {
        setCurrentStep(4);
      }
    } catch (err) {
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    const errors = validateStep(currentStep);
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors before proceeding");
      return;
    }

    setError(null);
    setFieldErrors({});
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
    setFieldErrors({});
  };

  const steps = [
    { number: 1, title: "Contact", icon: "📱" },
    { number: 2, title: "Personal", icon: "👤" },
    { number: 3, title: "Financial", icon: "💰" },
    { number: 4, title: "Offers", icon: "🏆" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* No Offers Popup */}
        {showNoOffersPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowNoOffersPopup(false)}></div>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 animate-fadeIn">
              <button 
                onClick={() => setShowNoOffersPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4M12 4v16" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Offers Available</h3>
                
                <p className="text-gray-600 mb-6">
                  We couldn't find any matching offers for your profile at this moment.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">💡 Suggestion:</span> You can try again after some time or update your details for better matches.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setShowNoOffersPopup(false);
                    setCurrentStep(1);
                    setResponseData(null);
                    setFormData({
                      mobile: "",
                      first_name: "",
                      last_name: "",
                      pan_number: "",
                      dob: "",
                      email: "",
                      pincode: "",
                      monthly_income: "",
                      loan_amount: "",
                      property_type: "",
                    });
                  }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Home Loan Application
            </span>
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Complete in 3 easy steps • Get offers in minutes
          </p>
        </div>

        {/* Progress Bar */}
        {currentStep < 4 && (
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.slice(0, 3).map((step, index) => (
                <div key={step.number} className="flex-1 relative">
                  {index < 2 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-1 ${
                        step.number < currentStep
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300 ${
                        step.number < currentStep
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                          : step.number === currentStep
                          ? "bg-white border-2 border-indigo-600 text-indigo-600"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.number < currentStep ? "✓" : step.icon}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        step.number === currentStep
                          ? "text-indigo-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Step 1: Contact Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Let's start with your contact details</h2>
                  <p className="text-gray-500">We'll send offers to your mobile & email</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📱</span>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          fieldErrors.mobile ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        } focus:ring-2 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter 10-digit mobile number"
                        maxLength="10"
                      />
                    </div>
                    {fieldErrors.mobile && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.mobile}</p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">✉️</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        } focus:ring-2 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={nextStep}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 mt-6"
                >
                  Continue to Personal Details →
                </button>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        fieldErrors.first_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      } focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter first name"
                    />
                    {fieldErrors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        fieldErrors.last_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      } focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter last name"
                    />
                    {fieldErrors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.last_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        fieldErrors.dob ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      } focus:ring-2 focus:border-transparent transition-all duration-200`}
                    />
                    {fieldErrors.dob && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.dob}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pan_number"
                      value={formData.pan_number}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        fieldErrors.pan_number ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      } focus:ring-2 focus:border-transparent transition-all duration-200 uppercase`}
                      placeholder="Enter PAN number"
                      maxLength="10"
                    />
                    {fieldErrors.pan_number && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.pan_number}</p>
                    )}
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-sm text-indigo-700">
                    <span className="font-semibold">💡 Why we need PAN?</span> It helps us check your eligibility without affecting your credit score
                  </p>
                </div>

                <div className="flex flex-col space-y-3 mt-6">
                  <button
                    onClick={nextStep}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Continue to Financial Details →
                  </button>
                  
                  <button
                    onClick={prevStep}
                    className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    ← Back to Contact Info
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Financial Details */}
            {currentStep === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Almost there! 🏠</h2>
                  <p className="text-gray-500">Tell us about your loan requirements</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        fieldErrors.pincode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      } focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter area pincode"
                      maxLength="6"
                    />
                    {fieldErrors.pincode && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.pincode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Income (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                      <input
                        type="number"
                        name="monthly_income"
                        value={formData.monthly_income}
                        onChange={handleChange}
                        className={`w-full pl-8 pr-4 py-3 rounded-xl border ${
                          fieldErrors.monthly_income ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        } focus:ring-2 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter monthly income"
                      />
                    </div>
                    {fieldErrors.monthly_income && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.monthly_income}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                      <input
                        type="number"
                        name="loan_amount"
                        value={formData.loan_amount}
                        onChange={handleChange}
                        className={`w-full pl-8 pr-4 py-3 rounded-xl border ${
                          fieldErrors.loan_amount ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        } focus:ring-2 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter loan amount"
                      />
                    </div>
                    {fieldErrors.loan_amount && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.loan_amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        fieldErrors.property_type ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      } focus:ring-2 focus:border-transparent transition-all duration-200 bg-white`}
                    >
                      <option value="">Select property type</option>
                      <option value="House">🏠 House</option>
                      <option value="Flat">🏢 Flat / Apartment</option>
                      <option value="Villa">🏰 Villa</option>
                      <option value="Commercial">🏬 Commercial</option>
                    </select>
                    {fieldErrors.property_type && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.property_type}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 mt-6"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Get My Offers Now 🚀"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 mt-2"
                  >
                    ← Back to Personal Details
                  </button>
                </div>
              </form>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Results/Offers */}
        {responseData && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">🎉 {responseData.message}</h2>
             
            </div>

            {responseData.offers?.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">🏆 Your Personalized Offers</h3>
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {responseData.offers.length} Offers Found
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {responseData.offers.map((offer, index) => (
                    <div
                      key={index}
                      className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                          <div className="w-20 h-20 bg-white rounded-xl border-2 border-gray-200 p-2 flex items-center justify-center">
                            {offer.lenderLogo ? (
                              <img
                                src={offer.lenderLogo}
                                alt={offer.lenderName}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <span className="text-3xl">🏦</span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{offer.lenderName}</h4>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                              offer.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              offer.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {offer.status}
                            </span>
                          </div>
                        </div>
                        
                        <a
                          href={offer.offerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          Apply Now
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                          </svg>
                        </a>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-500">Amount Up To</p>
                          <p className="text-xl font-bold text-gray-900">₹{offer.offerAmountUpTo}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-500">Tenure</p>
                          <p className="text-xl font-bold text-gray-900">{offer.offerTenure}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-500">Interest Rate</p>
                          <p className="text-xl font-bold text-gray-900">{offer.offerInterestRate}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-500">Processing Fees</p>
                          <p className="text-xl font-bold text-gray-900">{offer.offerProcessingFees}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4M12 4v16" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Offers Available</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any matching offers for your profile at this moment.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Please try again after some time or update your details.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setCurrentStep(1);
                setResponseData(null);
                setFormData({
                  mobile: "",
                  first_name: "",
                  last_name: "",
                  pan_number: "",
                  dob: "",
                  email: "",
                  pincode: "",
                  monthly_income: "",
                  loan_amount: "",
                  property_type: "",
                });
                setFieldErrors({});
                setError(null);
              }}
              className="mt-8 w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Apply for Another Loan
            </button>
          </div>
        )}
      </div>

      {/* Add this CSS for popup animation */}
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}