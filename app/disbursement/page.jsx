"use client";

import { useEffect, useState } from "react";
import { getWithAuth, postWithAuth } from "../lib/api";
import {
  DollarSign,
  Banknote,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Phone,
  Mail,
  Briefcase,
  Clock,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Send,
  FileText,
  DownloadCloud,
  Info,
  Users,
  TrendingUp,
  Zap,
  Bank,
  Smartphone,
  Receipt,
  Hash
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DisbursementPage() {
  const router = useRouter();
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLoans, setSelectedLoans] = useState([]);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [disbursing, setDisbursing] = useState(false);
  const [disbursementResult, setDisbursementResult] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    avgAmount: 0,
    disbursedToday: 0,
    disbursedThisMonth: 0,
    pendingCount: 0
  });

  useEffect(() => {
    fetchLoans();
    fetchCategories();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await getWithAuth("loan-applications/");
      const filtered = res.filter(
        a =>
          a.status === "approved" &&
          a.approved_amount &&
          a.interest_rate
      );
      setApprovedLoans(filtered);
      calculateStats(filtered);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getWithAuth("loan-categories/");
      setCategories(res);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const calculateStats = (loans) => {
    const total = loans.length;
    const totalAmount = loans.reduce((sum, loan) => sum + (loan.approved_amount || loan.requested_amount || 0), 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const disbursedToday = loans.filter(loan => {
      const loanDate = new Date(loan.created_at).toISOString().split('T')[0];
      return loanDate === today;
    }).length;

    const disbursedThisMonth = loans.filter(loan => {
      const loanDate = new Date(loan.created_at);
      return loanDate.getMonth() === currentMonth && loanDate.getFullYear() === currentYear;
    }).length;

    setStats({
      total,
      totalAmount,
      avgAmount,
      disbursedToday,
      disbursedThisMonth,
      pendingCount: total
    });
  };

  const disburse = async (id, mode = 'bank_transfer', utr = null) => {
    setDisbursing(true);
    try {
      const payload = { mode };
      if (utr) payload.utr_number = utr;

      const response = await postWithAuth(
        `loan-applications/${id}/disburse/`,
        payload
      );

      setDisbursementResult({
        success: true,
        message: "Loan disbursed successfully!",
        data: response
      });

      await fetchLoans();

      return true;
    } catch (error) {
      setDisbursementResult({
        success: false,
        message: error.message || "Failed to disburse loan"
      });

      return false;
    } finally {
      setDisbursing(false);
    }
  };

  const handleDisburse = async () => {
    if (!selectedLoan) return;

    const mode =
      document.querySelector('select[name="disbursementMode"]')?.value ||
      "bank_transfer";

    const utr = document.getElementById("utrNumber")?.value;

    const success = await disburse(selectedLoan.id, mode, utr);

    // ✅ CLOSE ONLY IF SUCCESS
    if (success) {
      setShowDisburseModal(false);
      setSelectedLoan(null);
    }
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
      <ArrowUp className="h-3 w-3" /> :
      <ArrowDown className="h-3 w-3" />;
  };

  const filteredAndSortedLoans = () => {
    let filtered = [...approvedLoans];

    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.phone?.includes(searchTerm) ||
        loan.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.pan_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id?.toString().includes(searchTerm)
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(loan => loan.category?.id?.toString() === filterCategory);
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(loan => {
        const loanDate = new Date(loan.created_at);
        return loanDate >= new Date(dateRange.start) && loanDate <= new Date(dateRange.end);
      });
    }

    filtered.sort((a, b) => {
      if (sortConfig.key === "amount") {
        const aAmount = a.approved_amount || a.requested_amount || 0;
        const bAmount = b.approved_amount || b.requested_amount || 0;
        return sortConfig.direction === "asc" ? aAmount - bAmount : bAmount - aAmount;
      }
      if (sortConfig.key === "name") {
        return sortConfig.direction === "asc"
          ? (a.full_name || "").localeCompare(b.full_name || "")
          : (b.full_name || "").localeCompare(a.full_name || "");
      }
      return sortConfig.direction === "asc"
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    });

    return filtered;
  };

  const filteredLoans = filteredAndSortedLoans();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLoans = filteredLoans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const toggleLoanSelection = (id) => {
    setSelectedLoans(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedLoans.length === currentLoans.length) {
      setSelectedLoans([]);
    } else {
      setSelectedLoans(currentLoans.map(loan => loan.id));
    }
  };

  const bulkDisburse = async () => {
    for (const id of selectedLoans) {
      await disburse(id);
    }
    setSelectedLoans([]);
  };

  const exportToCSV = () => {
    const headers = ['Loan ID', 'Name', 'Phone', 'Email', 'PAN', 'Amount', 'Category', 'Risk Score', 'Approved Date'];
    const csvData = filteredLoans.map(loan => [
      loan.id,
      loan.full_name,
      loan.phone,
      loan.email,
      loan.pan_number,
      loan.approved_amount || loan.requested_amount,
      loan.category?.name,
      loan.risk_score,
      loan.created_at
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disbursement-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading disbursement data...</p>
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
              <Banknote className="h-8 w-8 text-green-600" />
              Loan Disbursement Dashboard
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-1">
              <Send className="h-4 w-4" />
              Manage and process loan disbursements for approved applications
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedLoans.length > 0 && (
              <button
                onClick={bulkDisburse}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Zap className="h-4 w-4" />
                <span>Bulk Disburse ({selectedLoans.length})</span>
              </button>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Filter className="h-4 w-4 text-gray-500" />
              <span>Filters</span>
            </button>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <DownloadCloud className="h-4 w-4 text-gray-500" />
              <span>Export</span>
            </button>

            <button
              onClick={fetchLoans}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Approved Loans</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Amount</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</p>
            <p className="text-sm text-gray-500 mt-1">Total Disbursable</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Average</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.avgAmount)}</p>
            <p className="text-sm text-gray-500 mt-1">Avg. Loan Amount</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Disbursement</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-700">Approved Loans Ready for Disbursement</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" onChange={toggleAllSelection} className="rounded" />
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("name")}>
                  Borrower {getSortIcon("name")}
                </th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("amount")}>
                  Amount {getSortIcon("amount")}
                </th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" onChange={() => toggleLoanSelection(loan.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{loan.full_name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Hash className="h-3 w-3" /> ID: {loan.id}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs">
                      <Phone className="h-3 w-3 text-gray-400" /> {loan.phone}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Mail className="h-3 w-3 text-gray-400" /> {loan.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-green-600">
                      {formatCurrency(loan.approved_amount || loan.requested_amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {loan.category?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedLoan(loan);
                        setShowDisburseModal(true);
                      }}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 flex items-center gap-1"
                    >
                      <Send className="h-3 w-3" /> Disburse
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disbursement Modal */}
      {showDisburseModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Disburse Loan</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p><strong>Borrower:</strong> {selectedLoan.full_name}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedLoan.approved_amount || selectedLoan.requested_amount)}</p>
                <p><strong>Interest Rate:</strong> {selectedLoan.interest_rate}% p.a.</p>
                <p><strong>Tenure:</strong> {selectedLoan.tenure_months} months</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Disbursement Mode</label>
                <select
                  name="disbursementMode"
                  className="w-full px-3 py-2 border rounded-lg"
                  defaultValue="bank_transfer"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">UTR Number (Optional)</label>
                <input type="text" id="utrNumber" className="w-full px-3 py-2 border rounded-lg" />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-700">
                  Disbursing will create Loan Account and generate EMI Schedule automatically.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDisburseModal(false)} className="px-4 py-2 border rounded-lg">
                  Cancel
                </button>
                <button onClick={handleDisburse} disabled={disbursing} className="px-4 py-2 bg-green-600 text-white rounded-lg">
                  {disbursing ? "Processing..." : "Confirm Disbursement"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}