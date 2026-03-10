"use client";

import { useEffect, useState } from "react";
import { getWithAuth, postWithAuth } from "../../lib/api";
import { 
  PlusCircle, 
  Tag, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Calendar,
  Percent,
  Building,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import * as XLSX from 'xlsx';

export default function LoanCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedCategories, setPaginatedCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    min_income: "",
    min_cibil: 650,
    auto_reject_cibil: 600,
    max_foir: 60,
    max_loan_amount: "",
    min_tenure: "",
    max_tenure: "",
    base_interest_rate: "",
    fraud_threshold: 70,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update pagination when categories, searchTerm, or currentPage changes
  useEffect(() => {
    filterAndPaginateCategories();
  }, [categories, searchTerm, currentPage, itemsPerPage]);

  const fetchCategories = async () => {
    try {
      const data = await getWithAuth("loan-categories/");
      setCategories(data);
      setMessage({ 
        type: "success", 
        text: "✅ Categories loaded successfully" 
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: "❌ Failed to load categories" 
      });
    }
  };

  const filterAndPaginateCategories = () => {
    // First filter by search term
    const filtered = categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Calculate total pages
    const total = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(total || 1);
    
    // Adjust current page if it's out of bounds
    if (currentPage > total && total > 0) {
      setCurrentPage(total);
    }
    
    // Get current page items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedCategories(filtered.slice(startIndex, endIndex));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await postWithAuth("loan-categories/", formData);
      setMessage({ 
        type: "success", 
        text: "✅ Category Created Successfully" 
      });
      await fetchCategories();
      
      // Go to first page to see the new category
      setCurrentPage(1);

      setFormData({
        name: "",
        code: "",
        min_income: "",
        min_cibil: 650,
        auto_reject_cibil: 600,
        max_foir: 60,
        max_loan_amount: "",
        min_tenure: "",
        max_tenure: "",
        base_interest_rate: "",
        fraud_threshold: 70,
      });

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);

    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "❌ " + error.message 
      });
    }

    setLoading(false);
  };

  const handleDownload = () => {
    try {
      // Prepare data for Excel
      const excelData = categories.map(cat => ({
        'Category Name': cat.name,
        'Category Code': cat.code,
        'Min Income (₹)': cat.min_income,
        'Min CIBIL': cat.min_cibil,
        'Auto Reject CIBIL': cat.auto_reject_cibil,
        'Max FOIR (%)': cat.max_foir,
        'Max Loan Amount (₹)': cat.max_loan_amount,
        'Min Tenure (Months)': cat.min_tenure,
        'Max Tenure (Months)': cat.max_tenure,
        'Base Interest Rate (%)': cat.base_interest_rate,
        'Fraud Threshold': cat.fraud_threshold,
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add column headers styling
      const wscols = [
        { wch: 20 }, // Category Name
        { wch: 15 }, // Category Code
        { wch: 15 }, // Min Income
        { wch: 12 }, // Min CIBIL
        { wch: 15 }, // Auto Reject CIBIL
        { wch: 12 }, // Max FOIR
        { wch: 18 }, // Max Loan Amount
        { wch: 15 }, // Min Tenure
        { wch: 15 }, // Max Tenure
        { wch: 18 }, // Base Interest Rate
        { wch: 15 }, // Fraud Threshold
      ];
      ws['!cols'] = wscols;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Loan Categories');

      // Generate filename with current date
      const date = new Date();
      const fileName = `loan_categories_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);

      setMessage({ 
        type: "success", 
        text: "✅ Excel file downloaded successfully" 
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);

    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "❌ Failed to download Excel file" 
      });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getCodeColor = (code) => {
    const colors = {
      personal: "bg-purple-100 text-purple-700 border-purple-200",
      salary_advance: "bg-green-100 text-green-700 border-green-200",
      working_capital: "bg-blue-100 text-blue-700 border-blue-200",
      lap: "bg-orange-100 text-orange-700 border-orange-200",
      gold: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return colors[code] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate filtered categories count for pagination info
  const filteredCount = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchTerm.toLowerCase())
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <Building className="w-8 h-8 text-blue-600" />
                Loan Categories Management
              </h1>
              <p className="text-slate-600 mt-2">
                Manage and configure loan categories for your lending platform
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleDownload}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition border border-slate-200 hover:bg-blue-50"
                title="Download Excel"
                disabled={categories.length === 0}
              >
                <Download className={`w-5 h-5 ${categories.length === 0 ? 'text-slate-400' : 'text-slate-600'}`} />
              </button>
              <button 
                onClick={fetchCategories}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition border border-slate-200 hover:bg-blue-50"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Categories</p>
                  <p className="text-2xl font-bold text-slate-800">{categories.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Tag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Interest Rate</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {categories.length > 0 
                      ? (categories.reduce((acc, cat) => acc + parseFloat(cat.base_interest_rate || 0), 0) / categories.length).toFixed(1) + '%'
                      : '0%'
                    }
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Percent className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Max Loan</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {categories.length > 0 
                      ? formatCurrency(categories.reduce((acc, cat) => acc + parseFloat(cat.max_loan_amount || 0), 0) / categories.length)
                      : formatCurrency(0)
                    }
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Min CIBIL Avg</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {categories.length > 0 
                      ? Math.round(categories.reduce((acc, cat) => acc + parseInt(cat.min_cibil || 0), 0) / categories.length)
                      : '0'
                    }
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' 
              ? <CheckCircle className="w-5 h-5" />
              : <AlertCircle className="w-5 h-5" />
            }
            <span className="font-medium">{message.text}</span>
            <button 
              onClick={() => setMessage({ type: "", text: "" })}
              className="ml-auto"
            >
              <XCircle className="w-5 h-5 opacity-50 hover:opacity-100" />
            </button>
          </div>
        )}

        {/* Create Category Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Create New Category
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid md:grid-cols-3 gap-5">

              <Input 
                name="name" 
                label="Category Name" 
                icon={<Tag className="w-4 h-4 text-slate-400" />}
                value={formData.name} 
                onChange={handleChange} 
                required 
                placeholder="e.g., Personal Loan"
              />
              
              <Select 
                name="code" 
                label="Category Code" 
                value={formData.code} 
                onChange={handleChange} 
                required 
              />

              <Input 
                name="min_income" 
                label="Min Income" 
                icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                value={formData.min_income} 
                onChange={handleChange} 
                placeholder="₹ 25,000"
              />
              
              <Input 
                name="min_cibil" 
                label="Min CIBIL Score" 
                icon={<TrendingUp className="w-4 h-4 text-slate-400" />}
                value={formData.min_cibil} 
                onChange={handleChange} 
                type="number"
              />
              
              <Input 
                name="auto_reject_cibil" 
                label="Auto Reject CIBIL" 
                icon={<XCircle className="w-4 h-4 text-slate-400" />}
                value={formData.auto_reject_cibil} 
                onChange={handleChange} 
                type="number"
              />
              
              <Input 
                name="max_foir" 
                label="Max FOIR (%)" 
                icon={<Percent className="w-4 h-4 text-slate-400" />}
                value={formData.max_foir} 
                onChange={handleChange} 
                type="number"
              />
              
              <Input 
                name="max_loan_amount" 
                label="Max Loan Amount" 
                icon={<DollarSign className="w-4 h-4 text-slate-400" />}
                value={formData.max_loan_amount} 
                onChange={handleChange} 
                placeholder="₹ 10,00,000"
              />
              
              <Input 
                name="min_tenure" 
                label="Min Tenure (Months)" 
                icon={<Calendar className="w-4 h-4 text-slate-400" />}
                value={formData.min_tenure} 
                onChange={handleChange} 
                type="number"
              />
              
              <Input 
                name="max_tenure" 
                label="Max Tenure (Months)" 
                icon={<Calendar className="w-4 h-4 text-slate-400" />}
                value={formData.max_tenure} 
                onChange={handleChange} 
                type="number"
              />
              
              <Input 
                name="base_interest_rate" 
                label="Base Interest Rate (%)" 
                icon={<Percent className="w-4 h-4 text-slate-400" />}
                value={formData.base_interest_rate} 
                onChange={handleChange} 
                type="number"
                step="0.1"
              />
              
              <Input 
                name="fraud_threshold" 
                label="Fraud Threshold" 
                icon={<Shield className="w-4 h-4 text-slate-400" />}
                value={formData.fraud_threshold} 
                onChange={handleChange} 
                type="number"
              />

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      Create Category
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>

        {/* Category Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Existing Categories
              </h2>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="pl-9 pr-4 py-2 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                />
              </div>
            </div>
          </div>

          {paginatedCategories.length === 0 ? (
            <div className="text-center py-16">
              <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">
                {searchTerm ? "No matching categories found" : "No categories found"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Min Income</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">CIBIL</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">FOIR</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Max Loan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Tenure</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Interest</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Fraud Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paginatedCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">{cat.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCodeColor(cat.code)}`}>
                            {cat.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{formatCurrency(cat.min_income)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700">{cat.min_cibil}</span>
                            <span className="text-xs text-slate-400">/ {cat.auto_reject_cibil}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-700">{cat.max_foir}%</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{formatCurrency(cat.max_loan_amount)}</td>
                        <td className="px-4 py-3">
                          <span className="text-slate-700">{cat.min_tenure} - {cat.max_tenure} M</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">
                            {cat.base_interest_rate}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  cat.fraud_threshold < 30 ? 'bg-green-500' :
                                  cat.fraud_threshold < 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${cat.fraud_threshold}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-slate-600">{cat.fraud_threshold}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="px-6 py-4 bg-white border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCount)} of {filteredCount} entries
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="border border-slate-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="First Page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Last Page"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

/* ---------- Enhanced Reusable Components ---------- */

function Input({ label, icon, ...props }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
            icon ? 'pl-9' : ''
          }`}
        />
      </div>
    </div>
  );
}

function Select({ label, ...props }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <select
        {...props}
        className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white"
      >
        <option value="">Select Category Code</option>
        <option value="personal">Personal Loan</option>
        <option value="salary_advance">Salary Advance</option>
        <option value="working_capital">Working Capital</option>
        <option value="lap">Loan Against Property</option>
        <option value="gold">Gold Loan</option>
      </select>
    </div>
  );
}