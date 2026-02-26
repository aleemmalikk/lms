"use client";

import { useState } from "react";
import { Building2, Briefcase, IndianRupee, Calendar, User, Mail, Phone, MapPin, FileText, CheckCircle } from "lucide-react";

export default function BusinessLoanPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    businessName: "",
    businessType: "",
    annualTurnover: "",
    businessAge: "",
    city: "",
    panNumber: "",
    loanAmount: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Car Loan Application:", formData);
    setShowSuccess(true);
    
    // Auto hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    
    // Reset form after submission
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      businessName: "",
      businessType: "",
      annualTurnover: "",
      businessAge: "",
      city: "",
      panNumber: "",
      loanAmount: "",
    });
  };

  const businessTypes = [
    "Sole Proprietorship",
    "Partnership",
    "Private Limited",
    "LLP",
    "Public Limited",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-slideIn">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-semibold">Application Submitted!</p>
            <p className="text-sm opacity-90">We'll contact you within 24 hours</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-full inline-flex shadow-xl">
                <Building2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Car Loan Application
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
           Accelerate your journey with flexible car loan solutions. Secure funding from ₹5 lakhs to ₹2 crores with minimal documentation and instant approval support.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Personal Information Section */}
            <div className="space-y-6 mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                      placeholder="Enter first name"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{10}"
                      maxLength="10"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                      placeholder="Enter 10 digit mobile"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details Section */}
          

            {/* Quick Tips Section */}
           

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium text-lg flex items-center shadow-lg shadow-green-500/30"
              >
                Submit Application
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Features Section */}
       
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}