"use client";

import { useEffect, useState } from "react";
import { getWithAuth } from "../../../lib/api";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  User,
  IndianRupee,
  BarChart3,
  Activity,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Loader,
  Clock,
  ArrowUpRight,
  Briefcase,
} from "lucide-react";

export default function LoanDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getWithAuth("loan-applications/stats/");
      setStats(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const toggleRowExpand = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      case "risk_review": return <AlertTriangle className="w-4 h-4" />;
      case "disbursed": return <TrendingUp className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Loader className="w-12 h-12 text-blue-600" />
          <div className="absolute inset-0 animate-ping">
            <div className="w-12 h-12 rounded-full bg-blue-400 opacity-20"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!stats) return null;

  const statusMap = {};
  stats.status_breakdown?.forEach((item) => {
    statusMap[item.status] = item.count;
  });

  // Filter applications
  let filteredApps = stats.applications || [];
  if (searchTerm) {
    filteredApps = filteredApps.filter(app => 
      app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.pan_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone?.includes(searchTerm)
    );
  }
  if (filterStatus !== "all") {
    filteredApps = filteredApps.filter(app => app.status === filterStatus);
  }

  // Sort applications
  filteredApps.sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (sortField === "requested_amount") {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    }
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const statusColors = {
    approved: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", light: "bg-green-50" },
    rejected: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", light: "bg-red-50" },
    risk_review: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", light: "bg-yellow-50" },
    disbursed: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", light: "bg-purple-50" },
  };

  const statsCards = [
    { title: "Total Applications", value: stats.total_applications, icon: Users, gradient: "from-blue-500 to-blue-600" },
    { title: "Approved", value: statusMap.approved || 0, icon: CheckCircle, gradient: "from-green-500 to-green-600" },
    { title: "Rejected", value: statusMap.rejected || 0, icon: XCircle, gradient: "from-red-500 to-red-600" },
    { title: "Risk Review", value: statusMap.risk_review || 0, icon: AlertTriangle, gradient: "from-yellow-500 to-yellow-600" },
    { title: "Disbursed", value: statusMap.disbursed || 0, icon: TrendingUp, gradient: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Loan Applications Dashboard
              </h1>
              <p className="text-gray-500 mt-1">Monitor and manage all loan applications</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-gray-700">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          {statsCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${card.gradient} shadow-lg`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
              <div className="relative p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/80 text-xs uppercase tracking-wide font-medium">
                      {card.title}
                    </p>
                    <p className="text-white text-3xl font-bold mt-2">
                      {card.value}
                    </p>
                  </div>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-white/70" />
                  <span className="text-white/70 text-xs">Last 30 days</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, PAN, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="risk_review">Risk Review</option>
                <option value="disbursed">Disbursed</option>
              </select>
              <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Applications Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                <tr className="border-b border-gray-200">
                  {[
                    { field: "full_name", label: "Applicant", icon: User },
                    { field: "email", label: "Contact", icon: Mail },
                    { field: "city", label: "Location", icon: MapPin },
                    { field: "pan_number", label: "PAN", icon: CreditCard },
                    { field: "requested_amount", label: "Amount", icon: IndianRupee },
                    { field: "cibil_score", label: "CIBIL", icon: BarChart3 },
                    { field: "foir", label: "FOIR", icon: Activity },
                    { field: "status", label: "Status", icon: AlertTriangle },
                    { field: "created_at", label: "Applied On", icon: Calendar },
                  ].map((col) => (
                    <th
                      key={col.field}
                      className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition"
                      onClick={() => {
                        if (sortField === col.field) {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortField(col.field);
                          setSortOrder("desc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <col.icon className="w-3.5 h-3.5" />
                        {col.label}
                        {sortField === col.field && (
                          sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center">Details</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredApps.map((app, index) => (
                    <>
                      {/* Main Row */}
                      <motion.tr
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.02 }}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                          expandedRows[app.id] ? statusColors[app.status]?.light : ""
                        }`}
                        onClick={() => toggleRowExpand(app.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <Link
                                href={`/my-applications/${app.id}`}
                                className="font-semibold text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {app.full_name || "N/A"}
                              </Link>
                              <p className="text-xs text-gray-400">{app.user?.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Mail className="w-3 h-3" />
                              <span className="text-xs">{app.email || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <Phone className="w-3 h-3" />
                              <span className="text-xs">{app.phone || "N/A"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>{app.city || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {app.pan_number || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-bold text-blue-600">
                              {formatAmount(app.requested_amount)}
                            </span>
                            <p className="text-xs text-gray-400">
                              {app.category?.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-center">
                            <span className={`text-lg font-bold ${
                              app.cibil_score >= 750 ? "text-green-600" :
                              app.cibil_score >= 650 ? "text-yellow-600" : "text-red-600"
                            }`}>
                              {app.cibil_score || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-center">
                            <span className={`font-medium ${
                              app.foir <= 30 ? "text-green-600" :
                              app.foir <= 40 ? "text-yellow-600" : "text-orange-600"
                            }`}>
                              {app.foir}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            statusColors[app.status]?.bg || "bg-gray-100"
                          } ${statusColors[app.status]?.text || "text-gray-700"}`}>
                            {getStatusIcon(app.status)}
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(app.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpand(app.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded-lg transition"
                          >
                            {expandedRows[app.id] ? 
                              <ChevronUp className="w-4 h-4" /> : 
                              <ChevronDown className="w-4 h-4" />
                            }
                          </button>
                        </td>
                      </motion.tr>

                      {/* Expanded Details Row - Directly below the main row */}
                      <AnimatePresence>
                        {expandedRows[app.id] && (
                          <motion.tr
                            key={`expanded-${app.id}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-50"
                          >
                            <td colSpan={10} className="p-0">
                              <div className="p-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <User className="w-3 h-3" />
                                      Personal Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">Aadhar:</span>
                                        <span className="font-mono">
                                          {app.aadhar_number ? "•••• •••• " + app.aadhar_number.slice(-4) : "N/A"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">Date of Birth:</span>
                                        <span>{app.date_of_birth || "N/A"}</span>
                                      </div>
                                      <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">Address:</span>
                                        <span className="text-right">{app.address || "N/A"}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <Briefcase className="w-3 h-3" />
                                      Employment Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">Employment Type:</span>
                                        <span className="capitalize">{app.employment_type || "N/A"}</span>
                                      </div>
                                      <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">Employer:</span>
                                        <span>{app.employer_name || "N/A"}</span>
                                      </div>
                                      <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">Years of Experience:</span>
                                        <span>{app.years_in_current_job || "N/A"} years</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <CreditCard className="w-3 h-3" />
                                      Loan Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">Existing EMI:</span>
                                        <span>{formatAmount(app.existing_emi)}</span>
                                      </div>
                                      <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">Fraud Score:</span>
                                        <span>{app.fraud_score || "0"}</span>
                                      </div>
                                      <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">Bounce Count:</span>
                                        <span>{app.bounce_count || "0"}</span>
                                      </div>
                                      <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">90+ DPD:</span>
                                        <span className={app.has_90_dpd ? "text-red-600" : "text-green-600"}>
                                          {app.has_90_dpd ? "Yes" : "No"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">Written Off:</span>
                                        <span className={app.written_off ? "text-red-600" : "text-green-600"}>
                                          {app.written_off ? "Yes" : "No"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                                  <Link
                                    href={`/my-applications/${app.id}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Full Application Details
                                  </Link>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredApps.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No applications found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
            </motion.div>
          )}

          {/* Summary Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredApps.length}</span> of{" "}
              <span className="font-semibold">{stats.applications?.length || 0}</span> applications
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Approved</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Rejected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Review</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}