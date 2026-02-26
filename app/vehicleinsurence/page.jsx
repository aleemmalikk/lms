"use client";

import { useState } from "react";
import { FaCheckCircle, FaCheck } from "react-icons/fa";

export default function VehicleInsuranceForm() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    // Reset all form fields
    document.querySelectorAll("input, select").forEach((element) => {
      if (["text", "email", "tel", "number", "date"].includes(element.type)) element.value = "";
      if (element.type === "checkbox") element.checked = false;
      if (element.type === "radio") element.checked = element.value === "no";
    });

    // Reset selects
    const vehicleType = document.getElementById("vehicleType");
    const insuranceType = document.getElementById("insuranceType");
    const vehicleMake = document.getElementById("vehicleMake");
    const vehicleModel = document.getElementById("vehicleModel");
    const fuelType = document.getElementById("fuelType");
    const policyTerm = document.getElementById("policyTerm");

    if (vehicleType) vehicleType.value = "";
    if (insuranceType) insuranceType.value = "";
    if (vehicleMake) vehicleMake.value = "";
    if (vehicleModel) vehicleModel.value = "";
    if (fuelType) fuelType.value = "";
    if (policyTerm) policyTerm.value = "";

    setCurrentStep(1);
  };

  const stepsArray = [1, 2, 3, 4];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaecee] to-[#f4f5f7] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar - Updated Gradient Theme */}
        <div className="bg-gradient-to-r from-[#24313a] to-[#63859e] text-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 text-white hover:text-[#a8c2d6] transition-colors"
              >
                ← Back
              </button>
            )}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-white">Apply For Vehicle Insurance</h1>
              <p className="text-[#a8c2d6]">Complete the application in 4 simple steps</p>
            </div>
            {currentStep > 1 && <div className="w-20"></div>}
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-2">
            {stepsArray.map((step) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  currentStep > step ? 'bg-green-500' : 
                  currentStep === step ? 'bg-white text-[#24313a]' : 'bg-[#8ca7bc]'
                }`}>
                  {currentStep > step ? '✓' : step}
                </div>
                <span className={`text-xs mt-2 text-center ${
                  currentStep >= step ? 'text-white font-medium' : 'text-[#a8c2d6]'
                }`}>
                  {step === 1 && 'Vehicle Details'}
                  {step === 2 && 'Owner Info'}
                  {step === 3 && 'Coverage'}
                  {step === 4 && 'Review'}
                </span>
              </div>
            ))}
          </div>
          
          {/* Progress Line */}
          <div className="relative -mt-0 mx-0">
            <div className="absolute top-0 left-0 h-1 bg-[#8ca7bc] w-full"></div>
            <div 
              className="absolute top-0 left-0 h-1 bg-white transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (stepsArray.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Step 1: Vehicle Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Details</h2>
              <p className="text-gray-600">Let's start with your vehicle information</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <select 
                    id="vehicleType" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="commercial">Commercial Vehicle</option>
                    <option value="ev">Electric Vehicle</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="insuranceType" className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Type
                  </label>
                  <select 
                    id="insuranceType" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  >
                    <option value="">Select Insurance Type</option>
                    <option value="comprehensive">Comprehensive</option>
                    <option value="thirdparty">Third Party</option>
                    <option value="ownDamage">Own Damage</option>
                    <option value="zeroDep">Zero Depreciation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="vehicleMake" className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Make
                  </label>
                  <select 
                    id="vehicleMake" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  >
                    <option value="">Select Make</option>
                    <option value="maruti">Maruti Suzuki</option>
                    <option value="hyundai">Hyundai</option>
                    <option value="tata">Tata</option>
                    <option value="mahindra">Mahindra</option>
                    <option value="honda">Honda</option>
                    <option value="toyota">Toyota</option>
                    <option value="kia">Kia</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Model
                  </label>
                  <input 
                    type="text" 
                    id="vehicleModel" 
                    placeholder="Enter vehicle model"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="registrationYear" className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Year
                  </label>
                  <select 
                    id="registrationYear" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  >
                    <option value="">Select Year</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                    <option value="2019">2019</option>
                    <option value="2018">2018</option>
                    <option value="2017">2017</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type
                  </label>
                  <select 
                    id="fuelType" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="cng">CNG</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="policyTerm" className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Term
                  </label>
                  <select 
                    id="policyTerm" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  >
                    <option value="">Select Term</option>
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="vehicleValue" className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Value (₹)
                  </label>
                  <input 
                    type="number" 
                    id="vehicleValue" 
                    placeholder="Enter vehicle value"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
                <button 
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  onClick={resetForm}
                >
                  Reset Form
                </button>
                <button 
                  className="px-8 py-3 bg-[#24313a] text-white rounded-lg hover:bg-[#1a242c] transition-colors font-medium shadow-lg hover:shadow-xl"
                  onClick={nextStep}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Owner Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Owner Information</h2>
              <p className="text-gray-600">Tell us about the vehicle owner</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    id="fullName" 
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input 
                    type="date" 
                    id="dateOfBirth" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile No
                  </label>
                  <input 
                    type="tel" 
                    id="mobile" 
                    placeholder="Enter your mobile number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input 
                    type="text" 
                    id="address" 
                    placeholder="Enter your address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input 
                    type="text" 
                    id="pincode" 
                    placeholder="Enter pincode"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="drivingLicense" className="block text-sm font-medium text-gray-700 mb-2">
                    Driving License No
                  </label>
                  <input 
                    type="text" 
                    id="drivingLicense" 
                    placeholder="Enter driving license number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="previousPolicy" className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Policy No
                  </label>
                  <input 
                    type="text" 
                    id="previousPolicy" 
                    placeholder="Enter previous policy number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
                <button 
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  onClick={prevStep}
                >
                  Previous
                </button>
                <button 
                  className="px-8 py-3 bg-[#24313a] text-white rounded-lg hover:bg-[#1a242c] transition-colors font-medium shadow-lg hover:shadow-xl"
                  onClick={nextStep}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Additional Coverage */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Additional Coverage</h2>
              <p className="text-gray-600">Customize your insurance coverage</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do you want Zero Depreciation Cover?
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="zeroDepreciation" value="yes" className="w-4 h-4 text-[#24313a]" /> 
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="zeroDepreciation" value="no" defaultChecked className="w-4 h-4 text-[#24313a]" /> 
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do you want Engine Protection Cover?
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="engineProtection" value="yes" className="w-4 h-4 text-[#24313a]" /> 
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="engineProtection" value="no" defaultChecked className="w-4 h-4 text-[#24313a]" /> 
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do you want NCB Protection?
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="ncbProtection" value="yes" className="w-4 h-4 text-[#24313a]" /> 
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="ncbProtection" value="no" defaultChecked className="w-4 h-4 text-[#24313a]" /> 
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Additional Coverage Options
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      "Roadside Assistance",
                      "Key Replacement",
                      "Tyre Cover",
                      "Consumables Cover",
                      "Return to Invoice",
                      "Personal Accident",
                    ].map((coverage) => (
                      <div key={coverage.toLowerCase()} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          id={coverage.toLowerCase()} 
                          className="w-4 h-4 text-[#24313a] rounded focus:ring-[#24313a]"
                        />
                        <label 
                          htmlFor={coverage.toLowerCase()} 
                          className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                        >
                          {coverage}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="previousClaims" className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Claims (if any)
                  </label>
                  <textarea 
                    id="previousClaims" 
                    placeholder="Details of previous insurance claims"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="ncbPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                    No Claim Bonus (NCB) %
                  </label>
                  <select 
                    id="ncbPercentage" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#24313a] focus:border-[#24313a] transition-colors"
                  >
                    <option value="">Select NCB Percentage</option>
                    <option value="0">0% (No NCB)</option>
                    <option value="20">20%</option>
                    <option value="25">25%</option>
                    <option value="35">35%</option>
                    <option value="45">45%</option>
                    <option value="50">50%</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
                <button 
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  onClick={prevStep}
                >
                  Previous
                </button>
                <button 
                  className="px-8 py-3 bg-[#24313a] text-white rounded-lg hover:bg-[#1a242c] transition-colors font-medium shadow-lg hover:shadow-xl"
                  onClick={nextStep}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Review</h2>
              <p className="text-gray-600">Review your application before submitting</p>

              <div className="bg-[#f0f5f9] p-6 rounded-lg border border-[#d1dee9]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Details</h3>
                <div className="space-y-3">
                  <p className="flex justify-between"><span className="text-gray-600">Vehicle Type:</span> <span className="font-medium">Car</span></p>
                  <p className="flex justify-between"><span className="text-gray-600">Insurance Type:</span> <span className="font-medium">Comprehensive</span></p>
                  <p className="flex justify-between"><span className="text-gray-600">Vehicle Make:</span> <span className="font-medium">Maruti Suzuki</span></p>
                  <p className="flex justify-between"><span className="text-gray-600">Fuel Type:</span> <span className="font-medium">Petrol</span></p>
                  <p className="flex justify-between"><span className="text-gray-600">Policy Term:</span> <span className="font-medium">1 Year</span></p>
                </div>
              </div>

              <div className="bg-[#f0f5f9] p-6 rounded-lg border border-[#d1dee9]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Benefits Included</h3>
                <ul className="space-y-3">
                  {[
                    "Third Party Liability Cover",
                    "Own Damage Cover",
                    "Personal Accident Cover",
                    "Theft Protection",
                    "Natural Calamities Cover",
                    "Man-made Disasters Cover",
                    "24/7 Roadside Assistance",
                    "Cashless Claim Settlement",
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-start space-x-3">
                      <FaCheck className="text-green-500 mt-1 flex-shrink-0" /> 
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#f0f5f9] p-6 rounded-lg border border-[#d1dee9]">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-gray-600"><strong>Insurance Premium</strong></p>
                  <p className="font-semibold">₹12,450</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600"><strong>GST (18%)</strong></p>
                  <p className="font-semibold">₹2,241</p>
                </div>
              </div>

              <div className="bg-[#24313a] p-6 rounded-lg border border-[#1a242c] text-center">
                <div className="text-xl font-bold text-white">Total Amount: ₹14,691</div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
                <button 
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  onClick={prevStep}
                >
                  Previous
                </button>
                <button 
                  className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-lg hover:shadow-xl"
                  onClick={nextStep}
                >
                  Buy Policy
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === 5 && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <FaCheckCircle className="text-green-500 text-4xl" />
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Application Submitted Successfully!</h2>
              <p className="text-gray-600 mb-6 text-lg">
                Your vehicle insurance application has been received. Our team will review your
                application and contact you within 24 hours.
              </p>
              
              <div className="bg-[#f0f5f9] rounded-xl p-6 max-w-md mx-auto mb-8">
                <h4 className="font-semibold text-gray-800 mb-4">What's Next?</h4>
                <ul className="text-left space-y-2 text-gray-600">
                  <li>• Document verification (1-2 business days)</li>
                  <li>• Vehicle inspection (if required)</li>
                  <li>• Policy approval notification</li>
                  <li>• Policy document delivery</li>
                </ul>
              </div>

              <button 
                className="px-8 py-3 bg-[#24313a] text-white rounded-lg hover:bg-[#1a242c] transition-colors font-medium shadow-lg hover:shadow-xl"
                onClick={resetForm}
              >
                Apply for Another Policy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
