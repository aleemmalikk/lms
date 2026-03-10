"use client";

import { useEffect, useState } from "react";
import {
  getWithAuth,
  postWithAuth,
  getAuthToken,
} from "../../lib/api";

export default function LoanApplyPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [riskResult, setRiskResult] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    requested_amount: "",
    tenure_months: "",
    cibil_score: "",
    avg_monthly_income: "",
    existing_emi: "",
    has_90_dpd: false,
    written_off: false,
    bounce_count: 0,
    fraud_score: 0,
  });


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getWithAuth("loan-categories/");
      setCategories(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load loan categories");
    }
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const calculateFOIR = () => {
    const income = parseFloat(formData.avg_monthly_income);
    const emi = parseFloat(formData.existing_emi);

    if (!income || !emi) return 0;

    return ((emi / income) * 100).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setRiskResult(null);

    try {
      const foirValue = calculateFOIR();

      const createRes = await postWithAuth("loan-applications/", {
        ...formData,
        foir: foirValue,
      });

      const submitRes = await postWithAuth(
        `loan-applications/${createRes.id}/submit/`,
        {}
      );

      setRiskResult(submitRes);
      setMessage("Application processed successfully!");
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg text-black">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Apply for Loan
        </h1>

        {message && (
          <div className="mb-4 text-red-500 text-sm">{message}</div>
        )}

        {riskResult && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h3 className="font-semibold text-lg mb-2">
              Risk Evaluation Result
            </h3>
            <p>Risk Score: {riskResult.risk_score}</p>
            <p>Status: {riskResult.status}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Loan Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded-lg"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Requested Amount
            </label>
            <input
              type="number"
              name="requested_amount"
              value={formData.requested_amount}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tenure (Months)
            </label>
            <input
              type="number"
              name="tenure_months"
              value={formData.tenure_months}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Monthly Income
            </label>
            <input
              type="number"
              name="avg_monthly_income"
              value={formData.avg_monthly_income}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Existing EMI
            </label>
            <input
              type="number"
              name="existing_emi"
              value={formData.existing_emi}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              FOIR: {calculateFOIR()}%
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              CIBIL Score
            </label>
            <input
              type="number"
              name="cibil_score"
              value={formData.cibil_score}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="has_90_dpd"
                checked={formData.has_90_dpd}
                onChange={handleChange}
              />
              90+ DPD
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="written_off"
                checked={formData.written_off}
                onChange={handleChange}
              />
              Written Off
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Fraud Score
            </label>
            <input
              type="number"
              name="fraud_score"
              value={formData.fraud_score}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Processing..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}