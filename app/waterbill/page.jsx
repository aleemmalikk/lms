"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  FaCreditCard
} from "react-icons/fa";
import { BASE_URL } from '../lib/api';


export default function waterBillPayment() {
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
  const [billDetails, setBillDetails] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);

  // Fetch water operators on component mount
  useEffect(() => {
    fetchwaterOperators();
  }, []);

  const fetchwaterOperators = async () => {
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

      const response = await fetch(
        `${BASE_URL}bbps/bbps/fetch_operators/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ category: "water" })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.operators && Array.isArray(data.operators)) {
        setOperators(data.operators);
      } else {
        throw new Error("Failed to load water operators");
      }
    } catch (error) {
      console.error("Error fetching operators:", error);
      setError("Failed to load water operators. Please try again.");
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
    }
  };

  const handleOperatorChange = (e) => {
    const operatorId = e.target.value;
    const operator = operators.find(op => op.operator_id === operatorId);

    setSelectedOperator(operator);
    handleInputChange("operator_id", operatorId);
  };

  const fetchBillDetails = async () => {
    // Validation
    if (!formData.operator_id) {
      setError("Please select an water provider");
      return;
    }

    if (!formData.utility_acc_no || formData.utility_acc_no.trim().length < 5) {
      setError("Please enter a valid consumer number/account number");
      return;
    }

    if (!formData.sender_name || formData.sender_name.trim().length < 3) {
      setError("Please enter consumer name");
      return;
    }

    if (!formData.mobile_no || formData.mobile_no.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setFetchingBill(true);
      setError(null);
      setBillDetails(null);

      const token = localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      if (!token) {
        setError("Please login to continue");
        return;
      }

      const response = await fetch(
        "${BASE_URL}bbps/bbps/fetch_bill/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            operator_id: formData.operator_id,
            utility_acc_no: formData.utility_acc_no.trim(),
            sender_name: formData.sender_name.trim(),
            mobile_no: formData.mobile_no.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Bill fetch response:", data);

      if (data.success) {
        if (data.data && data.data.data) {
          const billData = data.data.data;

          // Check if bill amount is valid
          const billAmount = parseFloat(billData.amount || "0");

          if (billAmount <= 0) {
            setError("No pending bill found for this account");
            return;
          }

          setBillDetails({
            amount: billAmount,
            billDueDate: billData.billDueDate,
            utilitycustomername: billData.utilitycustomername,
            customer_id: billData.customer_id,
            billdate: billData.billdate,
            billername: billData.billername || selectedOperator?.name || "",
            client_ref_id: data.client_ref_id,
            message: data.data.message || "Bill details fetched successfully"
          });

          setSuccess("Bill details fetched successfully");

          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
        } else {
          throw new Error("Invalid bill data received");
        }
      } else {
        throw new Error(data.message || "Failed to fetch bill details");
      }
    } catch (error) {
      console.error("Error fetching bill:", error);
      setError(error.message || "Failed to fetch bill details. Please check the details and try again.");
    } finally {
      setFetchingBill(false);
    }
  };

  const proceedToPayment = () => {
    if (!billDetails) {
      setError("Please fetch bill details first");
      return;
    }

    // Prepare payment data
    const paymentData = {
      ...formData,
      operator_name: selectedOperator?.name || "water Bill",
      amount: billDetails.amount,
      due_date: billDetails.billDueDate,
      customer_name: billDetails.utilitycustomername,
      client_ref_id: billDetails.client_ref_id,
      category: "water",
      type: "bill_payment"
    };

    console.log("Proceeding to payment with data:", paymentData);

    // Store in localStorage for payment page
    localStorage.setItem('pendingwaterBill', JSON.stringify(paymentData));

    // Navigate to payment page with query params
    const queryParams = new URLSearchParams({
      type: 'water',
      operator_id: formData.operator_id,
      operator_name: selectedOperator?.name || 'water',
      account_no: formData.utility_acc_no,
      customer_name: formData.sender_name,
      mobile: formData.mobile_no,
      amount: billDetails.amount.toString(),
      due_date: billDetails.billDueDate || '',
      client_ref_id: billDetails.client_ref_id || ''
    }).toString();

    router.push(`/payment?${queryParams}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "null") return "N/A";

    try {
      // If it's in YYYYMMDD format
      if (/^\d{8}$/.test(dateString)) {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 md:pt-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <FaLightbulb className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-black">Water Bill Payment</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Pay your water bills instantly with secure payment</p>
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
              <p className="font-semibold">Bill Details Fetched Successfully!</p>
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

          {/* Water Provider */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Water Provider *
            </label>

            <div className="relative">
              {loading && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <FaSpinner className="animate-spin text-blue-500 text-sm" />
                </div>
              )}

              <select
                value={formData.operator_id}
                onChange={handleOperatorChange}
                disabled={loading}
                className="w-full px-4 py-3.5
            bg-white text-gray-800
            border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            text-sm transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Water Provider</option>
                {operators.map((operator) => (
                  <option
                    key={operator.operator_id}
                    value={operator.operator_id}
                    className="text-gray-800"
                  >
                    {operator.name}
                    {operator.location_id ? ` (${operator.location_id})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Select your water distribution company
            </p>
          </div>

          {/* Consumer Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Consumer Number *
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaIdCard className="text-gray-400 text-sm" />
              </div>

              <input
                type="text"
                value={formData.utility_acc_no}
                onChange={(e) =>
                  handleInputChange("utility_acc_no", e.target.value)
                }
                className="w-full pl-10 pr-4 py-3.5
            bg-white text-gray-800
            border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            text-sm transition-all duration-200
            placeholder:text-gray-400"
                placeholder="Enter consumer/account number"
                maxLength={30}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Enter your water consumer number
            </p>
          </div>

          {/* Consumer Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Consumer Name *
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400 text-sm" />
              </div>

              <input
                type="text"
                value={formData.sender_name}
                onChange={(e) =>
                  handleInputChange("sender_name", e.target.value)
                }
                className="w-full pl-10 pr-4 py-3.5
            bg-white text-gray-800
            border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            text-sm transition-all duration-200
            placeholder:text-gray-400"
                placeholder="Enter consumer name as per bill"
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
            text-sm transition-all duration-200
            placeholder:text-gray-400"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              For OTP and payment confirmation
            </p>
          </div>
        </div>

        {/* Fetch Bill Button */}
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
            className="w-full md:w-auto
        bg-gradient-to-r from-blue-600 to-indigo-600
        hover:from-blue-700 hover:to-indigo-700
        disabled:from-gray-400 disabled:to-gray-500
        disabled:cursor-not-allowed
        text-white py-3.5 px-8 rounded-lg
        font-semibold transition-all duration-200
        transform hover:-translate-y-0.5 hover:shadow-lg
        flex items-center justify-center gap-3 shadow-md"
          >
            {fetchingBill ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                Fetching Bill Details...
              </>
            ) : (
              <>
                <FaSearch className="text-sm" />
                Fetch Bill Details
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bill Details Section - Dark Blue Premium Design */}
      {billDetails && (
        <div className="space-y-6">
          {/* Bill Details Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <FaFileInvoice className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Bill Details</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Review your bill information before payment</p>
            </div>
          </div>

          {/* Main Bill Cards - Dark Blue Theme */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Bill Amount Card */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-5 shadow-xl transform transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-blue-200 mb-1">Bill Amount</p>
                  <p className="text-3xl font-bold">
                    ₹{billDetails.amount.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <FaRupeeSign className="text-2xl" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-sm text-blue-200">Total payable amount including all charges</p>
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

            {/* Consumer Details Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-900 text-white rounded-2xl p-5 shadow-xl transform transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-200 mb-1">Consumer Name</p>
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
                <p className="text-sm text-blue-200">Registered account holder details</p>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FaBuilding className="text-blue-600" />
              Additional Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Provider Details */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <FaBuilding className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">water Provider</p>
                    <p className="font-semibold text-gray-800 dark:text-white text-lg">
                      {selectedOperator?.name || billDetails.billername || "N/A"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your water service provider
                </p>
              </div>

              {/* Reference Details */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <FaFileInvoice className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reference ID</p>
                    <p className="font-semibold text-gray-800 dark:text-white text-lg font-mono">
                      {billDetails.client_ref_id || "N/A"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Unique transaction reference ID
                </p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-blue-900/10 to-indigo-900/10 dark:from-blue-800/20 dark:to-indigo-800/20 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-white text-lg">Payment Summary</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Complete your bill payment</p>
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