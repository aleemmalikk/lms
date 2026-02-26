"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "../lib/api";

import {
  FaLightbulb,
  FaRupeeSign,
  FaSpinner,
  FaCalendarAlt,
  FaUser,
  FaMobile,
  FaIdCard,
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBuilding,
  FaFileInvoice,
  FaCreditCard,
  FaTimes,
  FaEye,
  FaReceipt,
  FaPrint,
  FaDownload,
  FaShieldAlt,
  FaInfoCircle,
  FaHistory,
  FaArrowRight,
  FaCopy
} from "react-icons/fa";

export default function BillPayment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingBill, setFetchingBill] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    operator_id: "",
    utility_acc_no: "",
    sender_name: "",
    mobile_no: ""
  });

  // API response data
  const [operators, setOperators] = useState([]);
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [billDetails, setBillDetails] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [operatorSearch, setOperatorSearch] = useState("");
  const [showOperators, setShowOperators] = useState(false);

  // Popup states
  const [showBillDetailsPopup, setShowBillDetailsPopup] = useState(false);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState(null);
  const [detailedBillData, setDetailedBillData] = useState(null);

  const popupRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('operators-dropdown');
      const searchInput = document.getElementById('operator-search');

      if (dropdown && searchInput &&
        !dropdown.contains(event.target) &&
        !searchInput.contains(event.target)) {
        setShowOperators(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle popup outside click
  useEffect(() => {
    const handlePopupClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        handleCloseBillDetails();
      }
    };

    if (showBillDetailsPopup) {
      document.addEventListener("mousedown", handlePopupClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handlePopupClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [showBillDetailsPopup]);

  // Fetch operators on component mount
  useEffect(() => {
    fetchOperators();
  }, []);

  // Filter operators based on search
  const normalize = value =>
    typeof value === "string" ? value.toLowerCase() : String(value || "").toLowerCase();

  useEffect(() => {
    const search = operatorSearch.trim().toLowerCase();

    setFilteredOperators(
      search === ""
        ? operators
        : operators.filter(op =>
          normalize(op.name).includes(search) ||
          normalize(op.location_id).includes(search)
        )
    );
  }, [operatorSearch, operators]);


  const fetchOperators = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      if (!token) {
        setError("Please login to continue");
        return;
      }

      console.log("Fetching operators with token:", token ? "Token exists" : "No token");

      const response = await fetch(
        `${BASE_URL}bbps/bbps/fetch_operators/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ category: "loan" })
        }
      );

      console.log("Operators response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Operators API response:", data);

      if (data.success && data.operators && Array.isArray(data.operators)) {
        setOperators(data.operators);
        setFilteredOperators(data.operators);
      } else {
        throw new Error(data.message || "Failed to load loan operators");
      }
    } catch (error) {
      console.error("Error fetching operators:", error);
      setError("Failed to load loan operators. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear bill details when any field changes
    if (billDetails) {
      setBillDetails(null);
      setSuccess(null);
      setDetailedBillData(null);
    }
  };

  const handleOperatorChange = (operatorId) => {
    const operator = operators.find(op => op.operator_id === operatorId);

    if (operator) {
      setSelectedOperator(operator);
      handleInputChange("operator_id", operatorId);
      setShowOperators(false);

      // Auto-suggest mobile number and name based on common loan providers
      const operatorName = operator.name.toLowerCase();
      if (operatorName.includes("hdfc")) {
        handleInputChange("mobile_no", "98");
        handleInputChange("sender_name", "HDFC");
      } else if (operatorName.includes("icici")) {
        handleInputChange("mobile_no", "99");
        handleInputChange("sender_name", "ICICI");
      } else if (operatorName.includes("sbi") || operatorName.includes("state bank")) {
        handleInputChange("mobile_no", "90");
        handleInputChange("sender_name", "SBI");
      } else if (operatorName.includes("axis")) {
        handleInputChange("mobile_no", "97");
        handleInputChange("sender_name", "AXIS");
      } else if (operatorName.includes("kotak")) {
        handleInputChange("mobile_no", "96");
        handleInputChange("sender_name", "KOTAK");
      } else if (operatorName.includes("bajaj")) {
        handleInputChange("mobile_no", "91");
        handleInputChange("sender_name", "BAJAJ");
      } else if (operatorName.includes("tata")) {
        handleInputChange("mobile_no", "92");
        handleInputChange("sender_name", "TATA");
      } else if (operatorName.includes("home") && operatorName.includes("credit")) {
        handleInputChange("mobile_no", "93");
        handleInputChange("sender_name", "HOME CREDIT");
      } else if (operatorName.includes("fullerton")) {
        handleInputChange("mobile_no", "94");
        handleInputChange("sender_name", "FULLERTON");
      }
    }

    setOperatorSearch("");
  };

  const validateForm = () => {
    // Clear previous errors
    setError(null);

    if (!formData.operator_id) {
      setError("Please select a loan provider");
      return false;
    }

    if (!formData.utility_acc_no || formData.utility_acc_no.trim().length < 5) {
      setError("Please enter a valid loan account number (minimum 5 characters)");
      return false;
    }

    if (!formData.sender_name || formData.sender_name.trim().length < 3) {
      setError("Please enter customer name (minimum 3 characters)");
      return false;
    }

    if (!formData.mobile_no || formData.mobile_no.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }

    // Validate mobile number contains only digits
    if (!/^\d{10}$/.test(formData.mobile_no)) {
      setError("Mobile number should contain only digits");
      return false;
    }

    return true;
  };

  const fetchBillDetails = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setFetchingBill(true);
      setError(null);
      setBillDetails(null);
      setSuccess(null);
      setDetailedBillData(null);

      const token = localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      if (!token) {
        setError("Please login to continue");
        setFetchingBill(false);
        return;
      }

      const requestData = {
        operator_id: formData.operator_id,
        utility_acc_no: formData.utility_acc_no.trim(),
        sender_name: formData.sender_name.trim(),
        mobile_no: formData.mobile_no.trim()
      };

      console.log("Sending bill fetch request:", requestData);
      console.log("Authorization token:", token.substring(0, 20) + "...");

      const response = await fetch(
        `${BASE_URL}bbps/bbps/fetch_bill/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(requestData)
        }
      );

      console.log("Bill fetch response status:", response.status);

      const responseText = await response.text();
      console.log("Bill fetch response text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error("Invalid response from server");
      }

      console.log("Bill fetch response data:", data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        // Handle different possible response structures
        let billData = null;

        if (data.data && data.data.data) {
          billData = data.data.data;
        } else if (data.data) {
          billData = data.data;
        } else if (data.bill_details) {
          billData = data.bill_details;
        } else if (data.emi_details) {
          billData = data.emi_details;
        }

        if (billData) {
          // Extract amount from various possible fields
          let amount = 0;
          if (billData.amount) {
            amount = parseFloat(billData.amount);
          } else if (billData.dueAmount) {
            amount = parseFloat(billData.dueAmount);
          } else if (billData.emi_amount) {
            amount = parseFloat(billData.emi_amount);
          } else if (billData.outstanding_amount) {
            amount = parseFloat(billData.outstanding_amount);
          }

          if (amount <= 0) {
            setError("No pending EMI found for this loan account");
            return;
          }

          // Prepare bill details object
          const billDetailsObj = {
            amount: amount,
            billDueDate: billData.billDueDate || billData.due_date || billData.dueDate || "N/A",
            utilitycustomername: billData.utilitycustomername || billData.customer_name || formData.sender_name.trim(),
            customer_id: billData.customer_id || billData.account_number || formData.utility_acc_no.trim(),
            billdate: billData.billdate || billData.bill_date || new Date().toISOString().split('T')[0],
            billername: billData.billername || selectedOperator?.name || "Loan Provider",
            client_ref_id: data.client_ref_id || data.reference_id || `REF-${Date.now()}`,
            message: data.message || data.data?.message || "EMI details fetched successfully",
            full_response: data // Store full response for popup
          };

          console.log("Setting bill details:", billDetailsObj);
          setBillDetails(billDetailsObj);
          setSuccess("Loan EMI details fetched successfully!");

          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
        } else {
          // If no specific bill data structure, check for direct amount
          if (data.amount) {
            const amount = parseFloat(data.amount);
            if (amount > 0) {
              const billDetailsObj = {
                amount: amount,
                billDueDate: data.due_date || "N/A",
                utilitycustomername: formData.sender_name.trim(),
                customer_id: formData.utility_acc_no.trim(),
                billdate: new Date().toISOString().split('T')[0],
                billername: selectedOperator?.name || "Loan Provider",
                client_ref_id: data.client_ref_id || `REF-${Date.now()}`,
                message: data.message || "EMI details fetched successfully",
                full_response: data
              };

              setBillDetails(billDetailsObj);
              setSuccess("Loan EMI details fetched successfully!");
              setTimeout(() => setSuccess(null), 3000);
            } else {
              throw new Error("No pending EMI found for this loan account");
            }
          } else {
            throw new Error("No EMI details found in response");
          }
        }
      } else {
        throw new Error(data.message || data.error || "Failed to fetch EMI details");
      }
    } catch (error) {
      console.error("Error fetching bill:", error);

      // More specific error messages
      if (error.message.includes("network") || error.message.includes("Network")) {
        setError("Network error. Please check your internet connection.");
      } else if (error.message.includes("401") || error.message.includes("unauthorized")) {
        setError("Session expired. Please login again.");
      } else if (error.message.includes("404")) {
        setError("Service not available. Please try again later.");
      } else if (error.message.includes("500")) {
        setError("Server error. Please try again later.");
      } else {
        setError(error.message || "Failed to fetch EMI details. Please check the details and try again.");
      }
    } finally {
      setFetchingBill(false);
    }
  };

  // Fetch detailed bill information for popup
  const fetchDetailedBillInfo = async () => {
    if (!billDetails?.client_ref_id) {
      setPopupError("No reference ID available");
      return;
    }

    const token = localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (!token) {
      setPopupError("Please login to view details");
      return;
    }

    setPopupLoading(true);
    setPopupError(null);

    try {
      const response = await fetch(
        `${BASE_URL}recharge/recharge/get_bill_details/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            client_ref_id: billDetails.client_ref_id,
            category: "loan"
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Detailed bill response:", data);

      if (data.success) {
        // Parse and format the detailed data
        const detailedData = {
          // Basic info from existing billDetails
          ...billDetails,

          // Additional details from new API response
          transaction_details: data.data?.transaction_details || {},
          loan_details: data.data?.loan_details || {},
          principal_amount: data.data?.principal_amount || "0",
          interest_amount: data.data?.interest_amount || "0",
          total_due: data.data?.total_due || billDetails.amount,
          last_payment_date: data.data?.last_payment_date || "",
          last_payment_amount: data.data?.last_payment_amount || "0",
          loan_start_date: data.data?.loan_start_date || "",
          loan_end_date: data.data?.loan_end_date || "",
          loan_tenure: data.data?.loan_tenure || "N/A",
          interest_rate: data.data?.interest_rate || "N/A",
          remaining_tenure: data.data?.remaining_tenure || "N/A",
          outstanding_principal: data.data?.outstanding_principal || "0",
          processing_fee: data.data?.processing_fee || "0",
          late_fee: data.data?.late_fee || "0",
          contact_info: data.data?.contact_info || {},
          payment_history: data.data?.payment_history || [],
          full_api_response: data
        };

        setDetailedBillData(detailedData);
      } else {
        // If detailed API fails, use existing billDetails
        setDetailedBillData({
          ...billDetails,
          note: "Detailed information unavailable. Showing basic EMI details."
        });
      }
    } catch (error) {
      console.error("Error fetching detailed bill:", error);
      // On error, still show popup with basic data
      setDetailedBillData({
        ...billDetails,
        note: "Could not fetch additional details. Showing available information."
      });
    } finally {
      setPopupLoading(false);
    }
  };

  // Open Bill Details Popup
  const handleViewBillDetails = () => {
    setShowBillDetailsPopup(true);
    setPopupLoading(true);

    // Fetch detailed information when popup opens
    fetchDetailedBillInfo();
  };

  // Close Bill Details Popup
  const handleCloseBillDetails = () => {
    setShowBillDetailsPopup(false);
    setDetailedBillData(null);
    setPopupError(null);
  };

  const proceedToPayment = () => {
    if (!billDetails) {
      setError("Please fetch EMI details first");
      return;
    }

    // Prepare payment data
    const paymentData = {
      ...formData,
      operator_name: selectedOperator?.name || "Loan EMI Payment",
      amount: billDetails.amount,
      due_date: billDetails.billDueDate,
      customer_name: billDetails.utilitycustomername,
      client_ref_id: billDetails.client_ref_id,
      category: "loan",
      type: "bill_payment",
      bill_details: billDetails
    };

    console.log("Proceeding to payment with data:", paymentData);

    // Store in localStorage for payment page
    localStorage.setItem('pendingBill', JSON.stringify(paymentData));
    localStorage.setItem('billPaymentData', JSON.stringify(paymentData));

    // Navigate to payment page with query params
    const queryParams = new URLSearchParams({
      type: 'loan_emi',
      operator_id: formData.operator_id,
      operator_name: selectedOperator?.name || '',
      account_no: formData.utility_acc_no,
      customer_name: formData.sender_name,
      mobile: formData.mobile_no,
      amount: billDetails.amount.toString(),
      due_date: billDetails.billDueDate || '',
      client_ref_id: billDetails.client_ref_id || '',
      category: 'loan'
    }).toString();

    router.push(`/paymen..t?${queryParams}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A" || dateString.toLowerCase() === "null") return "N/A";

    try {
      // If it's in YYYYMMDD format
      if (/^\d{8}$/.test(dateString)) {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${day}-${month}-${year}`;
      }

      // If it's in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
      }

      // Try to parse as regular date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }

      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "₹0.00";
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${num.toFixed(2)}`;
  };

  // Bill Details Popup Component
  const BillDetailsPopup = () => {
    if (!showBillDetailsPopup) return null;

    const dataToShow = detailedBillData || billDetails;
    if (!dataToShow) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto md:pt-10">
        <div className="flex items-center justify-center min-h-screen p-4">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

          {/* Modal panel */}
          <div
            ref={popupRef}
            className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FaReceipt className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">
                    Loan EMI Bill Details
                  </h3>
                  <p className="text-sm text-gray-500">
                    Complete EMI information and payment summary
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseBillDetails}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {popupLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
                  <p className="text-gray-600">Loading detailed EMI information...</p>
                </div>
              ) : popupError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <FaExclamationTriangle className="text-red-500 text-xl" />
                    <p className="text-red-600">{popupError}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Alert for limited data */}
                  {dataToShow.note && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <FaInfoCircle className="text-yellow-500 text-lg mt-0.5" />
                        <div>
                          <p className="text-yellow-800 font-medium">Note</p>
                          <p className="text-yellow-700 text-sm">{dataToShow.note}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Amount Card */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm opacity-90">Current EMI Amount</p>
                        <p className="text-4xl font-bold mt-2">
                          {formatCurrency(dataToShow.amount)}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                          {dataToShow.billDueDate && dataToShow.billDueDate !== "N/A" && (
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-white opacity-80" />
                              <span className="text-sm">
                                Due Date: {formatDate(dataToShow.billDueDate)}
                              </span>
                            </div>
                          )}
                          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                            EMI Payment
                          </div>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                        <FaRupeeSign className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>

                  {/* Customer Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Customer Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Customer Information</p>
                          <p className="font-semibold text-gray-800">{dataToShow.utilitycustomername}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Loan Account Number</p>
                          <p className="text-sm font-medium text-gray-800 font-mono">
                            {dataToShow.customer_id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Customer ID</p>
                          <p className="text-sm font-medium text-gray-800 font-mono">
                            {dataToShow.customer_id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bank Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FaBuilding className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Loan Provider</p>
                          <p className="font-semibold text-gray-800">{selectedOperator?.name || dataToShow.billername || "Loan Provider"}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {dataToShow.billdate && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Bill Date</p>
                            <p className="text-sm font-medium text-gray-800">
                              {formatDate(dataToShow.billdate)}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Loan Type</p>
                          <p className="text-sm font-medium text-gray-800">
                            EMI Payment
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Loan Details Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FaFileInvoice className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Loan Information</p>
                          <p className="font-semibold text-gray-800">EMI Details</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {dataToShow.loan_tenure && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Loan Tenure</p>
                            <p className="text-sm font-medium text-gray-800">
                              {dataToShow.loan_tenure}
                            </p>
                          </div>
                        )}
                        {dataToShow.remaining_tenure && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Remaining Tenure</p>
                            <p className="text-sm font-medium text-gray-800">
                              {dataToShow.remaining_tenure}
                            </p>
                          </div>
                        )}
                        {dataToShow.interest_rate && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Interest Rate</p>
                            <p className="text-sm font-medium text-gray-800">
                              {dataToShow.interest_rate}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Principal Amount */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Principal Amount</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(dataToShow.principal_amount)}
                      </p>
                    </div>

                    {/* Interest Amount */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                      <p className="text-xs text-blue-500 mb-1">Interest Amount</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(dataToShow.interest_amount)}
                      </p>
                    </div>

                    {/* Late Fee */}
                    <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
                      <p className="text-xs text-red-500 mb-1">Late Payment Fee</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(dataToShow.late_fee)}
                      </p>
                    </div>

                    {/* Outstanding Principal */}
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
                      <p className="text-xs text-orange-500 mb-1">Outstanding Principal</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(dataToShow.outstanding_principal)}
                      </p>
                    </div>
                  </div>

                  {/* Loan Timeline */}
                  {(dataToShow.loan_start_date || dataToShow.loan_end_date) && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-800 mb-4">Loan Timeline</h4>
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Start Date</p>
                          <p className="text-sm font-medium text-gray-800">
                            {formatDate(dataToShow.loan_start_date)}
                          </p>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="h-1 bg-gray-200 rounded-full relative">
                            <div className="absolute w-3/4 h-full bg-blue-500 rounded-full"></div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">End Date</p>
                          <p className="text-sm font-medium text-gray-800">
                            {formatDate(dataToShow.loan_end_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment History */}
                  {dataToShow.payment_history && dataToShow.payment_history.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-800 mb-4">Recent Payments</h4>
                      <div className="space-y-3">
                        {dataToShow.payment_history.slice(0, 5).map((payment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${payment.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                {payment.status === 'success' ? <FaCheckCircle /> : <FaHistory />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {formatCurrency(payment.amount)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(payment.date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium">{payment.mode || "EMI Payment"}</p>
                              <p className={`text-xs ${payment.status === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {payment.status || 'Pending'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transaction Details */}
                  {dataToShow.transaction_details && Object.keys(dataToShow.transaction_details).length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-800 mb-4">Transaction Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(dataToShow.transaction_details).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-medium text-gray-800">
                              {typeof value === 'number' ? formatCurrency(value) : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reference ID Section */}
                  {dataToShow.client_ref_id && (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FaIdCard className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">Reference ID</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-mono text-sm font-bold text-gray-800 break-all">
                              {dataToShow.client_ref_id}
                            </p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(dataToShow.client_ref_id);
                                alert("Reference ID copied to clipboard!");
                              }}
                              className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                            >
                              <FaCopy className="inline mr-1" /> Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Note */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FaShieldAlt className="text-green-500 text-lg mt-0.5" />
                      <div>
                        <p className="text-green-800 font-medium">Secure EMI Information</p>
                        <p className="text-green-700 text-sm mt-1">
                          This information is securely retrieved from your loan provider. All data is encrypted and protected.
                          Your account details are never stored on our servers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    <FaPrint className="text-sm" />
                    Print
                  </button>
                  <button
                    onClick={() => {
                      // Download functionality
                      const billData = {
                        ...dataToShow,
                        printed_date: new Date().toLocaleString()
                      };
                      const blob = new Blob([JSON.stringify(billData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `loan-emi-bill-${dataToShow.client_ref_id || Date.now()}.json`;
                      a.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    <FaDownload className="text-sm" />
                    Download
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseBillDetails}
                    className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleCloseBillDetails();
                      proceedToPayment();
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    Proceed to Payment
                    <FaArrowRight className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 md:pt-10">
      {/* Bill Details Popup */}
      <BillDetailsPopup />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <FaLightbulb className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-black">Loan EMI Payment</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Pay your loan EMIs instantly with secure payment</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-xl" />
            </div>
            <div>
              <p className="font-semibold">EMI Details Fetched Successfully!</p>
              <p className="text-white/90 text-sm mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="text-xl" />
            </div>
            <div>
              <p className="font-semibold">Error Occurred</p>
              <p className="text-white/90 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg text-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Loan Provider (Search) */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Loan Provider *
            </label>

            {/* Selected Provider */}
            {selectedOperator && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <FaBuilding className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {selectedOperator.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {selectedOperator.operator_id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOperator(null);
                      handleInputChange("operator_id", "");
                    }}
                    className="p-2 hover:bg-red-50 rounded-full"
                    type="button"
                  >
                    <FaTimes className="text-red-500 text-sm" />
                  </button>
                </div>
              </div>
            )}

            {!selectedOperator && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 text-sm" />
                </div>

                <input
                  id="operator-search"
                  type="text"
                  value={operatorSearch}
                  onChange={(e) => {
                    setOperatorSearch(e.target.value);
                    setShowOperators(true);
                  }}
                  onFocus={() => setShowOperators(true)}
                  placeholder="Search loan providers..."
                  className="w-full pl-10 pr-4 py-3
              bg-white text-gray-800
              border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              text-sm"
                />

                {showOperators && (
                  <div
                    id="operators-dropdown"
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {loading ? (
                      <div className="p-4 text-center">
                        <FaSpinner className="animate-spin text-blue-500 mx-auto" />
                        <p className="text-xs text-gray-500 mt-2">Loading providers...</p>
                      </div>
                    ) : filteredOperators.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No loan providers found
                      </div>
                    ) : (
                      filteredOperators.map((operator) => (
                        <button
                          key={operator.operator_id}
                          onClick={() => handleOperatorChange(operator.operator_id)}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                        >
                          <p className="font-medium text-gray-800 text-sm">
                            {operator.name}
                          </p>
                          {/* <p className="text-xs text-gray-500">
                            ID: {operator.operator_id}
                            {operator.location_id ? ` • ${operator.location_id}` : ""}
                          </p> */}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Select your loan provider or bank
            </p>
          </div>

          {/* Loan Account Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Loan Account Number *
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaIdCard className="text-gray-400 text-sm" />
              </div>

              <input
                type="text"
                value={formData.utility_acc_no}
                onChange={(e) => handleInputChange("utility_acc_no", e.target.value)}
                className="w-full pl-10 pr-4 py-3.5
            bg-white text-gray-800
            border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            text-sm"
                placeholder="Enter loan account number"
                maxLength={30}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Enter your loan account number
            </p>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Customer Name *
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400 text-sm" />
              </div>

              <input
                type="text"
                value={formData.sender_name}
                onChange={(e) => handleInputChange("sender_name", e.target.value)}
                className="w-full pl-10 pr-4 py-3.5
            bg-white text-gray-800
            border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            text-sm"
                placeholder="Enter customer name as per loan"
                maxLength={50}
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Mobile Number *
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMobile className="text-gray-400 text-sm" />
              </div>

              <input
                type="tel"
                value={formData.mobile_no}
                onChange={(e) =>
                  handleInputChange(
                    "mobile_no",
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                className="w-full pl-10 pr-4 py-3.5
            bg-white text-gray-800
            border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            text-sm"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Used for EMI alerts & confirmation
            </p>
          </div>
        </div>

        {/* Fetch EMI Button */}
        <div className="mt-8">
          <button
            onClick={fetchBillDetails}
            disabled={
              fetchingBill ||
              !formData.operator_id ||
              !formData.utility_acc_no ||
              !formData.sender_name ||
              !formData.mobile_no
            }
            type="button"
            className="w-full md:w-auto
        bg-gradient-to-r from-blue-600 to-indigo-600
        hover:from-blue-700 hover:to-indigo-700
        disabled:from-gray-400 disabled:to-gray-500
        disabled:cursor-not-allowed
        text-white py-3.5 px-8 rounded-lg
        font-semibold transition-all duration-200
        flex items-center justify-center gap-3 shadow-md"
          >
            {fetchingBill ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                Fetch EMI Details...
              </>
            ) : (
              <>
                <FaSearch className="text-sm" />
                Fetch EMI Details
              </>
            )}
          </button>
        </div>
      </div>


      {/* Bill Details Section */}
      {billDetails && (
        <div className="space-y-6">
          {/* Bill Fetched Success Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="text-white text-lg" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">EMI fetched successfully!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Amount: <span className="font-bold">₹{billDetails.amount.toFixed(2)}</span>
                    {billDetails.billDueDate && billDetails.billDueDate !== "N/A" && ` | Due: ${formatDate(billDetails.billDueDate)}`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleViewBillDetails}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md"
              >
                <FaEye className="text-sm" />
                View EMI Details
              </button>
            </div>
          </div>

          {/* Main Bill Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* EMI Amount Card */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-5 shadow-xl transform transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-blue-200 mb-1">EMI Amount</p>
                  <p className="text-3xl font-bold">
                    ₹{billDetails.amount.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <FaRupeeSign className="text-2xl" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-sm text-blue-200">Total payable EMI amount</p>
              </div>
            </div>

            {/* Due Date Card */}
            <div className="bg-gradient-to-br from-blue-800 via-indigo-800 to-blue-900 text-white rounded-2xl p-5 shadow-xl transform transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-blue-200 mb-1">Due Date</p>
                  <p className="text-2xl font-bold">
                    {formatDate(billDetails.billDueDate)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <FaCalendarAlt className="text-2xl" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-sm text-blue-200">Pay before due date to avoid late charges</p>
              </div>
            </div>

            {/* Customer Details Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-900 text-white rounded-2xl p-5 shadow-xl transform transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-200 mb-1">Customer Name</p>
                  <p className="text-lg font-bold truncate">
                    {billDetails.utilitycustomername}
                  </p>
                  <p className="text-sm text-blue-300 mt-1">ID: {billDetails.customer_id}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center ml-3">
                  <FaUser className="text-xl" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-sm text-blue-200">Registered loan account holder details</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg">
            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-blue-900/10 to-indigo-900/10 dark:from-blue-800/20 dark:to-indigo-800/20 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-white text-lg">Payment Summary</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Complete your EMI payment</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      ₹{billDetails.amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Proceed to Payment Button */}
                <button
                  onClick={proceedToPayment}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-3 shadow-lg"
                  type="button"
                >
                  <FaCreditCard className="text-lg" />
                  Pay ₹{billDetails.amount.toFixed(2)} Now
                  <FaRupeeSign className="text-sm" />
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Secure payment powered by Bharat Grow • No convenience fee • Instant confirmation
                </p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <FaCheckCircle className="text-white text-sm" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">100% Secure Payment</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Your payment is processed through secure encrypted channels. All transactions are verified and protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}