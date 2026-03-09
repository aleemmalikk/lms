"use client";

import { useEffect, useState } from "react";
import { getWithAuth, postWithAuth } from "../../lib/api";

export default function DisbursementPage() {

  const [approvedLoans, setApprovedLoans] = useState([]);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    const res = await getWithAuth("loan-applications/");
    const filtered = res.filter(a => a.status === "approved");
    setApprovedLoans(filtered);
  };

  const disburse = async (id) => {
    await postWithAuth(`loan-applications/${id}/disburse/`, {});
    alert("Loan Disbursed");
    fetchLoans();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Loan Disbursement</h1>

      <table className="w-full text-sm border">

        <thead className="bg-gray-200">
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {approvedLoans.map((loan) => (
            <tr key={loan.id} className="border-b">
              <td>{loan.full_name}</td>
              <td>₹{loan.requested_amount}</td>
              <td>{loan.category.name}</td>

              <td>
                <button
                  onClick={() => disburse(loan.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Disburse
                </button>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}