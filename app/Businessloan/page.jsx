"use client";

import { useState } from "react";

export default function LoanWizard() {
  const [step, setStep] = useState(1);
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [creditScore, setCreditScore] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    gender: "",
    dob: "",
    pan: "",
    aadhaar: "",
    income: "",
    employment: "",
    pincode: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    businessType: "",
    businessAge: "",
    annualTurnover: "",
    loanAmount: "",
    businessLocation: "",
    companyName: ""
  });
  const [selectedTenure, setSelectedTenure] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState({
    aadhaarFront: false,
    aadhaarBack: false,
    panCard: false,
    selfie: false,
    businessProof: false,
    addressProof: false,
    financialStatements: false,
    gstCertificate: false
  });

  const next = () => {
    if (isStepComplete(step)) {
      setStep(step + 1);
    } else {
      alert("Please complete all required fields before proceeding.");
    }
  };

  const back = () => step > 1 && setStep(step - 1);

  const isStepComplete = (currentStep) => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.mobile && formData.gender && formData.dob && formData.businessType && formData.annualTurnover && formData.loanAmount;
      case 2:
        return formData.pan && formData.aadhaar && formData.income && formData.employment && formData.pincode && creditScore;
      case 3:
        return selectedTenure;
      case 4:
        return Object.values(uploadedDocs).every(doc => doc);
      case 5:
        return formData.bankName && formData.accountNumber && formData.ifsc;
      default:
        return true;
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    if (updated.every(digit => digit !== "") && index === 5) {
      setTimeout(() => {
        verifyOtp();
      }, 500);
    }
  };

  const verifyOtp = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === 6) {
      setCreditScore("750");
      setOtpModal(false);
      setOtp(["", "", "", "", "", ""]);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentUpload = (docType) => {
    setUploadedDocs(prev => ({
      ...prev,
      [docType]: true
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      mobile: "",
      gender: "",
      dob: "",
      pan: "",
      aadhaar: "",
      income: "",
      employment: "",
      pincode: "",
      bankName: "",
      accountNumber: "",
      ifsc: "",
      businessType: "",
      businessAge: "",
      annualTurnover: "",
      loanAmount: "",
      businessLocation: "",
      companyName: ""
    });
    setCreditScore("");
    setSelectedTenure("");
    setUploadedDocs({
      aadhaarFront: false,
      aadhaarBack: false,
      panCard: false,
      selfie: false,
      businessProof: false,
      addressProof: false,
      financialStatements: false,
      gstCertificate: false
    });
    setStep(1);
  };

  const steps = [
    "Business & Personal Info",
    "Identity & Income",
    "Loan Details",
    "Documents",
    "Bank Details",
    "Complete"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebedee] to-[#e9f6ff] py-8 px-4">
      <div className="max-w-4xl mx-auto">
      
        {/* Progress Bar */}
        <div className="bg-gradient-to-r from-[#24313a] to-[#3a5066] text-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            {step > 1 && (
              <button
                onClick={back}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                ← Back
              </button>
            )}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-white">Business Loan Application</h1>
              <p className="text-gray-300">Complete your application in simple steps</p>
            </div>
            {step > 1 && <div className="w-20"></div>}
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-2">
            {steps.map((stepLabel, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  step > index + 1 ? 'bg-grey-500 text-white' : 
                  step === index + 1 ? 'bg-[#63859e] text-white' : 'bg-gray-400'
                }`}>
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                <span className={`text-xs mt-2 text-center ${
                  step >= index + 1 ? 'text-white font-medium' : 'text-gray-300'
                }`}>
                  {stepLabel}
                </span>
              </div>
            ))}
          </div>
          
          {/* Progress Line */}
          <div className="relative -mt-0 mx-0">
            <div className="absolute top-0 left-0 h-1 bg-gray-400 w-full"></div>
            <div 
              className="absolute top-0 left-0 h-1 bg-[#63859e] transition-all duration-300"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        {/* STEP 1 - Business & Personal Information */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Business & Personal Information</h2>
              <p className="text-gray-600">Tell us about your business and your basic details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Details */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Business Type *</label>
                <select 
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  required
                >
                  <option value="">Select Business Type</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="trading">Trading</option>
                  <option value="services">Services</option>
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="startup">Startup</option>
                  <option value="msme">MSME</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Company/Business Name</label>
                <input 
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  placeholder="Your business name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Business Age (Years) *</label>
                <input 
                  value={formData.businessAge}
                  onChange={(e) => handleInputChange('businessAge', e.target.value)}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  placeholder="Years in business"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Annual Turnover (₹) *</label>
                <input 
                  value={formData.annualTurnover}
                  onChange={(e) => handleInputChange('annualTurnover', e.target.value)}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  placeholder="Last year's turnover"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Desired Loan Amount (₹) *</label>
                <input 
                  value={formData.loanAmount}
                  onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  placeholder="Loan amount required"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Business Location *</label>
                <input 
                  value={formData.businessLocation}
                  onChange={(e) => handleInputChange('businessLocation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  placeholder="City and area"
                  required
                />
              </div>

              {/* Personal Details */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input 
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                <input 
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input 
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={next}
                disabled={!isStepComplete(1)}
                className="bg-[#63859e] hover:bg-[#4a6a83] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 - Identity & Income */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Identity & Income Details</h2>
              <p className="text-gray-600">Verify your identity and income information for business loan approval</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">PAN Number *</label>
                <input 
                  value={formData.pan}
                  onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors uppercase"
                  placeholder="ABCDE1234F"
                  maxLength="10"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Aadhaar Number *</label>
                <input 
                  value={formData.aadhaar}
                  onChange={(e) => handleInputChange('aadhaar', e.target.value)}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  placeholder="12-digit Aadhaar"
                  maxLength="12"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Monthly Income *</label>
                <input 
                  value={formData.income}
                  onChange={(e) => handleInputChange('income', e.target.value)}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  placeholder="Monthly income in ₹"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Employment Type *</label>
                <select 
                  value={formData.employment}
                  onChange={(e) => handleInputChange('employment', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  required
                >
                  <option value="">Select Employment</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="business">Business Owner</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Pincode *</label>
                <input 
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  placeholder="6-digit pincode"
                  maxLength="6"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Credit Score *</label>
                <div className="flex gap-3">
                  <input 
                    value={creditScore}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                    placeholder="Credit score"
                    readOnly
                  />
                  <button
                    onClick={() => setOtpModal(true)}
                    className="bg-[#24313a] hover:bg-[#1a252c] text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
                  >
                    Fetch Score
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={back}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={next}
                disabled={!isStepComplete(2)}
                className="bg-[#63859e] hover:bg-[#4a6a83] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Check Eligibility
              </button>
            </div>
          </div>
        )}

        {/* OTP Modal */}
        {otpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                Verify Your Identity
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Enter 6-digit OTP sent to your mobile
              </p>

              <div className="flex justify-between gap-3 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#63859e] focus:ring-2 focus:ring-[#63859e]/20 transition-colors"
                  />
                ))}
              </div>

              <button
                onClick={verifyOtp}
                className="w-full bg-[#63859e] hover:bg-[#4a6a83] text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Verify OTP
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 - Loan Details & Eligibility */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-green-600">✓</span>
            </div>
            
            <h2 className="text-2xl font-bold text-green-600 mb-4">Congratulations! Your Business Loan is Approved</h2>
            <p className="text-gray-600 mb-8">Based on your profile, here's your personalized business loan offer</p>

            <div className="bg-blue-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Business Type:</span>
                  <span className="font-semibold text-gray-800">{formData.businessType || "Manufacturing"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Amount:</span>
                  <span className="font-bold text-xl text-gray-800">₹{formData.loanAmount || '25,00,000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span className="font-semibold text-gray-800">11.5% per annum</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="font-semibold text-gray-800">₹15,000</span>
                </div>
              </div>
            </div>

            <div className="max-w-md mx-auto mb-8">
              <h4 className="font-semibold text-gray-800 mb-4">Choose Your Loan Tenure *</h4>
              <div className="space-y-3">
                {[
                  { months: 12, emi: "2,21,253" },
                  { months: 24, emi: "1,17,253" },
                  { months: 36, emi: "82,253" },
                  { months: 48, emi: "65,253" },
                  { months: 60, emi: "55,253" }
                ].map((plan, index) => (
                  <label key={index} className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-[#63859e] cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="tenure" 
                      className="mr-3" 
                      value={plan.months}
                      onChange={(e) => setSelectedTenure(e.target.value)}
                    />
                    <div className="flex-1 text-left">
                      <span className="font-semibold">{plan.months} months</span>
                      <span className="text-gray-600 ml-2">- ₹{plan.emi}/month</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={back}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={next}
                disabled={!isStepComplete(3)}
                className="bg-[#63859e] hover:bg-[#4a6a83] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Continue to Documents
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 - Document Upload */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Documents</h2>
              <p className="text-gray-600">Please upload the required documents for business loan verification</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Aadhaar Front", type: "PDF/Image", key: "aadhaarFront" },
                { title: "Aadhaar Back", type: "PDF/Image", key: "aadhaarBack" },
                { title: "PAN Card", type: "PDF/Image", key: "panCard" },
                { title: "Business Proof", type: "PDF/Image", key: "businessProof" },
                { title: "Address Proof", type: "PDF/Image", key: "addressProof" },
                { title: "Financial Statements", type: "PDF", key: "financialStatements" },
                { title: "GST Certificate", type: "PDF/Image", key: "gstCertificate" },
                { title: "Selfie Photo", type: "Image", key: "selfie" }
              ].map((doc, index) => (
                <div key={index} className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  uploadedDocs[doc.key] 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-[#63859e]'
                }`}>
                  <div className={`text-3xl mb-3 ${
                    uploadedDocs[doc.key] ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {uploadedDocs[doc.key] ? '✓' : '📄'}
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{doc.title}</h4>
                  <p className="text-sm text-gray-500">{doc.type}</p>
                  {!uploadedDocs[doc.key] ? (
                    <div className="mt-3">
                      <input
                        type="file"
                        id={`file-${doc.key}`}
                        className="hidden"
                        onChange={() => handleDocumentUpload(doc.key)}
                        accept={doc.type === "Image" ? "image/*" : ".pdf,.jpg,.jpeg,.png"}
                      />
                      <label
                        htmlFor={`file-${doc.key}`}
                        className="bg-[#63859e] hover:bg-[#4a6a83] text-white px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer inline-block"
                      >
                        Upload File
                      </label>
                    </div>
                  ) : (
                    <div className="mt-3 text-green-600 text-sm font-medium">
                      ✓ Uploaded Successfully
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={back}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={next}
                disabled={!isStepComplete(4)}
                className="bg-[#63859e] hover:bg-[#4a6a83] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Continue to Bank Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 - Bank Details */}
        {step === 5 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bank Information</h2>
              <p className="text-gray-600">Where should we disburse your business loan amount?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Bank Name *</label>
                <select 
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  required
                >
                  <option value="">Select Bank</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="axis">Axis Bank</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Account Number *</label>
                <input 
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors"
                  placeholder="Bank account number"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">IFSC Code *</label>
                <input 
                  value={formData.ifsc}
                  onChange={(e) => handleInputChange('ifsc', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63859e] focus:border-[#63859e] transition-colors uppercase"
                  placeholder="Bank IFSC code"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={back}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={next}
                disabled={!isStepComplete(5)}
                className="bg-[#63859e] hover:bg-[#4a6a83] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Submit Application
              </button>
            </div>
          </div>
        )}

        {/* STEP 6 - Success */}
        {step === 6 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl text-green-600">✓</span>
            </div>
            
            <h2 className="text-3xl font-bold text-green-600 mb-4">Business Loan Application Submitted Successfully!</h2>
            <p className="text-xl text-gray-600 mb-8">
              Your business loan application has been received and is under review.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto mb-8">
              <h4 className="font-semibold text-gray-800 mb-4">What's Next?</h4>
              <ul className="text-left space-y-2 text-gray-600">
                <li>• Application verification (3-5 business days)</li>
                <li>• Business verification and site visit</li>
                <li>• Document validation</li>
                <li>• Credit assessment</li>
                <li>• Final approval notification</li>
                <li>• Loan disbursement to your account</li>
              </ul>
            </div>

            <button
              onClick={resetForm}
              className="bg-[#63859e] hover:bg-[#4a6a83] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Apply for Another Business Loan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}