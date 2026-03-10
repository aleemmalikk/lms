"use client";

import { useEffect, useState } from "react";
import { getWithAuth } from "../lib/api";

export default function CategoriesPage() {

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await getWithAuth("loan-categories/");
    setCategories(res);
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Loan Categories
      </h1>

      <table className="w-full border text-sm">

        <thead className="bg-gray-200">
          <tr>
            <th>Name</th>
            <th>Min CIBIL</th>
            <th>Max Loan</th>
            <th>Interest Rate</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-b">
              <td>{c.name}</td>
              <td>{c.min_cibil}</td>
              <td>₹{c.max_loan_amount}</td>
              <td>{c.base_interest_rate}%</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}