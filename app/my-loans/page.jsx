"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWithAuth } from "../lib/api";

export default function LoansCard() {
  const router = useRouter();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await getWithAuth("loan-applications/stats/");

      const apps = res?.applications || [];

      const filtered = apps.filter(
        (l) => l.status === "approved" || l.status === "disbursed"
      );

      setLoans(filtered);
    } catch (e) {
      console.error("Loan fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">

      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-4 rounded-t-xl">
        <h2 className="text-white text-2xl font-semibold">
          My Loans
        </h2>
      </div>

      <div className="bg-white p-6 rounded-b-xl shadow-md">

        {loading && (
          <p className="text-gray-500">Loading loans...</p>
        )}

        {!loading && loans.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">
              No loans found
            </p>
          </div>
        )}

        {!loading && loans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

            {loans.map((loan) => {
              const isDisbursed = loan.status === "disbursed";

              const amount =
                loan.approved_amount ||
                loan.requested_amount ||
                0;

              const date = loan.created_at
                ? new Date(loan.created_at).toLocaleDateString()
                : "-";

              return (
                <div
                  key={loan.id}
                  className="min-w-[300px] bg-white border rounded-xl p-5 shadow-sm hover:shadow-lg transition-all"
                >

                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg">
                      Loan #{loan.id}
                    </h3>

                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        isDisbursed
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {isDisbursed ? "Active" : "Approved"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-500 text-sm">Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{amount.toLocaleString()}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm mb-4">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Interest</span>
                      <span>{loan.interest_rate || "-" }%</span>
                    </p>

                    <p className="flex justify-between">
                      <span className="text-gray-500">Tenure</span>
                      <span>{loan.tenure_months || "-"} months</span>
                    </p>

                    <p className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span>{date}</span>
                    </p>
                  </div>

                  {isDisbursed ? (
                    <button
                      onClick={() => router.push(`/emi/${loan.id}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition"
                    >
                      📊 View EMI
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-200 text-gray-500 py-2 rounded-lg cursor-not-allowed"
                    >
                      Awaiting Disbursement
                    </button>
                  )}

                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}