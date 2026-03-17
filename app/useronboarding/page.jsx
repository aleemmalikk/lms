"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getWithAuth, postWithAuth, putWithAuth } from "@/app/lib/api";

import Step1Mobile from "./Step1Mobile";
import Step2Personal from "./Step2Personal";
import Step3Address from "./Step3Address";
import Step4Employment from "./Step4Employment";
import { useSearchParams } from "next/navigation";

// Employment type mapping based on Django choices
const EMPLOYMENT_TYPE_MAPPING = {
  'salaried': 'salaried',
  'self_employed': 'self_employed',
  'business': 'business',
  'student': 'student',
  'unemployed': 'unemployed',
  'other': 'other'
};

export default function OnboardingForm() {
  const [loading, setLoading] = useState(true);
  const [showOnboard, setShowOnboard] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    mobile: "",
    otp: "",
    name: "",
    dob: "",
    pan: "",
    pincode: "",
    city: "",
    state: "",
    address: "",
    employmentType: "",
    companyName: "",
    monthlyIncome: "",
    profession: "",
    annualIncome: "",
    businessName: "",
    annualTurnover: "",
    aadhaar: "",
    cibil_score: "",
    loan_amount: ""
  });

  useEffect(() => {
    const mobileFromUrl = searchParams.get("mobile");
    if (mobileFromUrl) {
      setForm(prev => ({
        ...prev,
        mobile: mobileFromUrl
      }));
    }
  }, [searchParams]);

  // Check user authentication and onboarding status
  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setShowOnboard(true);
          setLoading(false);
          return;
        }

        setAuthToken(token);

        // Check if user profile exists and get user ID
        const response = await getWithAuth("users/update_profile/");
        
        if (response && response.id) {
          setUserId(response.id);
          
          // If profile exists, pre-fill form with existing data
          if (response) {
            setForm(prev => ({
              ...prev,
              cibil_score: response.cibil_score || "",
              loan_amount: response.loan_amount || "",
              name: response.first_name || "",
              dob: response.date_of_birth || "",
              pan: response.pan_number || "",
              aadhaar: response.aadhar_number || "",
              address: response.address || "",
              city: response.city || "",
              state: response.state || "",
              pincode: response.pincode || "",
              employmentType: response.employment_type || "",
              monthlyIncome: response.monthly_income || "",
              companyName: response.company_name || "",
              profession: response.profession || "",
              annualIncome: response.annual_income || "",
              businessName: response.business_name || "",
              annualTurnover: response.annual_turnover || "",
            }));
          }
        }

        // Check onboarding status from my_hierarchy API
        try {
          const hierarchyResponse = await getWithAuth("user-hierarchy/my_hierarchy/");
          
          // If hierarchy exists and user is onboarded
          if (hierarchyResponse && hierarchyResponse.onboarded === true) {
            setShowOnboard(false); // Already onboarded
          } else {
            setShowOnboard(true); // Need to complete onboarding
          }
        } catch (hierarchyError) {
          console.log('Hierarchy not found, user needs onboarding');
          setShowOnboard(true);
        }
      } catch (error) {
        console.log('Error checking user:', error);
        
        if (error.response?.status === 404 ||
          error.response?.data?.detail?.includes("not found")) {
          setShowOnboard(true);
        } else {
          setShowOnboard(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const next = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prev = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  // ✅ FIXED: Smart mapping for monthly_income based on employment type
  const prepareDataForAPI = () => {
    console.log("Form data before preparing:", form);

    // Map employment type if needed
    const mappedEmploymentType = EMPLOYMENT_TYPE_MAPPING[form.employmentType] || form.employmentType;

    // Calculate monthly income smartly based on employment type
    let calculatedMonthlyIncome = null;
    
    if (form.monthlyIncome) {
      // Direct monthly income input (salaried)
      calculatedMonthlyIncome = Number(form.monthlyIncome);
    } else if (form.annualIncome) {
      // Convert annual income to monthly (self-employed)
      calculatedMonthlyIncome = Number(form.annualIncome) / 12;
    } else if (form.annualTurnover) {
      // Convert annual turnover to monthly (business)
      calculatedMonthlyIncome = Number(form.annualTurnover) / 12;
    }

    // Round to 2 decimal places for cleaner numbers
    if (calculatedMonthlyIncome) {
      calculatedMonthlyIncome = Math.round(calculatedMonthlyIncome * 100) / 100;
    }

    return {
      // Basic info - matching the API field names
      first_name: form.name || "",
      last_name: "", // You might want to add a last name field if needed
      date_of_birth: form.dob || null,
      pan_number: form.pan || null,
      aadhar_number: form.aadhaar || null,
      phone_number: form.mobile || null,
      
      // Address info
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      pincode: form.pincode || null,
      
      // Employment info with smart monthly_income mapping
      employment_type: mappedEmploymentType || null,
      company_name: form.companyName || null,
      monthly_income: calculatedMonthlyIncome, // ✅ Smart mapping applied here
      profession: form.profession || null,
      annual_income: form.annualIncome ? Number(form.annualIncome) : null,
      business_name: form.businessName || null,
      annual_turnover: form.annualTurnover ? Number(form.annualTurnover) : null,
      
      // CIBIL and Loan Amount - ensure these are sent as numbers
      cibil_score: form.cibil_score ? Number(form.cibil_score) : null,
      loan_amount: form.loan_amount ? Number(form.loan_amount) : null
    };
  };

  // Submit final data to server
  const submitOnboardingData = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      
      // Prepare data for API
      const apiData = prepareDataForAPI();
      
      // Log the data being sent
      console.log("Sending to update_profile:", JSON.stringify(apiData, null, 2));
      
      // First update user profile
      const profileResponse = await putWithAuth("users/update_profile/", apiData);
      console.log("Profile update response:", profileResponse);

      // Check if all fields were updated in the response
      if (profileResponse && profileResponse.user) {
        console.log("Updated user data:", {
          first_name: profileResponse.user.first_name,
          date_of_birth: profileResponse.user.date_of_birth,
          pan_number: profileResponse.user.pan_number,
          aadhar_number: profileResponse.user.aadhar_number,
          phone_number: profileResponse.user.phone_number,
          address: profileResponse.user.address,
          city: profileResponse.user.city,
          state: profileResponse.user.state,
          pincode: profileResponse.user.pincode,
          employment_type: profileResponse.user.employment_type,
          company_name: profileResponse.user.company_name,
          monthly_income: profileResponse.user.monthly_income, // ✅ This will now have value for all employment types
          profession: profileResponse.user.profession,
          annual_income: profileResponse.user.annual_income,
          business_name: profileResponse.user.business_name,
          annual_turnover: profileResponse.user.annual_turnover,
          cibil_score: profileResponse.user.cibil_score,
          loan_amount: profileResponse.user.loan_amount
        });
      }

      // Also update hierarchy if needed
      try {
        const hierarchyData = {
          ...apiData,
          onboarded: true
        };
        
        console.log("Sending to my_hierarchy:", JSON.stringify(hierarchyData, null, 2));
        
        // Try POST first
        await postWithAuth("user-hierarchy/my_hierarchy/", hierarchyData).catch(async (postError) => {
          console.log("POST failed, trying PUT:", postError);
          // If POST fails, try PUT
          await putWithAuth("user-hierarchy/my_hierarchy/", hierarchyData);
        });
      } catch (hierarchyError) {
        console.log("Hierarchy update error (non-critical):", hierarchyError);
        // Don't throw here - profile update is more important
      }

      // Show success and redirect
      alert("Onboarding completed successfully!");
      window.location.href = "/dashboard";
      
    } catch (error) {
      console.error("Error submitting onboarding data:", error);
      
      // Show more detailed error message
      if (error.response) {
        console.error("Error response data:", error.response.data);
        alert(`Failed to submit data: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Failed to submit data. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Mobile Verification", icon: "📱" },
    { number: 2, title: "Personal Details", icon: "👤" },
    { number: 3, title: "Address Information", icon: "📍" },
    { number: 4, title: "Employment Details", icon: "💼" }
  ];

  const pageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!showOnboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Profile Already Completed
          </h2>
          <p className="text-gray-600 mb-6">
            Your onboarding is already completed. You can now access your dashboard.
          </p>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Join thousands of professionals on our platform
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, index) => (
              <div
                key={s.number}
                className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${step >= s.number
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {step > s.number ? "✓" : s.icon}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded
                    ${step > s.number
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                        : "bg-gray-200"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between px-2">
            {steps.map((s) => (
              <span
                key={s.number}
                className={`text-xs font-medium ${step >= s.number ? "text-indigo-600" : "text-gray-400"
                  }`}
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
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
                opacity: { duration: 0.2 }
              }}
              className="w-full"
            >
              {step === 1 && (
                <Step1Mobile
                  form={form}
                  setForm={setForm}
                  next={next}
                  setAuthToken={setAuthToken}
                  setUserId={setUserId}
                />
              )}

              {step === 2 && (
                <Step2Personal
                  form={form}
                  setForm={setForm}
                  next={next}
                  prev={prev}
                />
              )}

              {step === 3 && (
                <Step3Address
                  form={form}
                  setForm={setForm}
                  next={next}
                  prev={prev}
                />
              )}

              {step === 4 && (
                <Step4Employment
                  form={form}
                  setForm={setForm}
                  prev={prev}
                  authToken={authToken}
                  onSubmit={submitOnboardingData}
                  isSubmitting={isSubmitting}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Secured by 256-bit encryption • Your data is safe with us
          </p>
        </div>
      </div>
    </div>
  );
}