"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaSpinner, FaExclamationTriangle, FaThLarge } from "react-icons/fa";
import Link from "next/link";
import { getSubCategoriesWithPermissions, getAuthToken, BASE_URL } from "../lib/api";

export default function ServicesContent() {
  const [subcategories, setSubcategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get("category");

  useEffect(() => {
    async function fetchCategoryData() {
      if (!categoryId) {
        setError("No category selected");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const token = getAuthToken();
        
        // Fetch category details
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

        const selectedCategory = await categoryResponse.json();
        console.log("✅ Category API Response:", selectedCategory);
        
        // Check if category is active
        if (!selectedCategory.is_active) {
          setError("This category is currently inactive");
          setCategory(null);
          setSubcategories([]);
          setLoading(false);
          return;
        }
        
        setCategory(selectedCategory);

        // Fetch subcategories with permissions
        const subcategoriesData = await getSubCategoriesWithPermissions(token, categoryId);
        console.log("✅ Subcategories with permissions:", subcategoriesData);
        
        // Additional filtering for safety - only active subcategories
        const accessibleSubcategories = subcategoriesData.filter(sub => {
          const isAccessible = sub.is_active === true;
          console.log(`🔍 Final Check - ${sub.name}:`, { 
            is_active: sub.is_active,
            isAccessible 
          });
          return isAccessible;
        });
        
        console.log("✅ Final Accessible Subcategories:", accessibleSubcategories);
        setSubcategories(accessibleSubcategories);

      } catch (err) {
        console.error("❌ Error fetching category data:", err);
        setError(err.response?.data?.message || "Failed to load category");
        setSubcategories([]); // Empty array on error
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryData();
  }, [categoryId]);

  // Handle subcategory click with permission check
  const handleSubcategoryClick = (subcategory) => {
    console.log(`🖱️ Clicked on ${subcategory.name}:`, {
      is_active: subcategory.is_active
    });
    
    if (!subcategory.is_active) {
      alert("This service is currently inactive. Please contact administrator.");
      return;
    }
    
    router.push(`/forms?subcategory=${subcategory.id}&name=${encodeURIComponent(subcategory.name)}`);
  };

  // Check if user can access subcategory
  const canAccessSubcategory = (subcategory) => {
    const canAccess = subcategory.is_active === true;
    console.log(`🔐 Access Check for ${subcategory.name}:`, { 
      is_active: subcategory.is_active,
      canAccess 
    });
    return canAccess;
  };

  // Rest of your component remains the same...
  if (loading) {
    return (
      <div className="ml-64 p-8 flex flex-col items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-64 p-8 flex flex-col items-center justify-center min-h-screen">
        <FaExclamationTriangle className="text-4xl text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Error</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FaArrowLeft />
          Back to Home
        </Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="ml-64 p-8 flex flex-col items-center justify-center min-h-screen">
        <FaExclamationTriangle className="text-4xl text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Category Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">The selected category could not be found or is inactive.</p>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FaArrowLeft />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8 bg-gray-50 dark:bg-gray-800 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
        >
          <FaArrowLeft />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FaThLarge className="text-blue-600 dark:text-blue-400 text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {category.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  category.is_active
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {category.is_active ? "Active" : "Inactive"}
              </span>
              <span className="text-sm text-gray-500">
                {subcategories.length} services available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Available Services ({subcategories.length})
        </h2>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subcategories.length > 0 ? (
            subcategories.map((subcategory) => (
              <div
                key={subcategory.id}
                onClick={() => handleSubcategoryClick(subcategory)}
                className={`bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 cursor-pointer transition-all duration-300 border ${
                  canAccessSubcategory(subcategory)
                    ? "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg group"
                    : "border-gray-100 dark:border-gray-600 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`text-lg font-semibold ${
                      canAccessSubcategory(subcategory)
                        ? "text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {subcategory.name}
                    </h3>
                    
                    {/* Status Badge */}
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subcategory.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {subcategory.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  
                  {subcategory.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-3">
                      {subcategory.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      ID: {subcategory.id}
                    </span>
                    
                    {canAccessSubcategory(subcategory) ? (
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        View Services →
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-white dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
              <FaExclamationTriangle className="text-5xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-3">
                No Services Available
              </h3>
              <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto">
                {category ? 
                  `There are no active services available in the "${category.name}" category.` :
                  "No category selected or category not found."
                }
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaArrowLeft />
                Browse Other Categories
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Category Information */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 text-lg">
            Category Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Category ID:</span>
              <p className="text-gray-800 dark:text-gray-200 font-medium">{category.id}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Category Name:</span>
              <p className="text-gray-800 dark:text-gray-200 font-medium">{category.name}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  category.is_active
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {category.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Services Count:</span>
              <p className="text-gray-800 dark:text-gray-200 font-medium">{subcategories.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}