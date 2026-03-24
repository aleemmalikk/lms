"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWithAuth, postWithAuth } from "../../lib/api";
import {
  ArrowLeft,
  Wallet,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Download,
  Share2,
  Percent,
  CalendarDays,
  CircleDollarSign,
  Receipt,
  FileText,
  Smartphone,
  Shield,
  Zap
} from "lucide-react";

export default function EMIDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState(null);
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingEmi, setPayingEmi] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [selectedEmi, setSelectedEmi] = useState(null);

  useEffect(() => {
    if (id) {
      fetchLoanDetails();
      fetchEMISchedule();
    }
  }, [id]);

  const fetchLoanDetails = async () => {
    try {
      const res = await getWithAuth(`loan-applications/${id}/`);
      setLoan(res);
    } catch (error) {
      console.error("Error fetching loan:", error);
    }
  };

  const fetchEMISchedule = async () => {
    setLoading(true);
    try {
      const res = await getWithAuth(`loan-applications/${id}/emi_schedule/`);
      setEmis(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching EMI:", error);
      setEmis([]);
    } finally {
      setLoading(false);
    }
  };

  const payEmi = async (emiId) => {
    setPayingEmi(emiId);
    try {
      await postWithAuth(`loan-applications/${id}/pay-emi/${emiId}/`);
      setPaymentSuccess({ emiId, message: "EMI paid successfully!" });
      await fetchEMISchedule();
      setTimeout(() => setPaymentSuccess(null), 3000);
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setPayingEmi(null);
      setSelectedEmi(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateString;
    }
  };

  const calculateProgress = () => {
    const paid = emis.filter((e) => e.status === "paid").length;
    const total = emis.length;
    const totalAmount = emis.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const paidAmount = emis
      .filter((e) => e.status === "paid")
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return {
      paid,
      total,
      percentage: total > 0 ? (paid / total) * 100 : 0,
      totalAmount,
      paidAmount,
      remainingAmount: totalAmount - paidAmount,
    };
  };

  const getNextDueEmi = () => {
    return emis.find((e) => e.status !== "paid");
  };

  const progress = calculateProgress();
  const nextDue = getNextDueEmi();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading EMI schedule...</p>
          <p className="text-sm text-gray-400 mt-1">Please wait while we fetch your payment details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-8 px-4">
      <div className="">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/50"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Back to My Loans</span>
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => window.print()}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200/50"
            >
              <Download className="h-4 w-4 text-gray-600" />
            </button>
            
          </div>
        </div>

        {loan && (
          <div className="relative mb-8 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-95"></div>
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}
            ></div>
            
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                      <span className="text-xs font-medium text-white">Active Loan</span>
                    </div>
                    <div className="px-3 py-1 bg-green-400/20 rounded-full backdrop-blur-sm">
                      <span className="text-xs font-medium text-green-100">Disbursed</span>
                    </div>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Loan #{loan.id}
                  </h1>
                  <p className="text-blue-100 text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Disbursed on {formatDate(loan.created_at)}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-blue-100 text-xs">Total Loan Amount</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">
                      ₹{Number(loan.approved_amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Percent className="h-3 w-3 text-blue-200" />
                    <p className="text-blue-100 text-xs">Interest Rate</p>
                  </div>
                  <p className="text-white font-semibold">{loan.interest_rate || 0}% p.a.</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="h-3 w-3 text-blue-200" />
                    <p className="text-blue-100 text-xs">Tenure</p>
                  </div>
                  <p className="text-white font-semibold">{loan.tenure_months || 0} months</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <CircleDollarSign className="h-3 w-3 text-blue-200" />
                    <p className="text-blue-100 text-xs">Monthly EMI</p>
                  </div>
                  <p className="text-white font-semibold">
                    ₹{emis[0]?.amount ? Number(emis[0].amount).toLocaleString() : "0"}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-3 w-3 text-blue-200" />
                    <p className="text-blue-100 text-xs">Remaining Balance</p>
                  </div>
                  <p className="text-white font-semibold">
                    ₹{progress.remainingAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Payment Reminder Card */}
        {nextDue && nextDue.status !== "paid" && (
          <div className="mb-8 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Next Payment Due</h3>
                <p className="text-sm text-gray-600 mt-1">
                  EMI #{nextDue.emi_number} of ₹{Number(nextDue.amount || 0).toLocaleString()} is due on {formatDate(nextDue.due_date)}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setSelectedEmi(nextDue.id)}
                    className="px-4 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-orange-600 font-medium">
                  {Math.max(0, Math.ceil((new Date(nextDue.due_date) - new Date()) / (1000 * 60 * 60 * 24)))} days left
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Section */}
        {emis.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Repayment Progress</h2>
              <span className="text-sm text-gray-500">
                {progress.paid} of {progress.total} EMIs paid
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 rounded-full h-3 transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-3 text-sm">
                <div>
                  <p className="text-gray-500">Paid</p>
                  <p className="font-semibold text-green-600">₹{progress.paidAmount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">Remaining</p>
                  <p className="font-semibold text-orange-600">₹{progress.remainingAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMI Schedule Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Receipt className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">EMI Payment Schedule</h2>
              </div>
              <div className="flex gap-1">
                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-lg flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Paid: {emis.filter(e => e.status === "paid").length}
                </span>
                <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-xs rounded-lg flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Pending: {emis.filter(e => e.status !== "paid").length}
                </span>
              </div>
            </div>
          </div>

          {emis.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      EMI #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {emis.map((emi) => {
                    const isOverdue =
                      emi.status !== "paid" &&
                      new Date(emi.due_date) < new Date();
                    const isToday =
                      emi.status !== "paid" &&
                      new Date(emi.due_date).toDateString() ===
                        new Date().toDateString();
                    const isPaid = emi.status === "paid";

                    return (
                      <tr
                        key={emi.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isOverdue ? "bg-red-50/50" : isToday ? "bg-orange-50/50" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isPaid 
                                ? "bg-green-100 text-green-700" 
                                : isOverdue 
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}>
                              {emi.emi_number}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">
                              ₹{Number(emi.amount || 0).toLocaleString()}
                            </span>
                            {emi.principal_component && (
                              <span className="text-xs text-gray-400">
                                Principal: ₹{Number(emi.principal_component).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-gray-700">{formatDate(emi.due_date)}</span>
                            {isToday && (
                              <span className="text-xs text-orange-600 font-medium mt-1 flex items-center gap-1">
                                <Zap className="h-3 w-3" /> Due Today!
                              </span>
                            )}
                            {isOverdue && (
                              <span className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Overdue
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Paid
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Overdue
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              <Clock className="h-3.5 w-3.5" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {!isPaid && (
                            <button
                              onClick={() => setSelectedEmi(emi.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                isOverdue
                                  ? "bg-red-600 hover:bg-red-700 text-white shadow-md"
                                  : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-md"
                              }`}
                            >
                              Pay Now
                            </button>
                          )}
                          {isPaid && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Paid on {formatShortDate(emi.paid_date || emi.due_date)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No EMI schedule found</p>
              <p className="text-sm text-gray-400 mt-1">Your EMI schedule will appear here once the loan is disbursed</p>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {emis.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total EMIs</p>
                  <p className="text-2xl font-bold text-blue-900">{emis.length}</p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Paid EMIs</p>
                  <p className="text-2xl font-bold text-green-900">
                    {emis.filter((e) => e.status === "paid").length}
                  </p>
                </div>
                <div className="p-2 bg-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">Remaining EMIs</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {emis.filter((e) => e.status !== "paid").length}
                  </p>
                </div>
                <div className="p-2 bg-orange-200 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-700" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedEmi && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Confirm Payment</h2>
                </div>
                <button
                  onClick={() => setSelectedEmi(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {(() => {
                const emi = emis.find(e => e.id === selectedEmi);
                if (!emi) return null;
                return (
                  <>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">EMI Number</span>
                          <span className="font-semibold text-gray-900">#{emi.emi_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount</span>
                          <span className="text-2xl font-bold text-green-600">₹{Number(emi.amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Due Date</span>
                          <span className="text-gray-900">{formatDate(emi.due_date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p className="text-sm text-blue-700">
                          Your payment is secure and encrypted. You will receive confirmation via SMS and email.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedEmi(null)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => payEmi(selectedEmi)}
                        disabled={payingEmi === selectedEmi}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {payingEmi === selectedEmi ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Smartphone className="h-4 w-4" />
                            Pay Now
                          </>
                        )}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Toast */}
      {paymentSuccess && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-green-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">{paymentSuccess.message}</span>
        </div>
      )}

      {/* Add global styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fixed {
          animation: fadeIn 0.2s ease-out;
        }
        .bg-white.rounded-2xl {
          animation: scaleIn 0.2s ease-out;
        }
        .fixed.bottom-6 {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}