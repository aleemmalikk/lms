"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { BASE_URL, getAuthToken } from "@/app/lib/api";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Download,
  Printer,
  RefreshCw,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
  Building2,
  Star,
  Info,
  ArrowRight,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Eye,
  Lock,
  CreditCard as CreditCardIcon,
  FileSpreadsheet,
  ExternalLink,
} from "lucide-react";

export default function CibilReportPage() {
  const [loading, setLoading] = useState(true);
  const [cibil, setCibil] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [deepReportData, setDeepReportData] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  };

  useEffect(() => {
    fetchCibilReport();
    fetchUserDetails();
  }, []);

  const fetchCibilReport = async () => {
    try {
      const token = getToken();
      const res = await axios.get(
        `${BASE_URL}kyc/latest_cibil/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCibil(res.data.cibil_score);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setError("No CIBIL data found. Please verify PAN first.");
      } else {
        setError("Something went wrong while fetching CIBIL.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${BASE_URL}users/my_profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserDetails(res.data);
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };

  const refreshCibil = async () => {
    setRefreshing(true);
    setError("");
    try {
      const token = getToken();
      const res = await axios.post(
        `${BASE_URL}kyc/refresh_cibil/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCibil(res.data.cibil_score);
    } catch (err) {
      console.error(err);
      setError("Failed to refresh CIBIL score. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('print-content');
    const originalContents = document.body.innerHTML;
    
    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CIBIL Report - ${userDetails?.first_name || 'Customer'}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: white;
            color: #333;
          }
          .container { max-width: 1000px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6; }
          .logo { font-size: 28px; font-weight: bold; color: #3b82f6; margin-bottom: 10px; }
          .title { font-size: 24px; font-weight: bold; margin: 20px 0 10px; }
          .date { font-size: 12px; color: #9ca3af; margin-top: 10px; }
          .score-card { 
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            margin-bottom: 30px;
          }
          .score { font-size: 72px; font-weight: bold; margin: 20px 0; }
          .score-excellent { color: #10b981; }
          .score-good { color: #f59e0b; }
          .score-poor { color: #ef4444; }
          .section { margin-bottom: 25px; }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #3b82f6;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .info-item { margin-bottom: 10px; }
          .info-label { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; }
          .info-value { font-size: 14px; color: #1f2937; font-weight: 500; margin-top: 4px; }
          .recommendations { background: #f9fafb; padding: 20px; border-radius: 12px; }
          .recommendations li { margin-bottom: 8px; list-style: none; padding-left: 20px; position: relative; }
          .recommendations li:before { content: "✓"; color: #10b981; position: absolute; left: 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">FinLoan</div>
            <div class="title">CIBIL Score Report</div>
            <div class="date">Generated on: ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="score-card">
            <h3>Your CIBIL Score</h3>
            <div class="score ${cibil >= 750 ? 'score-excellent' : cibil >= 650 ? 'score-good' : 'score-poor'}">
              ${cibil || '--'}
            </div>
            <p>out of 900</p>
            <div style="margin-top: 10px;">
              <strong>Status: ${getStatus()}</strong>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${userDetails?.first_name || ''} ${userDetails?.last_name || ''}</div>
              </div>
              <div class="info-item">
                <div class="info-label">PAN Number</div>
                <div class="info-value">${userDetails?.pan_number || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date of Birth</div>
                <div class="info-value">${userDetails?.date_of_birth || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone Number</div>
                <div class="info-value">${userDetails?.phone_number || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${userDetails?.email || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Address</div>
                <div class="info-value">${userDetails?.address || ''}, ${userDetails?.city || ''}, ${userDetails?.state || ''} - ${userDetails?.pincode || ''}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Score Analysis</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Loan Eligibility</div>
                <div class="info-value">${getLoanEligibility()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Risk Level</div>
                <div class="info-value">${getStatus()}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Recommendations</div>
            <ul class="recommendations">
              ${getRecommendations().map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
          
          <div class="footer">
            <p>This is a computer-generated document. No signature required.</p>
            <p>© 2026 FinLoan - All rights reserved | RBI Registered NBFC</p>
            <p>Report ID: CIBIL-${Date.now()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDeepReport = async () => {
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setProcessingPayment(true);
    try {
      const token = getToken();
      
      // Create payment order
      const orderRes = await axios.post(
        `${BASE_URL}payments/create-order/`,
        {
          amount: 499, // ₹499 for deep report
          currency: "INR",
          purpose: "Deep CIBIL Report Download"
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const { order_id, amount, currency } = orderRes.data;
      
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount,
          currency: currency,
          name: "FinLoan",
          description: "Deep CIBIL Report Download",
          order_id: order_id,
          handler: async function(response) {
            // Verify payment
            const verifyRes = await axios.post(
              `${BASE_URL}payments/verify-payment/`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            
            if (verifyRes.data.status === "success") {
              await fetchDeepReport();
              setShowPaymentModal(false);
            }
          },
          prefill: {
            name: `${userDetails?.first_name} ${userDetails?.last_name}`,
            email: userDetails?.email,
            contact: userDetails?.phone_number
          },
          theme: {
            color: "#3b82f6"
          }
        };
        
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
      document.body.appendChild(script);
      
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const fetchDeepReport = async () => {
    setDownloadLoading(true);
    try {
      const token = getToken();
      const res = await axios.get(
        `${BASE_URL}kyc/deep_cibil_report/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CIBIL_Deep_Report_${userDetails?.pan_number || 'customer'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert("Deep report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading deep report:", error);
      alert("Failed to download deep report. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const getScoreColor = () => {
    if (!cibil) return "text-gray-400";
    if (cibil >= 750) return "text-green-600";
    if (cibil >= 650) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = () => {
    if (!cibil) return "bg-gray-100";
    if (cibil >= 750) return "bg-green-50";
    if (cibil >= 650) return "bg-yellow-50";
    return "bg-red-50";
  };

  const getStatus = () => {
    if (!cibil) return "Not Available";
    if (cibil >= 750) return "Excellent";
    if (cibil >= 650) return "Average";
    return "Poor";
  };

  const getStatusIcon = () => {
    if (!cibil) return <AlertCircle className="w-6 h-6 text-gray-400" />;
    if (cibil >= 750) return <Award className="w-6 h-6 text-green-600" />;
    if (cibil >= 650) return <TrendingUp className="w-6 h-6 text-yellow-600" />;
    return <TrendingDown className="w-6 h-6 text-red-600" />;
  };

  const getScoreMessage = () => {
    if (!cibil) return "Complete PAN verification to get your score";
    if (cibil >= 750) return "Excellent! You have a high chance of loan approval with best rates.";
    if (cibil >= 650) return "Good score. You're eligible for most loans with competitive rates.";
    return "Low score. Consider improving your credit health before applying.";
  };

  const getLoanEligibility = () => {
    if (!cibil) return "Unknown";
    if (cibil >= 750) return "High";
    if (cibil >= 650) return "Medium";
    return "Low";
  };

  const getRecommendations = () => {
    if (!cibil) return ["Complete PAN verification", "Check your credit report regularly"];
    if (cibil >= 750) return [
      "You qualify for premium interest rates",
      "Consider applying for higher loan amounts",
      "Maintain your excellent credit history"
    ];
    if (cibil >= 650) return [
      "Pay all bills on time",
      "Keep credit utilization below 30%",
      "Avoid multiple loan applications"
    ];
    return [
      "Clear existing dues immediately",
      "Avoid new credit applications for 6 months",
      "Check for errors in credit report",
      "Build credit with secured cards"
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Loader className="w-16 h-16 text-blue-600" />
          <div className="absolute inset-0 animate-ping">
            <div className="w-16 h-16 rounded-full bg-blue-400 opacity-20"></div>
          </div>
        </motion.div>
        <p className="ml-4 text-gray-600 text-lg font-medium">Fetching your CIBIL Report...</p>
      </div>
    );
  }

  const scorePercentage = cibil ? ((cibil - 300) / (900 - 300)) * 100 : 0;

  return (
    <div id="print-content" className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Credit Health Report
            </span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            CIBIL Score Report
          </h1>
          <p className="text-gray-500">Your comprehensive credit health analysis</p>
        </motion.div>

        {/* Main Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl shadow-xl overflow-hidden mb-6 ${getScoreBgColor()} border ${cibil >= 750 ? "border-green-200" : cibil >= 650 ? "border-yellow-200" : "border-red-200"}`}
        >
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Score Display */}
              <div className="text-center">
                <div className="relative inline-block">
                  <svg className="w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - scorePercentage / 100)}`}
                      className={`${getScoreColor()} transition-all duration-1000`}
                      style={{ strokeLinecap: "round" }}
                      transform="rotate(-90 96 96)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className={`text-5xl font-bold ${getScoreColor()}`}
                    >
                      {cibil || "--"}
                    </motion.div>
                    <p className="text-xs text-gray-500 mt-1">out of 900</p>
                  </div>
                </div>
              </div>

              {/* Status & Message */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  {getStatusIcon()}
                  <span className={`text-2xl font-bold ${getScoreColor()}`}>
                    {getStatus()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{getScoreMessage()}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm">
                    <Shield className="w-3 h-3" />
                    Loan Eligibility: {getLoanEligibility()}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm">
                    <Calendar className="w-3 h-3" />
                    Last Updated: Today
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Report
                </button>
                <button
                  onClick={handleDeepReport}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition flex items-center gap-2 shadow-md"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Deep Report (₹499)
                </button>
              </div>
            </div>

            {/* Score Range Indicator */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Poor (300-549)</span>
                <span>Average (550-649)</span>
                <span>Good (650-749)</span>
                <span>Excellent (750-900)</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-full flex">
                  <div className="w-[27.7%] bg-red-500"></div>
                  <div className="w-[16.6%] bg-orange-500"></div>
                  <div className="w-[27.7%] bg-yellow-500"></div>
                  <div className="w-[27.7%] bg-green-500"></div>
                </div>
              </div>
              {cibil && (
                <div
                  className="relative mt-2"
                  style={{ marginLeft: `${scorePercentage}%` }}
                >
                  <div className="absolute -translate-x-1/2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <p className="text-xs text-blue-600 mt-1 whitespace-nowrap">Your Score</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detailed Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Score Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Score Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Payment History</span>
                  <span className="font-medium">{cibil >= 750 ? "Excellent" : cibil >= 650 ? "Good" : "Poor"}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${cibil >= 750 ? "w-[90%] bg-green-500" : cibil >= 650 ? "w-[65%] bg-yellow-500" : "w-[40%] bg-red-500"}`}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Credit Utilization</span>
                  <span className="font-medium">{cibil >= 750 ? "Excellent" : cibil >= 650 ? "Good" : "Poor"}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${cibil >= 750 ? "w-[85%] bg-green-500" : cibil >= 650 ? "w-[60%] bg-yellow-500" : "w-[35%] bg-red-500"}`}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Credit Age</span>
                  <span className="font-medium">{cibil >= 750 ? "Good" : cibil >= 650 ? "Average" : "Poor"}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${cibil >= 750 ? "w-[70%] bg-green-500" : cibil >= 650 ? "w-[50%] bg-yellow-500" : "w-[30%] bg-red-500"}`}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Recent Enquiries</span>
                  <span className="font-medium">{cibil >= 750 ? "Excellent" : cibil >= 650 ? "Good" : "Poor"}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${cibil >= 750 ? "w-[95%] bg-green-500" : cibil >= 650 ? "w-[70%] bg-yellow-500" : "w-[45%] bg-red-500"}`}></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-800">Recommendations</h3>
            </div>
            <ul className="space-y-2">
              {getRecommendations().map((rec, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* User Profile Card - Always Expanded */}
        {userDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Profile Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-800">
                    {userDetails.first_name} {userDetails.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-800">{userDetails.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-800">{userDetails.phone_number}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">PAN:</span>
                  <span className="font-mono text-gray-800">{userDetails.pan_number}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Location:</span>
                  <span className="text-gray-800">{userDetails.city}, {userDetails.state}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Employment:</span>
                  <span className="capitalize text-gray-800">{userDetails.employment_type}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Understanding CIBIL Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Understanding Your CIBIL Score</h3>
              <p className="text-sm text-gray-600 mb-3">
                Your CIBIL score ranges from 300 to 900. A higher score indicates better creditworthiness 
                and increases your chances of loan approval with favorable interest rates.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white rounded-lg p-2 text-center">
                  <span className="block text-red-600 font-bold">300-549</span>
                  <span className="text-gray-500">Poor</span>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <span className="block text-orange-600 font-bold">550-649</span>
                  <span className="text-gray-500">Average</span>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <span className="block text-yellow-600 font-bold">650-749</span>
                  <span className="text-gray-500">Good</span>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <span className="block text-green-600 font-bold">750-900</span>
                  <span className="text-gray-500">Excellent</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Your CIBIL data is fetched from official credit bureaus and is 100% secure
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Deep CIBIL Report</h3>
                <p className="text-gray-600 text-sm">Get comprehensive credit analysis with detailed insights</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Detailed Credit History</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Payment Track Record</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Credit Utilization Analysis</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Risk Assessment Report</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">PDF Download</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Report Price</span>
                  <span className="text-2xl font-bold text-purple-600">₹499</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">One-time payment. Instant download after payment.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={processingPayment}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingPayment ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pay ₹499
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}