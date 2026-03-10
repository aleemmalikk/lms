"use client";

import { useEffect, useState } from "react";
import {
  IndianRupee,
  Percent,
  Clock,
  Building2,
  Tag,
} from "lucide-react";

import { isAuthenticated, getWithAuth, BASE_URL } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const loggedIn = isAuthenticated();
  const [loanProducts, setLoanProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch loan products with authentication
  useEffect(() => {
    const fetchLoanProducts = async () => {
      try {
        setLoading(true);
        let data;
        
        if (loggedIn) {
          // Use authenticated request for logged-in users
          data = await getWithAuth("loan-products/");
        } else {
          // Public endpoint for non-logged in users
          const response = await fetch(`${BASE_URL}loan-products/`);
          if (!response.ok) {
            throw new Error('Failed to fetch loan products');
          }
          data = await response.json();
        }
        
        setLoanProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching loan products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanProducts();
  }, [loggedIn]);

  return (
    <div
      className={`min-h-screen transition-all
      ${loggedIn ? "p-4 md:p-6 mt-[80px]" : "p-4 md:p-10"}`}
    >
      {/* Show different content based on login status */}
      {!loggedIn ? (
        // Full screen content for non-logged in users
        <div className="max-w-7xl mx-auto">
          {/* Public Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white-500 mb-4">
              Our Loan Products
            </h1>
            <p className="text-white-600 text-lg">
              Explore our comprehensive range of loan products
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading loan products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-10">
              <p className="text-red-500">Error: {error}</p>
            </div>
          )}

          {/* Loan Products Grid - Made Smaller */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mb-6">
              {loanProducts.map((loan) => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          )}

          {/* No Products Message */}
          {!loading && !error && loanProducts.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No loan products available at the moment.</p>
            </div>
          )}

          {/* Public Footer Message */}
          <div className="mt-10 text-center text-gray-500 border-t pt-6">
            <p>Login to apply for loans and access personalized offers</p>
          </div>
        </div>
      ) : (
        // Logged-in view
        <div className="max-w-7xl mx-auto">
          {/* Header with Branch Filter */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-xl md:text-3xl font-bold text-orange-500">
              NBFC Loan Products - All Available Loans
            </h1>

            <div>
              <label className="mr-2 font-medium">Filter by</label>
              <select className="border px-3 py-1 rounded bg-white">
                <option>All Loans</option>
                <option>Personal Loan</option>
                <option>Business Loan</option>
                <option>Home Loan</option>
                <option>Education Loan</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading loan products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-10">
              <p className="text-red-500">Error: {error}</p>
            </div>
          )}

          {/* Loan Products Grid - Made Smaller */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mb-6">
                {loanProducts.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} />
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <StatCard 
                  icon={<IndianRupee />} 
                  title="Total Loan Products" 
                  value={loanProducts.length.toString()} 
                />
                <StatCard 
                  icon={<Percent />} 
                  title="Avg Interest Rate" 
                  value="11.5%" 
                />
                <StatCard 
                  icon={<Clock />} 
                  title="Avg Tenure" 
                  value="36 months" 
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LoanCard({ loan }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      {/* Card Header - Navbar Gradient */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#2563eb] p-2.5">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white line-clamp-1">{loan.name}</h3>
          <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/30 whitespace-nowrap ml-1">
            {loan.loan_type || 'Standard'}
          </span>
        </div>
      </div>
      
      <div className="p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="p-1.5 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-md">
              <IndianRupee className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs">
              ₹{loan.min_amount?.toLocaleString() || 'N/A'} - ₹{loan.max_amount?.toLocaleString() || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700">
            <div className="p-1.5 bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] rounded-md">
              <Percent className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs">
              {loan.min_interest_rate || 'N/A'}% - {loan.max_interest_rate || 'N/A'}%
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-700">
            <div className="p-1.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-md">
              <Clock className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs">
              {loan.min_tenure_months || 'N/A'} - {loan.max_tenure_months || 'N/A'}m
            </span>
          </div>
          
          {loan.description && (
            <p className="text-xs text-gray-500 line-clamp-1 border-t border-gray-100 pt-1.5 mt-1">
              {loan.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-gray-700">
            <div className="p-1.5 bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-md">
              <Building2 className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs">
              {loan.branch || 'All'}
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] text-gray-400">ID: {loan.loan_id || loan.id}</span>
            </div>
            <Link href={`/apply`}>
              <button className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#2563eb] text-white px-3 py-1.5 rounded-lg text-xs hover:from-[#1e3a8a] hover:via-[#2563eb] hover:to-[#3b82f6] transition-all duration-300 font-medium shadow-sm">
                Apply Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 border flex items-center gap-4">
      <div className="text-orange-500">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}