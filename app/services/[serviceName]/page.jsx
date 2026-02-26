"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";
import { BASE_URL } from "../../lib/api";

export default function SubservicesPage() {
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
        
        const categoryResponse = await axios.get(
          `${BASE_URL}categories/${categoryId}/`
        );

        const selectedCategory = categoryResponse.data;
        setCategory(selectedCategory);

        if (selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
          setSubcategories(selectedCategory.subcategories);
        } else {
          setSubcategories([]);
        }

      } catch (err) {
        console.error("Error fetching category data:", err);
        setError("Failed to load services");
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryData();
  }, [categoryId]);

  const getSubcategoryImage = (subcategory) => {
    if (subcategory.image) {
      return (
        <img 
          src={subcategory.image} 
          alt={subcategory.name}
          className="w-16 h-16 object-cover rounded-lg"
          onError={(e) => {
            e.target.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className =
              "w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg";
            fallback.textContent = subcategory.name.charAt(0);
            e.target.parentNode.appendChild(fallback);
          }}
        />
      );
    }
    
    return (
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
        {subcategory.name.charAt(0)}
      </div>
    );
  };

  const handleSubcategoryClick = (subcategoryId, subcategoryName) => {
    console.log("Clicked subcategory ID:", subcategoryId, "Name:", subcategoryName);
    
     switch (subcategoryId) {
      case 22:
        router.push(`/prepaid-recharge?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 23:
        router.push(`/postpaid-recharge?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 24:
        router.push(`/d-threcharge?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 25:
        router.push(`/cable-recharge?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 26:
        router.push(`/Electricitybillpayment?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 29:
        router.push(`/waterbill?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 28:
        router.push(`/gasbill?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 27:
        router.push(`/broadbandbill?name=${encodeURIComponent(subcategoryName)}`);
        break;
         case 41:
        router.push(`/insurencepremium?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 42:
        router.push(`/loanemipayment?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 43:
        router.push(`/fastag?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 32:
        router.push(`/creditcard?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 36:
        router.push(`/Municipletaxpayment?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 33:
        router.push(`/Societymaintenancepayment?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 65:
        router.push(`/Trafficchallanpayment?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 34:
        router.push(`/ottsubscriptionpayment?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 35:
        router.push(`/educationfeepayment?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 5:
        router.push(`/dmt?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 2:
        router.push(`/recharge?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 3:
        router.push(`/dth---recharge?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 46:
        router.push(`/homeloan?name=${encodeURIComponent(subcategoryName)}`);
        break;
      case 48:
        router.push(`/personalloan?name=${encodeURIComponent(subcategoryName)}`);
        break;
        case 49:
        router.push(`/Businessloan?name=${encodeURIComponent(subcategoryName)}`);
        break;
       case 51:
        router.push(`/educationloan?name=${encodeURIComponent(subcategoryName)}`);
        break;
        case 62:
        router.push(`/carloan?name=${encodeURIComponent(subcategoryName)}`);
        break;
         case 64:
        router.push(`/goldloan?name=${encodeURIComponent(subcategoryName)}`);
        break;
         case 63:
        router.push(`/instantloan?name=${encodeURIComponent(subcategoryName)}`);
        break;
      default:
        router.push(`/generic-form?subcategory=${subcategoryId}&name=${encodeURIComponent(subcategoryName)}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
          <FaSpinner className="animate-spin text-4xl text-grey-600 mb-4" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center max-w-md w-full">
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-grey-600 to-grey-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl w-full justify-center"
          >
            <FaArrowLeft />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {category?.name || "Services"}
        </h1>
        {category?.description && (
          <p className="text-gray-600 text-lg">{category.description}</p>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {subcategories.length > 0 ? (
          subcategories.map((subcategory) => (
            <div
              key={subcategory.id}
              className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border border-gray-400 overflow-hidden p-4"
            >
              <div className="h-2 w-full"></div>
              
              <div className="">
                <div className="flex justify-center my-4 md:my-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                      {getSubcategoryImage(subcategory)}
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-bold text-center text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {subcategory.name}
                </h3>

                {subcategory.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {subcategory.description}
                  </p>
                )}

                {/* <div className="text-xs text-gray-500 mb-2 text-center">
                  ID: {subcategory.id}
                </div> */}

                <button
                  onClick={() => handleSubcategoryClick(subcategory.id, subcategory.name)}
                  className="w-full py-1.5 text-sm bg-[#545b63] text-white rounded-lg font-semibold hover:bg-[BFC0C1] transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <p className="text-gray-500 text-lg mb-4">No services available</p>
              <p className="text-gray-400 text-sm">
                There are no services available at the moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}














