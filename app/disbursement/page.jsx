"use client";

import { useEffect, useState } from "react";
import { getWithAuth, postWithAuth } from "../lib/api";
import {
  DollarSignIcon,
  BanknoteIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  DownloadIcon,
  EyeIcon,
  UserIcon,
  CreditCardIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreVerticalIcon,
  PrinterIcon,
  MailIcon,
  PhoneIcon,
  HomeIcon,
  BriefcaseIcon,
  AwardIcon,
  TrendingUpIcon,
  ShieldIcon,
  FileTextIcon,
  DownloadCloudIcon,
  InfoIcon,
  CheckIcon,
  XIcon,
  LoaderIcon,
  WalletIcon,
  BuildingIcon,
  CopyIcon,
  Share2Icon,
  LockIcon,
  UnlockIcon,
  ZapIcon,
  PieChartIcon,
  BarChartIcon,
  UsersIcon,
  PercentIcon,
  CalendarClockIcon,
  BankIcon,
  QrCodeIcon,
  SmartphoneIcon,
  GlobeIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  SendIcon,
  ReceiptIcon,
  HistoryIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
  MenuIcon,
  BellIcon,
  StarIcon,
  HeartIcon,
  BookmarkIcon,
  FlagIcon,
  TagIcon,
  HashIcon,
  AtSignIcon,
  MapPinIcon,
  Globe2Icon,
  CloudIcon,
  SunIcon,
  MoonIcon,
  Volume2Icon,
  VolumeXIcon,
  MicIcon,
  CameraIcon,
  VideoIcon,
  ImageIcon,
  MusicIcon,
  HeadphonesIcon,
  GamepadIcon,
  CoffeeIcon,
  PizzaIcon,
  CarIcon,
  BikeIcon,
  BusIcon,
  TrainIcon,
  PlaneIcon,
  ShipIcon,
  RocketIcon,
  SatelliteIcon,
  WifiIcon,
  BluetoothIcon,
  BatteryIcon,
  PowerIcon,
  CpuIcon,
  HardDriveIcon,
  MonitorIcon,
  PrinterIcon as PrinterIcon2,
  ScannerIcon,
  MouseIcon,
  KeyboardIcon,
  SpeakerIcon,
  MicrochipIcon,
  DatabaseIcon,
  CloudIcon as CloudIcon2,
  ServerIcon,
  NetworkIcon,
  ShieldIcon as ShieldIcon2,
  LockIcon as LockIcon2,
  KeyIcon,
  FingerprintIcon,
  EyeIcon as EyeIcon2,
  EyeOffIcon,
  BellIcon as BellIcon2,
  MailIcon as MailIcon2,
  MessageCircleIcon,
  MessageSquareIcon,
  PhoneIcon as PhoneIcon2,
  VideoIcon as VideoIcon2,
  CameraIcon as CameraIcon2,
  MicIcon as MicIcon2,
  HeadphonesIcon as HeadphonesIcon2,
  SpeakerIcon as SpeakerIcon2,
  MusicIcon as MusicIcon2,
  GamepadIcon as GamepadIcon2,
  CoffeeIcon as CoffeeIcon2,
  PizzaIcon as PizzaIcon2,
  CarIcon as CarIcon2,
  BikeIcon as BikeIcon2,
  BusIcon as BusIcon2,
  TrainIcon as TrainIcon2,
  PlaneIcon as PlaneIcon2,
  ShipIcon as ShipIcon2,
  RocketIcon as RocketIcon2,
  SatelliteIcon as SatelliteIcon2,
  WifiIcon as WifiIcon2,
  BluetoothIcon as BluetoothIcon2,
  BatteryIcon as BatteryIcon2,
  PowerIcon as PowerIcon2,
  CpuIcon as CpuIcon2,
  HardDriveIcon as HardDriveIcon2,
  MonitorIcon as MonitorIcon2,
  ScannerIcon as ScannerIcon2,
  MouseIcon as MouseIcon2,
  KeyboardIcon as KeyboardIcon2,
  MicrochipIcon as MicrochipIcon2,
  DatabaseIcon as DatabaseIcon2,
  ServerIcon as ServerIcon2,
  NetworkIcon as NetworkIcon2,
  ShieldIcon as ShieldIcon3,
  LockIcon as LockIcon3,
  KeyIcon as KeyIcon2,
  FingerprintIcon as FingerprintIcon2
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
      const filtered = res.filter(a => a.status === "approved");
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
      const payload = {
        mode: mode
      };
      if (utr) payload.utr_number = utr;
      
      const response = await postWithAuth(`loan-applications/${id}/disburse/`, payload);
      setDisbursementResult({
        success: true,
        message: "Loan disbursed successfully!",
        data: response
      });
      await fetchLoans();
    } catch (error) {
      setDisbursementResult({
        success: false,
        message: error.message || "Failed to disburse loan. Please try again."
      });
    } finally {
      setDisbursing(false);
    }
  };

  const handleDisburse = async () => {
    if (!selectedLoan) return;
    
    const mode = document.querySelector('input[name="disbursementMode"]:checked')?.value || 'bank_transfer';
    const utr = document.getElementById('utrNumber')?.value;
    
    await disburse(selectedLoan.id, mode, utr);
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

  const filteredAndSortedLoans = () => {
    let filtered = [...approvedLoans];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(loan => 
        loan.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.phone?.includes(searchTerm) ||
        loan.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.pan_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id?.toString().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(loan => loan.category?.id?.toString() === filterCategory);
    }

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(loan => {
        const loanDate = new Date(loan.created_at);
        return loanDate >= new Date(dateRange.start) && loanDate <= new Date(dateRange.end);
      });
    }

    // Apply sorting
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
      // Default sort by date
      return sortConfig.direction === "asc"
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    });

    return filtered;
  };

  // Pagination
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

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
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
              <DollarSignIcon className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading disbursement data...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we fetch approved loans</p>
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
              <BanknoteIcon className="h-8 w-8 text-green-600" />
              Loan Disbursement Dashboard
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-1">
              <SendIcon className="h-4 w-4" />
              Manage and process loan disbursements for approved applications
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedLoans.length > 0 && (
              <button
                onClick={bulkDisburse}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <ZapIcon className="h-4 w-4" />
                <span>Bulk Disburse ({selectedLoans.length})</span>
              </button>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <FilterIcon className="h-4 w-4 text-gray-500" />
              <span>Filters</span>
              {(filterCategory !== "all" || dateRange.start || searchTerm) && (
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
              onClick={fetchLoans}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh"
            >
              <RefreshCwIcon className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
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
            <p className="text-sm text-gray-500 mt-1">Approved Loans</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSignIcon className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Amount
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</p>
            <p className="text-sm text-gray-500 mt-1">Total Disbursable</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUpIcon className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Average
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.avgAmount)}</p>
            <p className="text-sm text-gray-500 mt-1">Avg. Loan Amount</p>
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
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Disbursement</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                Today
              </span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{stats.disbursedToday}</p>
            <p className="text-sm text-gray-500 mt-1">Added Today</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <CalendarClockIcon className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                This Month
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.disbursedThisMonth}</p>
            <p className="text-sm text-gray-500 mt-1">Added This Month</p>
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
                placeholder="Search by Name, Phone, PAN, ID..."
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
                setFilterCategory("all");
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
            <h2 className="font-semibold text-gray-700">Approved Loans Ready for Disbursement</h2>
            {selectedLoans.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                {selectedLoans.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLoans.length)} of {filteredLoans.length}
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
                    checked={selectedLoans.length === currentLoans.length && currentLoans.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1">
                    Borrower {getSortIcon("name")}
                  </div>
                </th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Loan Details</th>
                <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("amount")}>
                  <div className="flex items-center gap-1">
                    Amount {getSortIcon("amount")}
                  </div>
                </th>
                <th className="px-4 py-3 text-left">Risk Score</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort("created_at")}>
                  <div className="flex items-center gap-1">
                    Approved On {getSortIcon("created_at")}
                  </div>
                </th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentLoans.length > 0 ? (
                currentLoans.map((loan) => (
                  <tr
                    key={loan.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedLoans.includes(loan.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLoans.includes(loan.id)}
                        onChange={() => toggleLoanSelection(loan.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(loan.full_name)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{loan.full_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <HashIcon className="h-3 w-3" />
                            ID: {loan.id}
                          </div>
                          {loan.pan_number && (
                            <div className="text-xs text-gray-500">PAN: {loan.pan_number}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {loan.phone && (
                          <div className="flex items-center gap-1 text-xs">
                            <PhoneIcon className="h-3 w-3 text-gray-400" />
                            <span>{loan.phone}</span>
                          </div>
                        )}
                        {loan.email && (
                          <div className="flex items-center gap-1 text-xs">
                            <MailIcon className="h-3 w-3 text-gray-400" />
                            <span className="truncate max-w-[150px]">{loan.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <BriefcaseIcon className="h-3 w-3 text-gray-400" />
                          <span>{loan.employment_type || 'N/A'}</span>
                        </div>
                        {loan.tenure_months && (
                          <div className="flex items-center gap-1 text-xs">
                            <ClockIcon className="h-3 w-3 text-gray-400" />
                            <span>{loan.tenure_months} months</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-green-600">
                          {formatCurrency(loan.approved_amount || loan.requested_amount)}
                        </span>
                        {loan.interest_rate && (
                          <span className="text-xs text-gray-500">
                            @ {loan.interest_rate}% p.a.
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {loan.risk_score ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                loan.risk_score >= 80 ? 'bg-red-500' :
                                loan.risk_score >= 60 ? 'bg-orange-500' :
                                loan.risk_score >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${loan.risk_score}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            loan.risk_score >= 80 ? 'bg-red-100 text-red-700' :
                            loan.risk_score >= 60 ? 'bg-orange-100 text-orange-700' :
                            loan.risk_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {loan.risk_score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {loan.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(loan.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedLoan(loan);
                            setShowDisburseModal(true);
                          }}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <SendIcon className="h-3 w-3" />
                          Disburse
                        </button>
                        <button
                          onClick={() => router.push(`/my-applications/${loan.id}`)}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <BanknoteIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-600 mb-1">No approved loans found</p>
                      <p className="text-sm text-gray-400">
                        {searchTerm || filterCategory !== "all" || dateRange.start 
                          ? "Try adjusting your filters" 
                          : "There are no loans ready for disbursement"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLoans.length > 0 && (
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

      {/* Disbursement Modal */}
      {showDisburseModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <SendIcon className="h-5 w-5 text-green-600" />
                  Disburse Loan
                </h2>
                <button
                  onClick={() => {
                    setShowDisburseModal(false);
                    setSelectedLoan(null);
                    setDisbursementResult(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!disbursementResult ? (
                <>
                  {/* Loan Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3">Loan Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Borrower</p>
                        <p className="font-medium">{selectedLoan.full_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Loan ID</p>
                        <p className="font-medium">#{selectedLoan.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-bold text-green-600">{formatCurrency(selectedLoan.approved_amount || selectedLoan.requested_amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Interest Rate</p>
                        <p className="font-medium">{selectedLoan.interest_rate || 'N/A'}% p.a.</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tenure</p>
                        <p className="font-medium">{selectedLoan.tenure_months} months</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="font-medium">{selectedLoan.category?.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Disbursement Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Disbursement Mode
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="disbursementMode"
                            value="bank_transfer"
                            defaultChecked
                            className="mr-2"
                          />
                          <BankIcon className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm">Bank Transfer</span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="disbursementMode"
                            value="upi"
                            className="mr-2"
                          />
                          <SmartphoneIcon className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm">UPI</span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="disbursementMode"
                            value="cash"
                            className="mr-2"
                          />
                          <DollarSignIcon className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm">Cash</span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="disbursementMode"
                            value="cheque"
                            className="mr-2"
                          />
                          <ReceiptIcon className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm">Cheque</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UTR / Reference Number
                      </label>
                      <input
                        type="text"
                        id="utrNumber"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter transaction reference number"
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-700 flex items-start gap-2">
                        <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          Disbursing this loan will create a loan account and generate EMI schedule. 
                          The borrower will receive confirmation via SMS and email.
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6">
                    <button
                      onClick={() => {
                        setShowDisburseModal(false);
                        setSelectedLoan(null);
                      }}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDisburse}
                      disabled={disbursing}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {disbursing ? (
                        <>
                          <RefreshCwIcon className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <SendIcon className="h-4 w-4" />
                          Confirm Disbursement
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  {disbursementResult.success ? (
                    <>
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircleIcon className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Disbursement Successful!</h3>
                      <p className="text-gray-600 mb-6">{disbursementResult.message}</p>
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600">
                          Loan has been disbursed successfully. The borrower will receive the funds shortly.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowDisburseModal(false);
                          setSelectedLoan(null);
                          setDisbursementResult(null);
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Close
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircleIcon className="h-10 w-10 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Disbursement Failed</h3>
                      <p className="text-gray-600 mb-6">{disbursementResult.message}</p>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setDisbursementResult(null)}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => {
                            setShowDisburseModal(false);
                            setSelectedLoan(null);
                            setDisbursementResult(null);
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}