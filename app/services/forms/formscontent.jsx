"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaSpinner, FaWallet, FaCheckCircle, FaTimes, FaUser, FaEnvelope, FaPhone, FaMoneyBillWave, FaCalendar, FaFileUpload, FaSearch, FaCreditCard, FaReceipt, FaDownload } from "react-icons/fa";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from '../../lib/api';


export default function FormsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subcategoryId = searchParams.get("subcategory");
  const categoryId = searchParams.get("category");
  const serviceName = searchParams.get("name");
  
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [billDetails, setBillDetails] = useState(null);
  const [showBillSummary, setShowBillSummary] = useState(false);
  const [isFetchingBill, setIsFetchingBill] = useState(false);
  
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isCategoryForm, setIsCategoryForm] = useState(false);

  // Field options for dropdowns
  const fieldOptions = {
    state: ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal'],
    city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'],
    service_provider: ['BSES Yamuna', 'BSES Rajdhani', 'Tata Power', 'Adani Electricity', 'UPPCL', 'NPCL'],
    operator: ['Airtel', 'Jio', 'Vi', 'BSNL'],
    biller: ['Indane Gas', 'Bharat Gas', 'HP Gas'],
    bank_name: ['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB'],
    vehicle_type: ['Two Wheeler', 'Four Wheeler', 'Commercial Vehicle'],
    loan_type: ['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan'],
    ott_platform: ['Netflix', 'Amazon Prime', 'Disney+ Hotstar', 'ZEE5'],
    subscription_plan: ['Basic', 'Standard', 'Premium', 'Family'],
    connection_type: ['Residential', 'Commercial', 'Industrial'],
    payment_method: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking'],
    validity: ['1 Month', '3 Months', '6 Months', '1 Year'],
    institute_name: ['Delhi University', 'Mumbai University', 'Bangalore University', 'Calcutta University'],
     'water_board': [
    'Delhi Jal Board',
    'Mumbai Municipal Corporation Water Department', 
    'Chennai Metro Water',
    'Bangalore Water Supply',
    'Hyderabad Metropolitan Water Supply',
    'Kolkata Municipal Corporation Water',
    'Pune Municipal Corporation Water',
    'Other Water Board'
  ],
  
  'broadband_name': [
    'Airtel Xstream Fiber',
    'JioFiber',
    'ACT Fibernet',
    'Hathway',
    'Spectra',
    'Excitel',
    'Tikona',
    'BSNL Fiber',
    'Other Broadband Provider'
  ],
  
  'corporation': [
    'Municipal Corporation of Delhi (MCD)',
    'Brihanmumbai Municipal Corporation (BMC)',
    'Chennai Municipal Corporation',
    'Kolkata Municipal Corporation',
    'Bangalore Municipal Corporation',
    'Hyderabad Municipal Corporation',
    'Pune Municipal Corporation',
    'Ahmedabad Municipal Corporation',
    'Other Municipal Corporation'
  ],

  'dth_operator': [
    'Dish TV', 'Tata Sky', 'Airtel Digital TV', 'Sun Direct', 'Videocon d2h',
    'Reliance Digital TV', 'Independent TV', 'DD Free Dish'
  ],
  
  'cable_operator': [
    'Hathway', 'DEN Networks', 'Siti Cable', 'In Cable', 'GTPL',
    'Fastway', 'NXT Digital', 'Other Cable Operator'
  ],
  
  'student_relation': [
    'Son', 'Daughter', 'Self', 'Ward', 'Brother', 'Sister', 'Other'
  ],
  
  'payment_option': [
    'Pay Full Amount', 'Pay Minimum Amount', 'Pay Other Amount'
  ],
  
  'traffic_authority': [
    'Delhi Traffic Police', 'Mumbai Traffic Police', 'Bangalore Traffic Police',
    'Chennai Traffic Police', 'Kolkata Traffic Police', 'Hyderabad Traffic Police',
    'Pune Traffic Police', 'Ahmedabad Traffic Police', 'State RTO'
  ],
  
  'taxpayer_relation': [
    'Owner', 'Tenant', 'Legal Heir', 'Power of Attorney', 'Other'
  ],
  
  'financial_year': [
    '2023-2024', '2024-2025', '2025-2026', '2026-2027', '2027-2028'
  ],
  
  'assessment_year': [
    '2024-2025', '2025-2026', '2026-2027', '2027-2028', '2028-2029'
  ]
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setAccessToken(token);
    
    if (categoryId) {
      setIsCategoryForm(true);
      fetchCategoryFormFields(token);
    } else if (subcategoryId) {
      setIsCategoryForm(false);
      fetchSubcategoryFormFields(token);
    }
    
    fetchWalletBalance(token);
  }, [categoryId, subcategoryId]);

  const fetchWalletBalance = async (token) => {
    try {
      const response = await axios.get(
        `${BASE_URL}wallets/balance/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWalletBalance(response.data.balance || 0);
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
    }
  };

  const fetchCategoryFormFields = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(
        `${BASE_URL}categories/${categoryId}/`,
        { headers }
      );
      
      const categoryData = response.data;
      
      if (categoryData.required_fields && categoryData.required_fields.length > 0) {
        setFormFields(categoryData.required_fields);
        
        const initialData = {};
        categoryData.required_fields.forEach(field => {
          initialData[field.field_name] = '';
        });
        setFormData(initialData);
      } else {
        setError("No form fields configured for this service category");
      }
      
    } catch (err) {
      console.error("Error fetching category form fields:", err);
      setError("Failed to load form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategoryFormFields = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(
        `${BASE_URL}services/subcategories/${subcategoryId}/`,
        { headers }
      );
      
      const subcategoryData = response.data;
      
      if (subcategoryData.required_fields && subcategoryData.required_fields.length > 0) {
        setFormFields(subcategoryData.required_fields);
        
        const initialData = {};
        subcategoryData.required_fields.forEach(field => {
          initialData[field.field_name] = '';
        });
        setFormData(initialData);
      } else {
        setError("No form fields configured for this service");
      }
      
    } catch (err) {
      console.error("Error fetching form fields:", err);
      setError("Failed to load form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    const updatedFormData = {
      ...formData,
      [fieldName]: value
    };
    setFormData(updatedFormData);

    const identifierFields = ['consumer_number', 'mobile_number', 'account_number', 'bill_number', 
                             'vehicle_number', 'card_number', 'flat_number', 'challan_number', 
                             'student_id', 'subscriber_id'];
    
    if (identifierFields.includes(fieldName) && value && value.length >= 3) {
      autoFetchBill(fieldName, value);
    }
  };

  const autoFetchBill = async (fieldName, value) => {
    if (isFetchingBill) return;
    
    setIsFetchingBill(true);
    try {
      const response = await axios.post(
        `${BASE_URL}services/fetch-bill-details-enhanced/`,
        {
          identifier: value,
          service_type: serviceName?.toLowerCase(),
          subcategory_id: subcategoryId
        }
      );

      if (response.data.success) {
        setBillDetails(response.data.bill_details);
        setShowBillSummary(true);
        
        const billData = response.data.bill_details;
        const updatedData = { ...formData };
        
        if (billData.consumer_name && !updatedData.customer_name) {
          updatedData.customer_name = billData.consumer_name;
        }
        if (billData.bill_amount && !updatedData.amount) {
          updatedData.amount = billData.bill_amount;
          setPaymentAmount(billData.bill_amount);
        }
        if (billData.service_provider && !updatedData.service_provider) {
          updatedData.service_provider = billData.service_provider;
        }
        
        setFormData(updatedData);
      }
    } catch (error) {
      console.log('No bill found or bill fetch failed');
    } finally {
      setIsFetchingBill(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const amount = formData.amount || formData.emi_amount || formData.total_amount || 0;
      if (amount > 0) {
        setPaymentAmount(parseFloat(amount));
        setCurrentStep(2);
      } else {
        await submitFormDirectly();
      }
    } catch (err) {
      setError(err.message || "Failed to process form");
    } finally {
      setSubmitting(false);
    }
  };

  const proceedToPayment = () => {
    setCurrentStep(3);
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setCurrentStep(4);
  };

  const submitFormDirectly = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("Please login again to submit the form");
    }

    const formDataToSend = new FormData();
    
    if (isCategoryForm) {
      formDataToSend.append('service_category', categoryId);
      formDataToSend.append('service_type', 'direct_category');
    } else {
      formDataToSend.append('service_subcategory', subcategoryId);
    }
    
    formDataToSend.append('customer_name', formData.customer_name || "");
    formDataToSend.append('customer_email', formData.customer_email || "");
    formDataToSend.append('customer_phone', formData.customer_phone || "");
    formDataToSend.append('amount', paymentAmount);
    formDataToSend.append('notes', `Service submission for ${serviceName}`);
    formDataToSend.append('status', 'submitted');

    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        formDataToSend.append(key, formData[key]);
      }
    });

    const submitEndpoint = isCategoryForm 
      ? `${BASE_URL}services/create-direct-category-form/`
      : `${BASE_URL}services/create-submission-direct/`;

    const response = await axios.post(
      submitEndpoint,
      formDataToSend,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      }
    );

    return response.data;
  };

  const handlePayment = async (pinOrOtp) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        throw new Error("Please login again to process payment");
      }

      // First submit the form
      const submissionResponse = await submitFormDirectly();
      const submissionId = submissionResponse.id;

      // Process payment based on selected method
      if (paymentMethod === 'wallet') {
        await processWalletPayment(token, submissionId, pinOrOtp);
      } else {
        await processCardPayment(token, submissionId, pinOrOtp);
      }
      
      await handleCommissionProcessing(submissionId, token);
      
      setCurrentStep(5); 
      
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Payment failed");
      setCurrentStep(6); 
    } finally {
      setSubmitting(false);
    }
  };

  const processWalletPayment = async (token, submissionId, pin) => {
    const paymentResponse = await axios.post(
      `${BASE_URL}transactions/pay_for_service/`,
      {
        amount: paymentAmount,
        pin: pin,
        service_charge: 0,
        service_submission_id: submissionId,
        description: `Payment for ${serviceName}`,
        transaction_category: 'service_payment',
        transaction_type: 'debit'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return paymentResponse.data;
  };

  const processCardPayment = async (token, submissionId, otp) => {
    // Simulate card payment processing
    const paymentResponse = await axios.post(
      `${BASE_URL}transactions/process_card_payment/`,
      {
        amount: paymentAmount,
        otp: otp,
        service_submission_id: submissionId,
        description: `Card Payment for ${serviceName}`
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return paymentResponse.data;
  };

  // Commission processing function
  const handleCommissionProcessing = async (submissionId, token) => {
    try {
      console.log("🔄 Starting commission processing for submission:", submissionId);
      
      const commissionResponse = await axios.post(
        '${BASE_URL}commission-transactions/emergency_commission_fix/',
        {
          submission_id: submissionId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Commission processing result:", commissionResponse.data);
      
      if (commissionResponse.data.success) {
        // Show commission distribution details
        const commissionDetails = commissionResponse.data.commission_distribution || [];
        let commissionMessage = `Commission distributed successfully!\n\n`;
        
        commissionDetails.forEach(commission => {
          commissionMessage += `${commission.user} (${commission.role}): ₹${commission.commission_amount}\n`;
        });
        
        commissionMessage += `\nTotal: ₹${commissionResponse.data.total_commissions || commissionDetails.reduce((sum, c) => sum + c.commission_amount, 0)}`;
        
        console.log(commissionMessage);
        
        // Refresh wallet balance after commission
        await fetchWalletBalance(token);
      } else {
        console.log("Commission processing failed:", commissionResponse.data.message);
      }
      
    } catch (error) {
      console.error('Auto commission processing failed:', error);
    }
  };

  // Field rendering functions
  const getFieldIcon = (fieldType, fieldName = '') => {
    switch (fieldType) {
      case 'text':
        if (fieldName.includes('name')) return <FaUser className="text-gray-400 text-xs" />;
        return <FaUser className="text-gray-400 text-xs" />;
      case 'email':
        return <FaEnvelope className="text-gray-400 text-xs" />;
      case 'phone':
        return <FaPhone className="text-gray-400 text-xs" />;
      case 'amount':
        return <FaMoneyBillWave className="text-gray-400 text-xs" />;
      case 'date':
        return <FaCalendar className="text-gray-400 text-xs" />;
      case 'file':
        return <FaFileUpload className="text-gray-400 text-xs" />;
      default:
        return <FaUser className="text-gray-400 text-xs" />;
    }
  };

  const renderField = (field) => {
    const commonProps = {
      required: field.required,
      className: "w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200 text-xs",
      value: formData[field.field_name] || "",
      onChange: (e) => handleInputChange(field.field_name, e.target.value)
    };

    switch (field.field_type) {
      case 'text':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              {getFieldIcon('text', field.field_name)}
            </div>
            <input 
              type="text" 
              {...commonProps}
              className={`${commonProps.className} pl-8`}
              placeholder={`Enter ${field.field_label}`}
            />
          </div>
        );
      
      case 'phone':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <FaPhone className="text-gray-400 text-xs" />
            </div>
            <input 
              type="tel" 
              {...commonProps}
              className={`${commonProps.className} pl-8`}
              placeholder="Enter 10-digit mobile number"
              pattern="[0-9]{10}"
              maxLength="10"
            />
          </div>
        );
      
      case 'email':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400 text-xs" />
            </div>
            <input 
              type="email" 
              {...commonProps}
              className={`${commonProps.className} pl-8`}
              placeholder="Enter email address"
            />
          </div>
        );
      
      case 'amount':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <FaMoneyBillWave className="text-gray-400 text-xs" />
            </div>
            <input 
              type="number" 
              step="0.01" 
              {...commonProps}
              className={`${commonProps.className} pl-8`}
              placeholder="Enter amount"
              min="0"
            />
          </div>
        );
      
      case 'select':
        const options = fieldOptions[field.field_name] || [];
        return (
          <select {...commonProps} className={`${commonProps.className} cursor-pointer`}>
            <option value="">Select {field.field_label}</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea 
            {...commonProps} 
            rows={2}
            className={`${commonProps.className} resize-none`}
            placeholder={`Enter ${field.field_label}`}
          />
        );
      
      case 'date':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <FaCalendar className="text-gray-400 text-xs" />
            </div>
            <input 
              type="date" 
              {...commonProps}
              className={`${commonProps.className} pl-8`}
            />
          </div>
        );
      
      case 'file':
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <FaFileUpload className="text-gray-400 text-xs" />
            </div>
            <input 
              type="file" 
              {...commonProps}
              className={`${commonProps.className} pl-8 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
              onChange={(e) => handleInputChange(field.field_name, e.target.files[0])}
            />
          </div>
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg bg-white">
            <input 
              type="checkbox"
              checked={formData[field.field_name] || false}
              onChange={(e) => handleInputChange(field.field_name, e.target.checked)}
              className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
            />
            <label className="text-xs text-gray-700 font-medium">{field.field_label}</label>
          </div>
        );
      
      case 'button':
        if (field.field_name === 'browse_plan') {
          return (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  alert('Browse Plans functionality will be implemented soon');
                }}
                className="px-2 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium text-xs shadow-sm hover:shadow flex items-center gap-1"
              >
                <FaSearch className="text-xs" />
                {field.field_label}
              </button>
            </div>
          );
        } else {
          return (
            <button
              type="button"
              onClick={() => {
                if (field.field_name === 'fetch_plan') {
                  alert('Fetch Plans functionality will be implemented soon');
                }
              }}
              className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-xs shadow-sm hover:shadow"
            >
              {field.field_label}
            </button>
          );
        }
      
      default:
        return (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <FaUser className="text-gray-400 text-xs" />
            </div>
            <input 
              type="text" 
              {...commonProps}
              className={`${commonProps.className} pl-8`}
              placeholder={`Enter ${field.field_label}`}
            />
          </div>
        );
    }
  };

  // Step 1: Form
  const renderFormStep = () => (
    <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {formFields.map((field, index) => (
            <div 
              key={field.field_name} 
              className={`space-y-2 ${
                field.field_type === 'button' || field.field_type === 'textarea' ? 'md:col-span-2' : ''
              } ${
                field.field_name === 'browse_plan' ? 'flex justify-end' : ''
              }`}
            >
              {field.field_type !== 'button' && field.field_type !== 'boolean' && (
                <label className="block text-sm font-medium text-gray-700">
                  {field.field_label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}
              {renderField(field)}
              {field.field_type === 'phone' && (
                <p className="text-xs text-gray-500">10-digit mobile number required</p>
              )}
            </div>
          ))}
        </div>
        
        {/* Bill Fetch Loading */}
        {isFetchingBill && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center">
              <FaSpinner className="animate-spin text-blue-600 mr-2" />
              <span className="text-blue-700">Fetching bill details...</span>
            </div>
          </div>
        )}

        {/* Bill Summary */}
        {showBillSummary && billDetails && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <FaCheckCircle className="mr-2" />
              Bill Details Found
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Customer:</span>
                <p className="font-medium">{billDetails.consumer_name || billDetails.customer_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Amount:</span>
                <p className="font-medium text-green-700">₹{billDetails.bill_amount || billDetails.total_amount}</p>
              </div>
              <div>
                <span className="text-gray-600">Due Date:</span>
                <p className="font-medium">{billDetails.due_date}</p>
              </div>
              {billDetails.service_provider && (
                <div>
                  <span className="text-gray-600">Provider:</span>
                  <p className="font-medium">{billDetails.service_provider}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="flex-1 px-4 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !accessToken}
            className="flex-1 px-4 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow"
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : !accessToken ? (
              "Please Login First"
            ) : (
              "Proceed to Payment"
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Step 2: Bill Details Confirmation
  const renderBillDetailsStep = () => (
    <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Confirm Bill Details</h3>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600">Service:</span>
            <p className="font-semibold text-lg">{serviceName}</p>
          </div>
          <div>
            <span className="text-gray-600">Amount:</span>
            <p className="font-bold text-2xl text-green-600">₹{paymentAmount}</p>
          </div>
          {billDetails?.due_date && (
            <div>
              <span className="text-gray-600">Due Date:</span>
              <p className="font-medium">{billDetails.due_date}</p>
            </div>
          )}
          {billDetails?.consumer_number && (
            <div>
              <span className="text-gray-600">Consumer No:</span>
              <p className="font-medium">{billDetails.consumer_number}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 px-4 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Back to Form
        </button>
        <button
          onClick={proceedToPayment}
          className="flex-1 px-4 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );

  // Step 3: Payment Method Selection
  const renderPaymentMethodStep = () => (
    <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Select Payment Method</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handlePaymentMethodSelect('wallet')}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              paymentMethod === 'wallet' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <FaWallet className="text-lg" />
            </div>
            <div>
              <h4 className="font-semibold">Wallet</h4>
              <p className="text-sm text-gray-600">Balance: ₹{walletBalance}</p>
            </div>
          </div>
        </div>

        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handlePaymentMethodSelect('card')}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              paymentMethod === 'card' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <FaCreditCard className="text-lg" />
            </div>
            <div>
              <h4 className="font-semibold">Credit/Debit Card</h4>
              <p className="text-sm text-gray-600">Pay using card</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(2)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          disabled={!paymentMethod}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Step 4: Payment Screen
  const renderPaymentStep = () => (
    <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        {paymentMethod === 'wallet' ? 'Wallet Payment' : 'Card Payment'}
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Service Amount:</span>
          <span className="font-bold text-gray-800">₹{paymentAmount}</span>
        </div>
        {paymentMethod === 'wallet' && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Your Balance:</span>
            <span className={`font-bold ${walletBalance >= paymentAmount ? 'text-green-600' : 'text-red-600'}`}>
              ₹{walletBalance}
            </span>
          </div>
        )}
      </div>

      {paymentMethod === 'wallet' && walletBalance < paymentAmount ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">Insufficient balance. Please add funds to your wallet.</p>
        </div>
      ) : (
        <PaymentVerification 
          paymentMethod={paymentMethod}
          onVerify={handlePayment}
          onCancel={() => setCurrentStep(3)}
          submitting={submitting}
          amount={paymentAmount}
        />
      )}
    </div>
  );

  // Step 5: Success Screen
  const renderSuccessStep = () => (
    <div className="bg-white rounded-xl shadow p-8 border border-green-200 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <FaCheckCircle className="text-3xl text-green-500" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
      <p className="text-gray-600 mb-6">
        Your {serviceName} payment of ₹{paymentAmount} has been processed successfully.
      </p>

      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-green-800 mb-2">Transaction Details</h4>
        <div className="text-sm text-left space-y-1">
          <div className="flex justify-between">
            <span>Service:</span>
            <span className="font-medium">{serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium">₹{paymentAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Transaction ID:</span>
            <span className="font-medium">TXN{Date.now()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => router.push("/")}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Go to Home
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
        >
          <FaDownload />
          Download Receipt
        </button>
      </div>
      
      <button
        onClick={() => router.push("/services")}
        className="w-full py-2 text-blue-600 hover:text-blue-700 transition font-medium"
      >
        Make Another Payment
      </button>
    </div>
  );

  // Step 6: Failed Screen
  const renderFailedStep = () => (
    <div className="bg-white rounded-xl shadow p-8 border border-red-200 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <FaTimes className="text-3xl text-red-500" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h3>
      <p className="text-gray-600 mb-4">
        {error || "We encountered an issue processing your payment."}
      </p>

      <div className="bg-red-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-red-800 mb-2">What you can do:</h4>
        <ul className="text-sm text-left space-y-1 text-red-700">
          <li>• Check your payment method details</li>
          <li>• Ensure sufficient balance</li>
          <li>• Try again in a few minutes</li>
          <li>• Contact support if issue persists</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(3)}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push("/")}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Go to Home
        </button>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FaSpinner className="animate-spin text-blue-600 text-xl" />
          </div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !submitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors"
            >
              <FaArrowLeft />
              Back to Services
            </Link>
            
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render with steps
  return (
    <div className="pt-5">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4 border border-blue-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaWallet className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {serviceName}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div
                            key={step}
                            className={`w-2 h-2 rounded-full ${
                              currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        Step {currentStep} of 5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                <FaWallet className="text-gray-400" />
                <span className="font-medium">Wallet: ₹{walletBalance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && currentStep <= 4 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && renderFormStep()}
        {currentStep === 2 && renderBillDetailsStep()}
        {currentStep === 3 && renderPaymentMethodStep()}
        {currentStep === 4 && renderPaymentStep()}
        {currentStep === 5 && renderSuccessStep()}
        {currentStep === 6 && renderFailedStep()}
      </div>
    </div>
  );
}

// Payment Verification Component
const PaymentVerification = ({ paymentMethod, onVerify, onCancel, submitting, amount }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handlePinChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index, length) => {
    if (e.key === 'Backspace') {
      const currentArray = paymentMethod === 'wallet' ? pin : otp;
      if (!currentArray[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = () => {
    if (paymentMethod === 'wallet') {
      const enteredPin = pin.join('');
      if (enteredPin.length === 4) {
        onVerify(enteredPin);
      } else {
        alert('Please enter complete 4-digit PIN');
      }
    } else {
      const enteredOtp = otp.join('');
      if (enteredOtp.length === 6) {
        onVerify(enteredOtp);
      } else {
        alert('Please enter complete 6-digit OTP');
      }
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4 text-center">
        {paymentMethod === 'wallet' 
          ? 'Enter your 4-digit Wallet PIN to confirm payment'
          : 'Enter the 6-digit OTP sent to your registered mobile number'
        }
      </p>
      
      <div className="flex justify-center gap-3 mb-6">
        {(paymentMethod === 'wallet' ? pin : otp).map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="password"
            maxLength={1}
            value={digit}
            onChange={(e) => paymentMethod === 'wallet' 
              ? handlePinChange(e.target.value, index)
              : handleOtpChange(e.target.value, index)
            }
            onKeyDown={(e) => handleKeyDown(e, index, paymentMethod === 'wallet' ? 4 : 6)}
            className={`text-center border border-gray-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              paymentMethod === 'wallet' ? 'w-12 h-12 text-xl' : 'w-10 h-10 text-lg'
            }`}
          />
        ))}
      </div>

      {paymentMethod === 'card' && (
        <div className="text-center mb-4">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Resend OTP
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition font-medium"
        >
          {submitting ? (
            <>
              <FaSpinner className="animate-spin inline mr-2" />
              Processing...
            </>
          ) : (
            `Pay ₹${amount}`
          )}
        </button>
      </div>
    </div>
  );
};