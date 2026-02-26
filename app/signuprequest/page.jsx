"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from "@/app/lib/api";
import { 
  FaSearch, 
  FaSync, 
  FaFilter, 
  FaTimes, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaIdCard, 
  FaCalendar,
  FaEye,
  FaCheck,
  FaTimesCircle,
  FaUsers,
  FaChartLine,
  FaTrash,
  FaExclamationTriangle,
  FaBars,
  FaEllipsisV,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

function SignUpRequestData() {
  const [signupRequests, setSignupRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    admin: false,
    superadmin: false,
    master: false,
    dealer: false,
    retailer: false
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  
  // User role state
  const [userRole, setUserRole] = useState(null);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Check user role on component mount
  useEffect(() => {
    const checkUserRole = () => {
      const role = localStorage.getItem('userRole');
      setUserRole(role);
    };
    
    checkUserRole();
  }, []);

  const fetchSignupRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}singup-request/`);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();

      const requestsArray = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : Array.isArray(data.data)
        ? data.data
        : [];

      setSignupRequests(requestsArray);
      setFilteredRequests(requestsArray);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching signup requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignupRequests();
  }, []);

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = signupRequests;

    if (debouncedSearchTerm.trim() !== '') {
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(request => {
        return (
          (request.first_name?.toLowerCase().includes(searchLower)) ||
          (request.last_name?.toLowerCase().includes(searchLower)) ||
          (request.email?.toLowerCase().includes(searchLower)) ||
          (request.mobile?.includes(debouncedSearchTerm)) ||
          (request.pan_no?.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply role filters
    const activeFilters = Object.entries(filters).filter(([_, isActive]) => isActive);
    
    if (activeFilters.length > 0) {
      filtered = filtered.filter(request => {
        return activeFilters.some(([role]) => request[role] === true);
      });
    }

    return filtered;
  }, [signupRequests, debouncedSearchTerm, filters]);

  // Update filtered requests when dependencies change
  useEffect(() => {
    if (signupRequests.length > 0) {
      const filtered = applyFiltersAndSearch();
      setFilteredRequests(filtered);
    }
  }, [signupRequests, applyFiltersAndSearch]);

  // Handle filter change
  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      admin: false,
      superadmin: false,
      master: false,
      dealer: false,
      retailer: false
    });
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setShowMobileFilters(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get active filter count
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Stats calculation
  const totalRequests = signupRequests.length;
  const pendingRequests = signupRequests.length;
  const todayRequests = signupRequests.filter(request => {
    const today = new Date().toDateString();
    const requestDate = new Date(request.created_at).toDateString();
    return today === requestDate;
  }).length;

  const showRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const getAuthToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  };

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: 'approve' }));
      
      const authToken = getAuthToken();
      
      const response = await fetch(`${BASE_URL}signup-request/${requestId}/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          approved: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve request');
      }

      const result = await response.json();
      
      setSignupRequests(prev => prev.filter(request => request.id !== requestId));
      alert(`Request approved successfully!`);
      fetchSignupRequests();
      
    } catch (error) {
      console.error('Error approving request:', error);
      alert(`Failed to approve request: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: null }));
      setShowDetailsModal(false);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: 'reject' }));
      
      const authToken = getAuthToken();
      
      const response = await fetch(`${BASE_URL}signup-request/${requestId}/reject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          rejected: true,
          rejection_reason: "Request rejected by administrator"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject request');
      }

      const result = await response.json();
      
      setSignupRequests(prev => prev.filter(request => request.id !== requestId));
      alert(`Request rejected successfully!`);
      fetchSignupRequests();
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(`Failed to reject request: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: null }));
      setShowDetailsModal(false);
    }
  };

  // Delete request functionality
  const handleDeleteClick = (request) => {
    setRequestToDelete(request);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return;

    setDeleteLoading(true);
    try {
      const authToken = getAuthToken();
      
      const response = await fetch(`${BASE_URL}signup-request/${requestToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      });

      if (response.ok) {
        setSignupRequests(prev => prev.filter(request => request.id !== requestToDelete.id));
        setShowDeleteModal(false);
        setRequestToDelete(null);
        alert(`Request from ${requestToDelete.email} has been deleted successfully!`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert(`Failed to delete request: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setRequestToDelete(null);
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Admin',
      superadmin: 'Super Admin',
      master: 'Master',
      dealer: 'Dealer',
      retailer: 'Retailer'
    };
    return roleNames[role] || role;
  };

  // Check if user has full access
  const hasFullAccess = () => {
    return userRole !== 'master' && userRole !== 'dealer';
  };

  // Check if user can view only
  const isViewOnlyUser = () => {
    return userRole === 'master' || userRole === 'dealer';
  };

  // Toggle row expansion on mobile
  const toggleRowExpand = (requestId) => {
    if (expandedRow === requestId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(requestId);
    }
  };

  // Mobile filter toggle
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl text-gray-600">Loading signup requests...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimesCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <h3 className="text-red-600 text-lg sm:text-xl mb-4">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchSignupRequests}
            className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
          >
            <FaSync className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 mb-4 lg:mb-0">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
                <FaUsers className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Sign Up Requests</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage and review user registration requests</p>
                {isViewOnlyUser() && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      <FaEye className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                      View Only Mode
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2 sm:space-x-3">
              {hasFullAccess() && (
                <>
                  {isMobile && (
                    <button 
                      onClick={toggleMobileFilters}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg border border-gray-200 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md text-sm"
                    >
                      <FaFilter className="w-4 h-4" />
                      Filters
                    </button>
                  )}
                  <button 
                    onClick={fetchSignupRequests}
                    className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg sm:rounded-xl border border-gray-200 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md text-sm sm:text-base"
                  >
                    <FaSync className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8"
        >
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{totalRequests}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                <FaUsers className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{pendingRequests}</p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg sm:rounded-xl">
                <FaFilter className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Requests</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{todayRequests}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl">
                <FaChartLine className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Section - Only for users with full access */}
        {hasFullAccess() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6"
          >
            {/* Search Input */}
            <div className="mb-4 sm:mb-6">
              <label htmlFor="search" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Search Requests {debouncedSearchTerm && <span className="text-blue-500 text-xs">(Searching...)</span>}
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name, email, mobile, or PAN..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-9 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            {isMobile && (
              <button
                onClick={toggleMobileFilters}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FaFilter className="w-4 h-4" />
                  Filters ({activeFilterCount} active)
                </span>
                {showMobileFilters ? (
                  <FaChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <FaChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}

            {/* Role Filters - Conditionally rendered for mobile */}
            <div className={`${isMobile && !showMobileFilters ? 'hidden' : ''}`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-2">
                    <FaFilter className="w-3 h-3 sm:w-4 sm:h-4" />
                    Filter by Role:
                  </span>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {Object.entries(filters).map(([role, isActive]) => (
                      <motion.button
                        key={role}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleFilterChange(role)}
                        className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-200 text-xs sm:text-sm font-medium capitalize flex items-center gap-1 sm:gap-2 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600 shadow-sm'
                        }`}
                      >
                        {getRoleDisplayName(role)}
                        {isActive && <FaTimes className="w-2 h-2 sm:w-3 sm:h-3" />}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {(activeFilterCount > 0 || searchTerm) && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg sm:rounded-xl transition-all duration-200 text-xs sm:text-sm font-medium whitespace-nowrap flex items-center gap-1 sm:gap-2 shadow-lg"
                  >
                    <FaTimes className="w-2 h-2 sm:w-3 sm:h-3" />
                    Clear All
                  </motion.button>
                )}
              </div>

              {/* Active Filters Display */}
              {(activeFilterCount > 0 || debouncedSearchTerm) && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs sm:text-sm text-blue-800 flex flex-wrap gap-1">
                    <strong className="mr-2">Active Filters:</strong>
                    {debouncedSearchTerm && (
                      <span className="bg-blue-100 px-2 py-1 rounded">Search: "{debouncedSearchTerm}"</span>
                    )}
                    {Object.entries(filters)
                      .filter(([_, isActive]) => isActive)
                      .map(([role]) => (
                        <span key={role} className="bg-blue-100 px-2 py-1 rounded">
                          {getRoleDisplayName(role)}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6"
        >
          <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0">
            Showing <span className="font-semibold text-gray-900">{filteredRequests.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{signupRequests.length}</span> requests
          </div>
          
          {hasFullAccess() && (activeFilterCount > 0 || debouncedSearchTerm) && (
            <div className="text-xs sm:text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
              {debouncedSearchTerm && ' + search'}
            </div>
          )}
        </motion.div>

        {/* Requests Table/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 sm:py-12 md:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FaUsers className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No requests found</h3>
              <p className="text-gray-600 max-w-xs sm:max-w-sm mx-auto mb-4 sm:mb-6 px-4 text-sm sm:text-base">
                {debouncedSearchTerm || activeFilterCount > 0 
                  ? "No signup requests match your search criteria. Try adjusting your filters."
                  : "No signup requests available at the moment. Check back later for new requests."
                }
              </p>
              {hasFullAccess() && (debouncedSearchTerm || activeFilterCount > 0) && (
                <button 
                  onClick={clearFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base"
                >
                  Clear Search & Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              {!isMobile && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          User Details
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Roles
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredRequests.map((request, index) => (
                        <motion.tr
                          key={request.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg mr-3 sm:mr-4 shadow-lg">
                                {request.first_name?.charAt(0) || request.email?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {request.first_name || request.last_name 
                                    ? `${request.first_name || ''} ${request.last_name || ''}`.trim()
                                    : 'Anonymous User'
                                  }
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <FaIdCard className="w-3 h-3" />
                                  ID: {request.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-900">
                                <FaEnvelope className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                                {request.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 font-mono">
                                <FaPhone className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                                {request.mobile}
                              </div>
                              {request.pan_no && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <FaIdCard className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                                  {request.pan_no}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {request.admin && (
                                <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  Admin
                                </span>
                              )}
                              {request.superadmin && (
                                <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                  Super Admin
                                </span>
                              )}
                              {request.master && (
                                <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                  Master
                                </span>
                              )}
                              {request.dealer && (
                                <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                  Dealer
                                </span>
                              )}
                              {request.retailer && (
                                <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                  Retailer
                                </span>
                              )}
                              {!request.admin && !request.superadmin && !request.master && 
                               !request.dealer && !request.retailer && (
                                <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                  No Role
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center gap-2">
                              <FaCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              {formatDate(request.created_at)}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-1 sm:space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => showRequestDetails(request)}
                                className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-lg hover:bg-blue-50 border border-blue-200"
                                title="View Details"
                              >
                                <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                              
                              {/* Approve Button - Only for full access users */}
                              {hasFullAccess() && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleApprove(request.id)}
                                  disabled={actionLoading[request.id]}
                                  className="p-1.5 sm:p-2 text-green-600 hover:text-green-800 transition-colors rounded-lg hover:bg-green-50 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Approve Request"
                                >
                                  {actionLoading[request.id] === 'approve' ? (
                                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-green-600"></div>
                                  ) : (
                                    <FaCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                                  )}
                                </motion.button>
                              )}
                              
                              {/* Reject Button - Only for full access users */}
                              {hasFullAccess() && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleReject(request.id)}
                                  disabled={actionLoading[request.id]}
                                  className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 transition-colors rounded-lg hover:bg-red-50 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Reject Request"
                                >
                                  {actionLoading[request.id] === 'reject' ? (
                                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-red-600"></div>
                                  ) : (
                                    <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
                                  )}
                                </motion.button>
                              )}
                              
                              {/* Delete Button - Only for full access users */}
                              {hasFullAccess() && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDeleteClick(request)}
                                  disabled={actionLoading[request.id]}
                                  className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 transition-colors rounded-lg hover:bg-red-50 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete Request"
                                >
                                  <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Mobile Card View */}
              {isMobile && (
                <div className="p-2">
                  {filteredRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="mb-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-base mt-1">
                            {request.first_name?.charAt(0) || request.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {request.first_name || request.last_name 
                                ? `${request.first_name || ''} ${request.last_name || ''}`.trim()
                                : 'Anonymous User'
                              }
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <FaEnvelope className="w-3 h-3 text-blue-500" />
                              <p className="text-xs text-gray-600 truncate">{request.email}</p>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <FaPhone className="w-3 h-3 text-green-500" />
                              <p className="text-xs text-gray-600 font-mono">{request.mobile}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleRowExpand(request.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          {expandedRow === request.id ? (
                            <FaChevronUp className="w-4 h-4" />
                          ) : (
                            <FaChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Collapsible Content */}
                      <AnimatePresence>
                        {expandedRow === request.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                              {/* PAN Number */}
                              {request.pan_no && (
                                <div className="flex items-center gap-2">
                                  <FaIdCard className="w-3 h-3 text-orange-500" />
                                  <span className="text-xs text-gray-600">PAN: {request.pan_no}</span>
                                </div>
                              )}

                              {/* Roles */}
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Roles:</p>
                                <div className="flex flex-wrap gap-1">
                                  {request.admin && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Admin
                                    </span>
                                  )}
                                  {request.superadmin && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      Super Admin
                                    </span>
                                  )}
                                  {request.master && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Master
                                    </span>
                                  )}
                                  {request.dealer && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Dealer
                                    </span>
                                  )}
                                  {request.retailer && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                      Retailer
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Date */}
                              <div className="flex items-center gap-2">
                                <FaCalendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{formatDate(request.created_at)}</span>
                              </div>

                              {/* Actions */}
                              <div className="flex justify-between pt-3 border-t border-gray-100">
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => showRequestDetails(request)}
                                  className="px-3 py-1.5 text-blue-600 hover:text-blue-800 transition-colors rounded-lg hover:bg-blue-50 border border-blue-200 text-xs flex items-center gap-1"
                                >
                                  <FaEye className="w-3 h-3" />
                                  View
                                </motion.button>
                                
                                <div className="flex space-x-1">
                                  {hasFullAccess() && (
                                    <>
                                      <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleApprove(request.id)}
                                        disabled={actionLoading[request.id]}
                                        className="px-2 py-1.5 text-green-600 hover:text-green-800 transition-colors rounded-lg hover:bg-green-50 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Approve"
                                      >
                                        {actionLoading[request.id] === 'approve' ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                                        ) : (
                                          <FaCheck className="w-3 h-3" />
                                        )}
                                      </motion.button>
                                      
                                      <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleReject(request.id)}
                                        disabled={actionLoading[request.id]}
                                        className="px-2 py-1.5 text-red-600 hover:text-red-800 transition-colors rounded-lg hover:bg-red-50 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Reject"
                                      >
                                        {actionLoading[request.id] === 'reject' ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                        ) : (
                                          <FaTimes className="w-3 h-3" />
                                        )}
                                      </motion.button>
                                      
                                      <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDeleteClick(request)}
                                        disabled={actionLoading[request.id]}
                                        className="px-2 py-1.5 text-red-600 hover:text-red-800 transition-colors rounded-lg hover:bg-red-50 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Delete"
                                      >
                                        <FaTrash className="w-3 h-3" />
                                      </motion.button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Request Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
              onClick={() => setShowDetailsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-full sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Request Details</h3>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-400">Full Name</label>
                          <p className="text-sm text-gray-900">
                            {selectedRequest.first_name || selectedRequest.last_name 
                              ? `${selectedRequest.first_name || ''} ${selectedRequest.last_name || ''}`.trim()
                              : 'Not provided'
                            }
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Email</label>
                          <p className="text-sm text-gray-900">{selectedRequest.email}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Mobile</label>
                          <p className="text-sm text-gray-900 font-mono">{selectedRequest.mobile}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-400">PAN Number</label>
                          <p className="text-sm text-gray-900">
                            {selectedRequest.pan_no || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Requested Roles</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedRequest.admin && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Admin</span>}
                            {selectedRequest.superadmin && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Super Admin</span>}
                            {selectedRequest.master && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Master</span>}
                            {selectedRequest.dealer && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Dealer</span>}
                            {selectedRequest.retailer && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Retailer</span>}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Submitted On</label>
                          <p className="text-sm text-gray-900">{formatDate(selectedRequest.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Only show for full access users */}
                  {hasFullAccess() && (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
                      <button
                        onClick={() => handleApprove(selectedRequest.id)}
                        disabled={actionLoading[selectedRequest.id]}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {actionLoading[selectedRequest.id] === 'approve' ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                            Approving...
                          </>
                        ) : (
                          <>
                            <FaCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                            Approve Request
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(selectedRequest.id)}
                        disabled={actionLoading[selectedRequest.id]}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {actionLoading[selectedRequest.id] === 'reject' ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
                            Reject Request
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(selectedRequest)}
                        disabled={actionLoading[selectedRequest.id]}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                        Delete Request
                      </button>
                    </div>
                  )}
                  
                  {/* For view-only users */}
                  {isViewOnlyUser() && (
                    <div className="pt-4 sm:pt-6 border-t border-gray-200">
                      <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <FaEye className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mx-auto mb-2" />
                        <p className="text-yellow-800 font-medium text-sm sm:text-base">View Only Mode</p>
                        <p className="text-yellow-600 text-xs sm:text-sm mt-1">You have view-only access. Contact administrator for actions.</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal - Only for full access users */}
        <AnimatePresence>
          {showDeleteModal && requestToDelete && hasFullAccess() && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={handleDeleteCancel}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-full sm:max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FaExclamationTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Delete Request</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">This action cannot be undone</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <p className="text-gray-700 text-sm sm:text-base mb-4">
                    Are you sure you want to delete the signup request from{' '}
                    <strong>{requestToDelete.email}</strong>?
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={handleDeleteCancel}
                      disabled={deleteLoading}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      disabled={deleteLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {deleteLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SignUpRequestData;