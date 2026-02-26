"use client";
import { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaArrowRight, FaCheckCircle, FaSignInAlt } from "react-icons/fa";
import { BASE_URL } from "../../lib/api";


export default function SignupForm() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    pan_no: "",
    admin: false,
    superadmin: false,
    master: false,
    dealer: false,
    retailer: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'radio') {
      const roleReset = {
        admin: false,
        superadmin: false,
        master: false,
        dealer: false,
        retailer: false
      };
      
      setFormData(prev => ({
        ...prev,
        ...roleReset,
        [value.toLowerCase()]: true
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    console.log("Submitting data:", formData);
    
    const res = await fetch(`${BASE_URL}singup-request/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    
    if (res.ok) {
      setIsSubmitted(true);
      console.log("Registration successful! We'll get back to you soon.");
    } else {
      // Handle API errors
      const errorMessage = data.detail || data.message || "Registration failed. Please try again.";
      console.error("API Error:", errorMessage, data);
    }
  } catch (error) {
    console.error("Network Error:", error);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleGoToLogin = () => {
    window.location.href = "/login";
  };

  const handleBackToForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      pan_no: "",
      admin: false,
      superadmin: false,
      master: false,
      dealer: false,
      retailer: false
    });
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all duration-500 scale-95 hover:scale-100">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
              <FaCheckCircle className="text-5xl text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-2">Thank you for signing up with us.</p>
          <p className="text-gray-500 text-sm mb-6">We'll get back to you soon with further details.</p>
          
          <div className="space-y-3">
            <button
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <FaSignInAlt className="text-sm" />
              Go to Login Page
            </button>
            <button
              onClick={handleBackToForm}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Back to Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full transform transition-all duration-500 hover:shadow-3xl">
        
        {/* Left Image Section */}
        <div className="md:w-2/4 w-full relative hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-700/20 z-10"></div>
          <img
            src="/image/15.png"
            alt="Signup Illustration"
            className="w-full h-full object-cover transform scale-110"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
            <h3 className="text-white text-2xl font-bold mb-2">Join Our Platform</h3>
            <p className="text-blue-100 text-sm mb-6">Start your journey with us today and unlock amazing opportunities</p>
            <div className="flex items-center gap-2 text-blue-200">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
              <span className="text-xs">Secure & Trusted Platform</span>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="md:w-3/5 w-full p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FaUser className="text-white text-xl" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-gray-500 text-sm mt-2">Fill in your details to begin your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Row */}
            <div className="flex gap-4">
              <div className="relative flex-1 group">
                <FaUser className="absolute left-3 top-3 text-gray-400 text-sm transition-colors group-focus-within:text-blue-500" />
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-300 group-hover:bg-white"
                  required
                />
              </div>

              <div className="relative flex-1 group">
                <FaUser className="absolute left-3 top-3 text-gray-400 text-sm transition-colors group-focus-within:text-blue-500" />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-300 group-hover:bg-white"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400 text-sm transition-colors group-focus-within:text-blue-500" />
              <input
                type="email"
                name="email"
                placeholder="xyz@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-300 group-hover:bg-white"
                required
              />
            </div>

            {/* Mobile and PAN */}
            <div className="flex gap-4">
              <div className="relative flex-1 group">
                <FaPhone className="absolute left-3 top-3 text-gray-400 text-sm transition-colors group-focus-within:text-blue-500" />
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Mobile No."
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-300 group-hover:bg-white"
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                />
              </div>

              <div className="relative flex-1 group">
                <FaIdCard className="absolute left-3 top-3 text-gray-400 text-sm transition-colors group-focus-within:text-blue-500" />
                <input
                  type="text"
                  name="pan_no"
                  placeholder="PAN No."
                  value={formData.pan_no}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-300 group-hover:bg-white"
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  title="Please enter a valid PAN number (e.g., ABCDE1234F)"
                />
              </div>
            </div>

            {/* Apply For - Updated for API compatibility */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <label className="block text-gray-700 font-semibold mb-4 text-sm uppercase tracking-wide">
                Apply For <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6 text-gray-700 justify-center">
                {["master", "dealer", "retailer"].map((role) => (
                  <label key={role} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={formData[role]}
                        onChange={handleChange}
                        className="sr-only"
                        required
                      />
                      <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                        formData[role] 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-400 group-hover:border-blue-400'
                      }`}>
                        {formData[role] && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <span className={`font-medium transition-colors duration-300 ${
                      formData[role] ? 'text-blue-600' : 'group-hover:text-blue-500'
                    }`}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
              {!formData.master && !formData.dealer && !formData.retailer && (
                <p className="text-red-500 text-xs mt-2 text-center">Please select a role</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || (!formData.master && !formData.dealer && !formData.retailer)}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center justify-center gap-3 group"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Create Account
                  <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Login Redirect */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}