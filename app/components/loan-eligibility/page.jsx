"use client";

import { useEffect, useState } from "react";
import { getWithAuth, postWithAuth } from "../../lib/api";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  FilterIcon,
  SearchIcon,
  DownloadIcon,
  RefreshCwIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XCircleIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  DollarSignIcon,
  UsersIcon,
  ActivityIcon,
  PieChartIcon,
  BarChartIcon,
  EyeIcon,
  FileTextIcon,
  PrinterIcon,
  MailIcon,
  MoreVerticalIcon,
  DownloadCloudIcon,
  ClockIcon,
  AwardIcon,
  PercentIcon,
  ShieldIcon,
  UserIcon,
  BuildingIcon,
  PhoneIcon,
  MailIcon as MailIcon2,
  CreditCardIcon,
  HomeIcon,
  BriefcaseIcon,
  InfoIcon
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoanEligibilityPage() {
  const router = useRouter();
  const [eligibilityData, setEligibilityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDecision, setFilterDecision] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [eligibilityForm, setEligibilityForm] = useState({
    name: "",
    mobile: "",
    pan_number: "",
    cibil_score: "",
    monthly_income: "",
    loan_amount: ""
  });
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    eligible: 0,
    notEligible: 0,
    pending: 0,
    averageRiskScore: 0,
    totalEligibleAmount: 0
  });

  useEffect(() => {
    fetchEligibilityData();
  }, []);

  const fetchEligibilityData = async () => {
    setLoading(true);
    try {
      // Note: Your backend doesn't have a GET endpoint for eligibility records
      // This would need to be implemented or we can use loan applications data
      const res = await getWithAuth("loan-applications/");
      
      // Transform loan applications into eligibility records
      const transformed = res.map(app => ({
        id: app.id,
        user_id: app.user?.id || app.id,
        user_name: app.full_name,
        user_email: app.email,
        user_phone: app.phone,
        eligible_amount: app.approved_amount || app.requested_amount,
        risk_score: app.risk_score,
        foir: app.foir,
        decision: app.status === 'approved' ? 'Approved' : 
                  app.status === 'rejected' ? 'Rejected' : 'Pending',
        created_at: app.created_at,
        category: app.category?.name,
        cibil_score: app.cibil_score
      }));
      
      setEligibilityData(transformed);
      calculateStats(transformed);
    } catch (error) {
      console.error("Error fetching eligibility data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    setCheckingEligibility(true);
    try {
      const response = await postWithAuth("loan-eligibility/check/", {
        name: eligibilityForm.name,
        mobile: eligibilityForm.mobile,
        pan_number: eligibilityForm.pan_number,
        cibil_score: parseInt(eligibilityForm.cibil_score) || 0,
        monthly_income: parseFloat(eligibilityForm.monthly_income) || 0,
        loan_amount: parseFloat(eligibilityForm.loan_amount) || 0
      });
      
      setEligibilityResult(response);
      
      // If eligible, refresh the list
      if (response.status === 'eligible') {
        fetchEligibilityData();
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const calculateStats = (data) => {
    const eligible = data.filter(item => item.decision === "Approved").length;
    const notEligible = data.filter(item => item.decision === "Rejected").length;
    const pending = data.filter(item => item.decision === "Pending").length;
    const totalEligibleAmount = data.reduce((sum, item) => 
      sum + (item.decision === "Approved" ? (item.eligible_amount || 0) : 0), 0);
    const averageRiskScore = Math.round(
      data.reduce((sum, item) => sum + (item.risk_score || 0), 0) / (data.length || 1)
    );

    setStats({
      total: data.length,
      eligible,
      notEligible,
      pending,
      averageRiskScore,
      totalEligibleAmount
    });
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? 
      <ArrowUpIcon className="h-3 w-3" /> : 
      <ArrowDownIcon className="h-3 w-3" />;
  };

  const filteredAndSortedData = () => {
    let filtered = [...eligibilityData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.user_id?.toString().includes(searchTerm) ||
        item.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user_phone?.includes(searchTerm) ||
        item.eligible_amount?.toString().includes(searchTerm) ||
        item.decision?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply decision filter
    if (filterDecision !== "all") {
      filtered = filtered.filter(item => item.decision === filterDecision);
    }

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= new Date(dateRange.start) && itemDate <= new Date(dateRange.end);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortConfig.key === "eligible_amount") {
        return sortConfig.direction === "asc" 
          ? (a.eligible_amount || 0) - (b.eligible_amount || 0)
          : (b.eligible_amount || 0) - (a.eligible_amount || 0);
      }
      if (sortConfig.key === "risk_score") {
        return sortConfig.direction === "asc"
          ? (a.risk_score || 0) - (b.risk_score || 0)
          : (b.risk_score || 0) - (a.risk_score || 0);
      }
      if (sortConfig.key === "foir") {
        return sortConfig.direction === "asc"
          ? (a.foir || 0) - (b.foir || 0)
          : (b.foir || 0) - (a.foir || 0);
      }
      // Default sort by date
      return sortConfig.direction === "asc"
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    });

    return filtered;
  };

  // Pagination
  const filteredData = filteredAndSortedData();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getRiskScoreColor = (score) => {
    if (score >= 80) return "bg-red-500";
    if (score >= 60) return "bg-orange-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getRiskScoreText = (score) => {
    if (score >= 80) return "Very High Risk";
    if (score >= 60) return "High Risk";
    if (score >= 40) return "Medium Risk";
    return "Low Risk";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportToCSV = () => {
    const headers = ['User ID', 'Name', 'Phone', 'Eligible Amount', 'Risk Score', 'FOIR', 'Decision', 'Date'];
    const csvData = filteredData.map(item => [
      item.user_id,
      item.user_name,
      item.user_phone,
      item.eligible_amount,
      item.risk_score,
      item.foir,
      item.decision,
      item.created_at
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-eligibility-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.id));
    }
  };

  const viewApplicationDetails = (id) => {
    router.push(`/my-applications/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading eligibility data...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we fetch the latest records</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <AwardIcon className="h-8 w-8 text-blue-600" />
              Loan Eligibility Dashboard
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-1">
              <ActivityIcon className="h-4 w-4" />
              Check and manage loan eligibility for customers
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEligibilityModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <AwardIcon className="h-4 w-4" />
              <span>Check Eligibility</span>
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <FilterIcon className="h-4 w-4 text-gray-500" />
              <span>Filters</span>
              {(filterDecision !== "all" || dateRange.start || searchTerm) && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                  Active
                </span>
              )}
            </button>
            
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <DownloadCloudIcon className="h-4 w-4 text-gray-500" />
              <span>Export</span>
            </button>
            
            <button
              onClick={fetchEligibilityData}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh"
            >
              <RefreshCwIcon className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total Applications</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {((stats.eligible / stats.total) * 100 || 0).toFixed(1)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.eligible}</p>
            <p className="text-sm text-gray-500 mt-1">Eligible</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                {((stats.notEligible / stats.total) * 100 || 0).toFixed(1)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.notEligible}</p>
            <p className="text-sm text-gray-500 mt-1">Not Eligible</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                Pending
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">In Review</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSignIcon className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.totalEligibleAmount)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Eligible Amount</p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ActivityIcon className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Risk Score</p>
                  <p className="text-xl font-bold text-gray-800">{stats.averageRiskScore}</p>
                </div>
              </div>
              <div className="w-20 h-20 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700">{stats.averageRiskScore}%</span>
                </div>
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke={stats.averageRiskScore > 60 ? "#ef4444" : "#f59e0b"}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - stats.averageRiskScore / 100)}`}
                    className="transition-all duration-500"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <PercentIcon className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Eligibility Rate</p>
                  <p className="text-xl font-bold text-gray-800">
                    {((stats.eligible / stats.total) * 100 || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <div 
                  className="h-12 w-8 bg-green-500 rounded-t-lg"
                  style={{ height: `${(stats.eligible / stats.total) * 100 || 0}px` }}
                ></div>
                <div 
                  className="h-12 w-8 bg-red-500 rounded-t-lg"
                  style={{ height: `${(stats.notEligible / stats.total) * 100 || 0}px` }}
                ></div>
                <div 
                  className="h-12 w-8 bg-gray-300 rounded-t-lg"
                  style={{ height: `${(stats.pending / stats.total) * 100 || 0}px` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 animate-slideDown">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Name, Phone, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={filterDecision}
                onChange={(e) => setFilterDecision(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Decisions</option>
                <option value="Approved">Approved/Eligible</option>
                <option value="Rejected">Rejected/Not Eligible</option>
                <option value="Pending">Pending Review</option>
              </select>
            </div>

            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start Date"
              />
            </div>

            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="End Date"
              />
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterDecision("all");
                setDateRange({ start: "", end: "" });
              }}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <XCircleIcon className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-700">Loan Eligibility Records</h2>
            {selectedItems.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                {selectedItems.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left w-8">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("eligible_amount")}>
                  <div className="flex items-center gap-1">
                    Eligible Amount {getSortIcon("eligible_amount")}
                  </div>
                </th>
                <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("risk_score")}>
                  <div className="flex items-center gap-1">
                    Risk Score {getSortIcon("risk_score")}
                  </div>
                </th>
                <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("foir")}>
                  <div className="flex items-center gap-1">
                    FOIR {getSortIcon("foir")}
                  </div>
                </th>
                <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("decision")}>
                  <div className="flex items-center gap-1">
                    Decision {getSortIcon("decision")}
                  </div>
                </th>
                <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("created_at")}>
                  <div className="flex items-center gap-1">
                    Date {getSortIcon("created_at")}
                  </div>
                </th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedItems.includes(item.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {item.user_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.user_name || `User ${item.user_id}`}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            {item.user_phone && (
                              <span className="flex items-center gap-1">
                                <PhoneIcon className="h-3 w-3" />
                                {item.user_phone}
                              </span>
                            )}
                            {item.cibil_score && (
                              <span className="flex items-center gap-1">
                                <CreditCardIcon className="h-3 w-3" />
                                CIBIL: {item.cibil_score}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(item.eligible_amount)}
                        </span>
                        {item.category && (
                          <span className="text-xs text-gray-400">{item.category}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`${getRiskScoreColor(item.risk_score)} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${item.risk_score || 0}%` }}
                          ></div>
                        </div>
                        <div className="relative group">
                          <span className="text-xs font-medium text-gray-600">
                            {item.risk_score || 'N/A'}
                          </span>
                          {item.risk_score && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {getRiskScoreText(item.risk_score)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">{item.foir || 0}%</span>
                        <span className="text-xs text-gray-400">FOIR</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                          item.decision === "Approved"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : item.decision === "Rejected"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        }`}
                      >
                        {item.decision === "Approved" && <CheckCircleIcon className="h-3 w-3" />}
                        {item.decision === "Rejected" && <XCircleIcon className="h-3 w-3" />}
                        {item.decision === "Pending" && <ClockIcon className="h-3 w-3" />}
                        {item.decision}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{formatDate(item.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewApplicationDetails(item.id)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="View Application"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Download Report"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <FileTextIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-600 mb-1">No records found</p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your filters or check eligibility for new customers
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setCurrentPage(1);
                // You would need to implement changing items per page
              }}
              className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        )}
      </div>

      {/* Eligibility Check Modal */}
      {showEligibilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AwardIcon className="h-5 w-5 text-blue-600" />
                  Check Loan Eligibility
                </h2>
                <button
                  onClick={() => {
                    setShowEligibilityModal(false);
                    setEligibilityResult(null);
                    setEligibilityForm({
                      name: "", mobile: "", pan_number: "",
                      cibil_score: "", monthly_income: "", loan_amount: ""
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!eligibilityResult ? (
                <form onSubmit={(e) => { e.preventDefault(); checkEligibility(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={eligibilityForm.name}
                          onChange={(e) => setEligibilityForm({...eligibilityForm, name: e.target.value})}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          required
                          value={eligibilityForm.mobile}
                          onChange={(e) => setEligibilityForm({...eligibilityForm, mobile: e.target.value})}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter mobile number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number *
                      </label>
                      <div className="relative">
                        <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={eligibilityForm.pan_number}
                          onChange={(e) => setEligibilityForm({...eligibilityForm, pan_number: e.target.value})}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                          placeholder="Enter PAN number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CIBIL Score
                      </label>
                      <div className="relative">
                        <ActivityIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={eligibilityForm.cibil_score}
                          onChange={(e) => setEligibilityForm({...eligibilityForm, cibil_score: e.target.value})}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter CIBIL score"
                          min="300"
                          max="900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Income (₹) *
                      </label>
                      <div className="relative">
                        <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          required
                          value={eligibilityForm.monthly_income}
                          onChange={(e) => setEligibilityForm({...eligibilityForm, monthly_income: e.target.value})}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter monthly income"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Required Loan Amount (₹) *
                      </label>
                      <div className="relative">
                        <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          required
                          value={eligibilityForm.loan_amount}
                          onChange={(e) => setEligibilityForm({...eligibilityForm, loan_amount: e.target.value})}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter loan amount"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 flex items-start gap-2">
                      <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        We'll check eligibility across multiple loan products. 
                        CIBIL score is optional - if not provided, we'll use PAN for bureau fetch.
                      </span>
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEligibilityModal(false);
                        setEligibilityForm({
                          name: "", mobile: "", pan_number: "",
                          cibil_score: "", monthly_income: "", loan_amount: ""
                        });
                      }}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={checkingEligibility}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {checkingEligibility ? (
                        <>
                          <RefreshCwIcon className="h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <AwardIcon className="h-4 w-4" />
                          Check Eligibility
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {eligibilityResult.status === 'eligible' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 rounded-full">
                          <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-green-700">Customer is Eligible!</h3>
                          <p className="text-green-600">Found {eligibilityResult.eligible_loans?.length || 0} eligible loan products</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Customer Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="font-medium">{eligibilityResult.customer?.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Mobile</p>
                            <p className="font-medium">{eligibilityResult.customer?.mobile}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">PAN</p>
                            <p className="font-medium">{eligibilityResult.customer?.pan_number}</p>
                          </div>
                        </div>
                      </div>

                      <h4 className="font-semibold text-gray-700 mb-3">Eligible Loan Products</h4>
                      <div className="space-y-3">
                        {eligibilityResult.eligible_loans?.map((loan, index) => (
                          <div key={index} className="bg-white border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-bold text-gray-800">{loan.name}</h5>
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                {loan.category?.name}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-3">
                              <div>
                                <p className="text-xs text-gray-500">Max Amount</p>
                                <p className="font-semibold text-blue-600">{formatCurrency(loan.max_amount)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Interest Rate</p>
                                <p className="font-semibold">{loan.interest_rate}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Tenure</p>
                                <p className="font-semibold">{loan.max_tenure} months</p>
                              </div>
                            </div>
                            <button className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                              Apply Now
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-100 rounded-full">
                          <XCircleIcon className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-red-700">Not Eligible</h3>
                          <p className="text-red-600">Customer doesn't meet eligibility criteria</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-700 mb-3">Reasons</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {eligibilityResult.reason?.map((reason, index) => (
                            <li key={index} className="text-sm text-gray-600">{reason}</li>
                          ))}
                        </ul>
                        {eligibilityResult.reapply_after_days && (
                          <p className="text-sm text-gray-500 mt-3">
                            You can reapply after {eligibilityResult.reapply_after_days} days
                          </p>
                        )}
                      </div>

                      {eligibilityResult.suggested_products?.length > 0 && (
                        <>
                          <h4 className="font-semibold text-gray-700 mb-3">Suggested Alternatives</h4>
                          <div className="space-y-3">
                            {eligibilityResult.suggested_products.map((product, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                <h5 className="font-bold text-gray-800 mb-2">{product.name}</h5>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-gray-500">Amount Range</p>
                                    <p className="font-semibold">{formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Interest Rate</p>
                                    <p className="font-semibold">{product.interest_rate}%</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {
                        setEligibilityResult(null);
                        setEligibilityForm({
                          name: "", mobile: "", pan_number: "",
                          cibil_score: "", monthly_income: "", loan_amount: ""
                        });
                      }}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Check Another
                    </button>
                    <button
                      onClick={() => {
                        setShowEligibilityModal(false);
                        setEligibilityResult(null);
                        setEligibilityForm({
                          name: "", mobile: "", pan_number: "",
                          cibil_score: "", monthly_income: "", loan_amount: ""
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}