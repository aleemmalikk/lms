"use client";
import { useState, useEffect } from "react";
import { FaGift, FaInfoCircle, FaCheck } from "react-icons/fa";
import { BASE_URL } from "@/app/lib/api";

export default function Step6AssignCommission({
  formData,
  handleInputChange,
  availableRoles
}) {
  const [commissionPlans, setCommissionPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(
    formData.commission_plan_id || ""
  );

  useEffect(() => {
    loadCommissionPlans();
  }, []);

  // ✅ SAME AS AssignPlan (NO GUESSING)
  const loadCommissionPlans = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${BASE_URL}commission-plans/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch commission plans");
      }

      const data = await response.json();
      const plans = Array.isArray(data)
        ? data
        : data.results || data.data || [];

      setCommissionPlans(plans);
    } catch (err) {
      console.error("Commission plan load error:", err);
      setCommissionPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const getCommissionPercent = (plan) => {
    return (
      plan?.commission_percentage ??
      plan?.percentage ??
      plan?.commission ??
      plan?.rate ??
      0
    );
  };


  const getRoleLabel = (roleValue) => {
    const role = availableRoles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  // ✅ EXACT SAME DATA SAVE AS AssignPlan
  const handlePlanChange = (e) => {
    const value = e.target.value;
    setSelectedPlan(value);

    const planObj = commissionPlans.find(
      p => p.id === parseInt(value)
    );

    // save ID
    handleInputChange({
      target: {
        name: "commission_plan_id",
        value: value
      }
    });

    // save NAME (for Step-7)
    handleInputChange({
      target: {
        name: "commission_plan_name",
        value: planObj
          ? `${planObj.name} (${getCommissionPercent(planObj)}%)`
          : ""
      }
    });
  };

  const getPlanNameById = (planId) => {
    const plan = commissionPlans.find(p => p.id == planId);
    return plan
      ? `${plan.name} (${getCommissionPercent(plan)}%)`
      : "Not assigned";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <FaGift className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Assign Commission Plan
            </h3>
            <p className="text-blue-700">
              Select a commission plan for {formData.username}. (Optional)
            </p>
          </div>
        </div>
      </div>

      {/* User Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">User Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Username</p>
            <p className="font-medium">{formData.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Role</p>
            <p className="font-medium capitalize">
              {getRoleLabel(formData.role)}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-900">
            Select Commission Plan
          </h4>
          <div className="flex items-center text-sm text-blue-600">
            <FaInfoCircle className="mr-1" />
            Optional Step
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading plans...</p>
        ) : commissionPlans.length === 0 ? (
          <p className="text-center text-yellow-700">
            No commission plans available
          </p>
        ) : (
          <div className="space-y-4">
            {selectedPlan && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <FaCheck className="inline mr-2 text-green-600" />
                <span className="text-green-800 font-medium">
                  Selected: {getPlanNameById(selectedPlan)}
                </span>
              </div>
            )}

            <select
              value={selectedPlan}
              onChange={handlePlanChange}
              className="w-full px-4 py-3 border rounded-lg"
            >
              <option value="">Select a plan</option>
              {commissionPlans
                .filter(p => p.is_active)
                .map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({getCommissionPercent(plan)}%)
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
