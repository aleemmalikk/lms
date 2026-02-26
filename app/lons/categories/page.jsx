"use client";

import { useEffect, useState } from "react";
import { getWithAuth, postWithAuth } from "../../lib/api";

export default function LoanCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    min_income: "",
    min_cibil: 650,
    auto_reject_cibil: 600,
    max_foir: 60,
    max_loan_amount: "",
    min_tenure: "",
    max_tenure: "",
    base_interest_rate: "",
    fraud_threshold: 70,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getWithAuth("loan-categories/");
      setCategories(data);
    } catch (err) {
      setMessage("Failed to load categories");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await postWithAuth("loan-categories/", formData);
      setMessage("Category Created Successfully");
      fetchCategories();
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">Loan Categories (Admin)</h1>

        {message && (
          <div className="mb-4 text-sm text-red-600">{message}</div>
        )}

        {/* Create Category Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="font-semibold mb-4">Create New Category</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

            <input
              name="name"
              placeholder="Category Name"
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <select
              name="code"
              onChange={handleChange}
              required
              className="border p-2 rounded"
            >
              <option value="">Select Code</option>
              <option value="personal">Personal</option>
              <option value="salary_advance">Salary Advance</option>
              <option value="working_capital">Working Capital</option>
              <option value="lap">Loan Against Property</option>
              <option value="gold">Gold Loan</option>
            </select>

            <input name="min_income" placeholder="Min Income" onChange={handleChange} className="border p-2 rounded" />
            <input name="min_cibil" placeholder="Min CIBIL" onChange={handleChange} className="border p-2 rounded" />
            <input name="auto_reject_cibil" placeholder="Auto Reject CIBIL" onChange={handleChange} className="border p-2 rounded" />
            <input name="max_foir" placeholder="Max FOIR %" onChange={handleChange} className="border p-2 rounded" />
            <input name="max_loan_amount" placeholder="Max Loan Amount" onChange={handleChange} className="border p-2 rounded" />
            <input name="min_tenure" placeholder="Min Tenure" onChange={handleChange} className="border p-2 rounded" />
            <input name="max_tenure" placeholder="Max Tenure" onChange={handleChange} className="border p-2 rounded" />
            <input name="base_interest_rate" placeholder="Base Interest %" onChange={handleChange} className="border p-2 rounded" />
            <input name="fraud_threshold" placeholder="Fraud Threshold" onChange={handleChange} className="border p-2 rounded" />

            <button
              type="submit"
              disabled={loading}
              className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Create Category"}
            </button>
          </form>
        </div>

        {/* Category Table */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Existing Categories</h2>

          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Name</th>
                <th>Min CIBIL</th>
                <th>FOIR</th>
                <th>Max Loan</th>
                <th>Interest</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t">
                  <td className="p-2">{cat.name}</td>
                  <td>{cat.min_cibil}</td>
                  <td>{cat.max_foir}%</td>
                  <td>₹{cat.max_loan_amount}</td>
                  <td>{cat.base_interest_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}