"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getSubCategoriesWithPermissions, getAuthToken } from "@/lib/api";
import { FaArrowLeft, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { BASE_URL } from "../lib/api";


export default function SubServices() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get("category");
  
  const [subServices, setSubServices] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSubServices() {
      if (!categoryId) {
        setError("No category selected");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const token = getAuthToken();
        
        // Fetch category details first
        const categoryResponse = await fetch(
          `${BASE_URL}categories/${categoryId}/`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!categoryResponse.ok) {
          throw new Error(`Failed to fetch category: ${categoryResponse.status}`);
        }

        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        // Fetch subcategories with permissions
        const data = await getSubCategoriesWithPermissions(token, categoryId);
        
        console.log("🔍 Raw Subservices API Response:", data);
        
        // Apply the same filtering logic as in the first useEffect
        const accessibleSubServices = data.filter(sub => {
          const isActive = sub.is_active !== false;
          const canView = sub.can_view !== false;
          const canUse = sub.can_use !== false;
          
          console.log(`🔍 Filtering ${sub.name}:`, { 
            id: sub.id, 
            isActive, 
            canView, 
            canUse,
            shouldShow: isActive && canView && canUse
          });
          
          return isActive && canView && canUse;
        });
        
        console.log("✅ Final Accessible Subservices:", accessibleSubServices);
        setSubServices(accessibleSubServices);
        
      } catch (err) {
        console.error("Subservices Error:", err);
        // Apply consistent error handling like the first useEffect
        setError(err.response?.data?.message || "Failed to load services");
        
        // Set fallback empty state on error (similar to first useEffect pattern)
        setSubServices([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSubServices();
  }, [categoryId]);

  // Consistent permission check function
  const canAccessSubService = (subService) => {
    return subService.can_use && subService.is_active;
  };

  const handleSubServiceClick = (subService) => {
    if (!canAccessSubService(subService)) {
      alert("You don't have permission to use this service or it's currently inactive.");
      return;
    }
    
    // Navigate to the form with subcategory details
    router.push(`/forms?subcategory=${subService.id}&name=${encodeURIComponent(subService.name)}`);
  };

  // Loading state - consistent with your pattern
  if (loading) {
    return (
      <div className="ml-64 p-8 flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  // Error state - consistent with your pattern
  if (error) {
    return (
      <div className="ml-64 p-8 flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center max-w-md w-full">
          <FaExclamationTriangle className="text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl w-full justify-center"
          >
            <FaArrowLeft />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // No category found state
  if (!category) {
    return (
      <div className="ml-64 p-8 flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center max-w-md w-full">
          <FaExclamationTriangle className="text-4xl text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Category Not Found</h2>
          <p className="text-gray-600 text-center mb-6">The selected category could not be found.</p>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl w-full justify-center"
          >
            <FaArrowLeft />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <FaArrowLeft />
          Back to Home
        </Link>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {category?.name || "Services"} - Sub Services
          </h1>
          {category?.description && (
            <p className="text-gray-600 text-lg">{category.description}</p>
          )}
        </div>
      </div>

      {/* Sub Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {subServices.length > 0 ? (
          subServices.map((sub) => (
            <div
              key={sub.id}
              onClick={() => handleSubServiceClick(sub)}
              className={`group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border border-gray-100 overflow-hidden p-6 ${
                !canAccessSubService(sub) ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col items-center text-center h-full">
                {/* Service Icon/Image */}
                <div className="mb-4">
                  {sub.image ? (
                    <img 
                      src={sub.image} 
                      alt={sub.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = "w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg";
                        fallback.textContent = sub.name.charAt(0);
                        e.target.parentNode.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {sub.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Service Name */}
                <h3 className={`text-lg font-bold mb-2 line-clamp-2 transition-colors ${
                  canAccessSubService(sub) 
                    ? "text-gray-800 group-hover:text-blue-600" 
                    : "text-gray-500"
                }`}>
                  {sub.name}
                </h3>

                {/* Service Description */}
                {sub.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {sub.description}
                  </p>
                )}

                {/* Status Badge */}
                <div className="flex gap-2 mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sub.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {sub.is_active ? "Active" : "Inactive"}
                  </span>
                  
                  {!sub.can_use && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      No Access
                    </span>
                  )}
                </div>

                {/* Apply Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubServiceClick(sub);
                  }}
                  disabled={!canAccessSubService(sub)}
                  className={`w-full py-3 text-sm font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                    canAccessSubService(sub)
                      ? "bg-[#11998E] text-white hover:bg-[#0f867f]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {canAccessSubService(sub) ? "Apply Now" : "No Permission"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <FaExclamationTriangle className="text-5xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-3">
                No Services Available
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {category 
                  ? `There are no accessible services in "${category.name}" for your account.`
                  : "No services found for this category."
                }
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaArrowLeft />
                Back to Categories
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Category Info Footer */}
      {category && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-4 text-lg">
              Category Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>
                <p className="text-gray-800 font-medium">{category.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Services Count:</span>
                <p className="text-gray-800 font-medium">{subServices.length} available</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    category.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {category.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Category ID:</span>
                <p className="text-gray-800 font-medium">{category.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}