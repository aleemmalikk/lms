"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL, getAuthToken } from "../lib/api";

export default function LoanProductsPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentView, setCurrentView] = useState("add");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    min_amount: "",
    max_amount: "",
    min_tenure: "",
    max_tenure: "",
    interest_rate: "",
    processing_fee: "",
    is_suggestion_product: false,
  });

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    if (!formData.category) errors.category = "Category is required";
    if (!formData.name?.trim()) errors.name = "Product name is required";
    
    const minAmount = parseFloat(formData.min_amount);
    const maxAmount = parseFloat(formData.max_amount);
    
    if (formData.min_amount && (isNaN(minAmount) || minAmount < 0)) {
      errors.min_amount = "Please enter a valid minimum amount";
    }
    
    if (formData.max_amount && (isNaN(maxAmount) || maxAmount < 0)) {
      errors.max_amount = "Please enter a valid maximum amount";
    }
    
    if (minAmount && maxAmount && minAmount > maxAmount) {
      errors.max_amount = "Maximum amount must be greater than minimum amount";
    }
    
    const minTenure = parseInt(formData.min_tenure);
    const maxTenure = parseInt(formData.max_tenure);
    
    if (formData.min_tenure && (isNaN(minTenure) || minTenure < 1)) {
      errors.min_tenure = "Please enter a valid minimum tenure";
    }
    
    if (formData.max_tenure && (isNaN(maxTenure) || maxTenure < 1)) {
      errors.max_tenure = "Please enter a valid maximum tenure";
    }
    
    if (minTenure && maxTenure && minTenure > maxTenure) {
      errors.max_tenure = "Maximum tenure must be greater than minimum tenure";
    }
    
    const interestRate = parseFloat(formData.interest_rate);
    if (formData.interest_rate && (isNaN(interestRate) || interestRate < 0 || interestRate > 100)) {
      errors.interest_rate = "Please enter a valid interest rate (0-100)";
    }
    
    const processingFee = parseFloat(formData.processing_fee);
    if (formData.processing_fee && (isNaN(processingFee) || processingFee < 0)) {
      errors.processing_fee = "Please enter a valid processing fee";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error("No auth token found");
        return;
      }
      
      const res = await axios.get(`${BASE_URL}loan-categories/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setCategories(res.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Handle specific error cases
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        // Redirect to login if needed
      } else {
        alert("Failed to fetch categories. Please refresh the page.");
      }
    }
  };

  // Fetch Loan Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        throw new Error("No auth token found");
      }
      
      const res = await axios.get(`${BASE_URL}loan-products/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setProducts(res.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (currentView === "view") {
      fetchProducts();
    }
  }, [currentView]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      alert("Please fix the errors in the form before submitting.");
      return;
    }
    
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("No auth token found");
      }
      
      // Parse numeric values, handling empty strings
      const payload = {
        category: formData.category ? Number(formData.category) : null,
        name: formData.name?.trim(),
        min_amount: formData.min_amount ? Number(formData.min_amount) : 0,
        max_amount: formData.max_amount ? Number(formData.max_amount) : 0,
        min_tenure: formData.min_tenure ? Number(formData.min_tenure) : 0,
        max_tenure: formData.max_tenure ? Number(formData.max_tenure) : 0,
        interest_rate: formData.interest_rate ? Number(formData.interest_rate) : 0,
        processing_fee: formData.processing_fee ? Number(formData.processing_fee) : 0,
        is_suggestion_product: formData.is_suggestion_product || false,
      };
      
      // Remove null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === null) delete payload[key];
      });
      
      await axios.post(`${BASE_URL}loan-products/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      alert("✅ Loan Product Added Successfully!");
      
      // Reset form after successful submission
      setFormData({
        category: "",
        name: "",
        min_amount: "",
        max_amount: "",
        min_tenure: "",
        max_tenure: "",
        interest_rate: "",
        processing_fee: "",
        is_suggestion_product: false,
      });
      setFormErrors({});
      
    } catch (error) {
      console.error("Error adding product:", error);
      
      // Show specific error message if available
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          "Error adding loan product. Please try again.";
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely display category name
  const getCategoryName = (product) => {
    if (!product.category) return 'N/A';
    if (typeof product.category === 'object') return product.category.name || 'N/A';
    // If category is just an ID, find its name
    const category = categories.find(c => c.id === product.category);
    return category?.name || 'N/A';
  };

  // Render Add Product Form
  const renderAddProduct = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-6">
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-slate-100">
        <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
          Application Details
        </h2>
        <button
          onClick={() => setCurrentView("view")}
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-xl font-medium hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">📋</span>
          View Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              Loan Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none text-slate-700 ${
                  formErrors.category ? 'border-red-500' : 'border-slate-200'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
            {formErrors.category && (
              <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
            )}
          </div>

          {/* Loan Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              Loan Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Personal Loan"
              required
              className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 placeholder-slate-400 ${
                formErrors.name ? 'border-red-500' : 'border-slate-200'
              }`}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Min Amount */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Min Amount (₹)</label>
            <input
              type="number"
              name="min_amount"
              value={formData.min_amount}
              onChange={handleChange}
              placeholder="Min amount"
              min="0"
              step="1"
              className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 ${
                formErrors.min_amount ? 'border-red-500' : 'border-slate-200'
              }`}
            />
            {formErrors.min_amount && (
              <p className="text-red-500 text-xs mt-1">{formErrors.min_amount}</p>
            )}
          </div>

          {/* Max Amount */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Max Amount (₹)</label>
            <input
              type="number"
              name="max_amount"
              value={formData.max_amount}
              onChange={handleChange}
              placeholder="Max amount"
              min="0"
              step="1"
              className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 ${
                formErrors.max_amount ? 'border-red-500' : 'border-slate-200'
              }`}
            />
            {formErrors.max_amount && (
              <p className="text-red-500 text-xs mt-1">{formErrors.max_amount}</p>
            )}
          </div>

          {/* Min Tenure */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Min Tenure (months)</label>
            <input
              type="number"
              name="min_tenure"
              value={formData.min_tenure}
              onChange={handleChange}
              placeholder="Min months"
              min="1"
              step="1"
              className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 ${
                formErrors.min_tenure ? 'border-red-500' : 'border-slate-200'
              }`}
            />
            {formErrors.min_tenure && (
              <p className="text-red-500 text-xs mt-1">{formErrors.min_tenure}</p>
            )}
          </div>

          {/* Max Tenure */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Max Tenure (months)</label>
            <input
              type="number"
              name="max_tenure"
              value={formData.max_tenure}
              onChange={handleChange}
              placeholder="Max months"
              min="1"
              step="1"
              className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 ${
                formErrors.max_tenure ? 'border-red-500' : 'border-slate-200'
              }`}
            />
            {formErrors.max_tenure && (
              <p className="text-red-500 text-xs mt-1">{formErrors.max_tenure}</p>
            )}
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              name="interest_rate"
              value={formData.interest_rate}
              onChange={handleChange}
              placeholder="e.g., 10.5"
              min="0"
              max="100"
              className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 ${
                formErrors.interest_rate ? 'border-red-500' : 'border-slate-200'
              }`}
            />
            {formErrors.interest_rate && (
              <p className="text-red-500 text-xs mt-1">{formErrors.interest_rate}</p>
            )}
          </div>

          {/* Processing Fee */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Processing Fee (₹)</label>
            <input
              type="number"
              name="processing_fee"
              value={formData.processing_fee}
              onChange={handleChange}
              placeholder="Processing fee"
              min="0"
              step="1"
              className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-700 ${
                formErrors.processing_fee ? 'border-red-500' : 'border-slate-200'
              }`}
            />
            {formErrors.processing_fee && (
              <p className="text-red-500 text-xs mt-1">{formErrors.processing_fee}</p>
            )}
          </div>
        </div>

        {/* Checkbox */}
        <div className="bg-slate-50 p-4 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_suggestion_product" 
              checked={formData.is_suggestion_product}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 rounded-lg border-2 border-slate-300 focus:ring-indigo-500 focus:ring-2"
            />
            <span className="text-slate-700">
              <span className="font-semibold">Common Loan Product</span> 
              <span className="text-sm text-slate-500 ml-2">(Featured/Suggested product)</span>
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-lg ${
            loading 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Product...
            </>
          ) : (
            <>
              <span className="text-xl">➕</span>
              Add Loan Product
            </>
          )}
        </button>
      </form>
    </div>
  );

  // Render View Products
  const renderViewProducts = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 animate-slideIn">
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView("add")}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <span className="text-2xl">←</span>
            <span className="font-medium">Back to Add Product</span>
          </button>
        </div>
        <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
          {products.length} {products.length === 1 ? 'Product' : 'Products'}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-7xl mb-4 opacity-30">📭</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Products Found</h3>
          <p className="text-slate-500 mb-6">Start by adding your first loan product</p>
          <button
            onClick={() => setCurrentView("add")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Add New Product
          </button>
        </div>
      ) : (
       <div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="bg-slate-50">
        <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Name</th>

        <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>

        <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Min Amount (₹)</th>

        <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Max Amount (₹)</th>

        <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Min Tenure</th>

        <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Max Tenure</th>

        <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Interest Rate</th>

        <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Processing Fee</th>

        <th className="px-4 py-3 whitespace-nowrap text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Common</th>
      </tr>
    </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 font-medium text-slate-800">{p.name || 'N/A'}</td>
                  <td className="px-4 py-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                      {getCategoryName(p)}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-slate-600">
                    {p.min_amount ? `₹${p.min_amount.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-4 py-4 font-mono text-slate-600">
                    {p.max_amount ? `₹${p.max_amount.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {p.min_tenure ? `${p.min_tenure} months` : 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {p.max_tenure ? `${p.max_tenure} months` : 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-purple-600 font-bold">
                    {p.interest_rate ? `${p.interest_rate}%` : 'N/A'}
                  </td>
                  <td className="px-4 py-4 font-mono text-slate-600">
                    {p.processing_fee ? `₹${p.processing_fee.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-4 py-4">
                    {p.is_suggestion_product ? (
                      <span className="bg-amber-100 text-amber-700 px-3 py-2 rounded-full text-xs font-medium">
                        Common 
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-5 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center gap-3">
              <span className="text-4xl">💰</span> 
              Loan Application
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              {currentView === "add" 
                ? "Create a new loan product for your customers" 
                : "View and manage all loan products"}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-6">
          {currentView === "add" ? renderAddProduct() : renderViewProducts()}
        </div>
      </div>

      {/* Custom Animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}