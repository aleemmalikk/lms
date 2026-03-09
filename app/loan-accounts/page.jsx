"use client";

import { useEffect, useState } from "react";
import { getWithAuth } from "../../lib/api";

export default function LoanAccounts() {

  const [loans, setLoans] = useState([]);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    const res = await getWithAuth("loan-accounts/");
    setLoans(res);
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-5">
        Loan Accounts
      </h1>

      <table className="w-full border text-sm">

        <thead className="bg-gray-200">
          <tr>
            <th>Loan ID</th>
            <th>Principal</th>
            <th>Interest</th>
            <th>Tenure</th>
            <th>Outstanding</th>
          </tr>
        </thead>

        <tbody>
          {loans.map((l) => (
            <tr key={l.id} className="border-b">
              <td>{l.loan_id}</td>
              <td>₹{l.principal_amount}</td>
              <td>{l.interest_rate}%</td>
              <td>{l.tenure_months}</td>
              <td>₹{l.outstanding_amount}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}