"use client";
import { useState, useEffect } from "react";
import { BASE_URL, getAuthToken } from "../../lib/api";

export default function Step2Address({ form, setForm, next, prev }) {
  const [errors, setErrors] = useState({});
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const fetchStates = async () => {
    try {
      const res = await fetch(`${BASE_URL}states/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStates(data);
      }
    } catch (error) {
      console.error("❌ States Error:", error);
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const res = await fetch(`${BASE_URL}cities/?state=${stateId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCities(data);
      }
    } catch (error) {
      console.error("❌ Cities Error:", error);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (form.stateId) {
      fetchCities(form.stateId);
    }
  }, [form.stateId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "state") {
      const selectedState = states.find((s) => s.id == value);

      setForm({
        ...form,
        state: selectedState?.name || "", // display
        stateId: value, // 🔥 actual ID
        city: "",
        cityId: "",
      });
    }

    // ✅ CITY SELECT
    else if (name === "city") {
      const selectedCity = cities.find((c) => c.id == value);

      setForm({
        ...form,
        city: selectedCity?.name || "",
        cityId: value,
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ✅ Validation
  const validateField = (name, value) => {
    let error = "";

    if (name === "pincode" && !/^\d{6}$/.test(value)) {
      error = "Enter valid pincode";
    }

    if ((name === "city" || name === "state" || name === "address") && !value) {
      error = "Required";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    return (
      validateField("state", form.state) &&
      validateField("city", form.city) &&
      validateField("address", form.address) &&
      validateField("pincode", form.pincode)
    );
  };

  const handleContinue = () => {
    if (validateForm()) next();
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Address Details</h2>

      <div className="space-y-4">
        {/* STATE */}
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <select
            name="state"
            value={form.stateId || ""} // 🔥 FIX
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-500 text-sm">{errors.state}</p>
          )}
        </div>

        {/* CITY */}
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <select
            name="city"
            value={form.cityId || ""} // 🔥 FIX
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            disabled={!form.stateId}
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
        </div>

        {/* ADDRESS */}
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea
            name="address"
            value={form.address || ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            rows={3}
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address}</p>
          )}
        </div>

        {/* PINCODE */}
        <div>
          <label className="block text-sm font-medium mb-1">Pincode</label>
          <input
            name="pincode"
            value={form.pincode || ""}
            onChange={(e) =>
              setForm({
                ...form,
                pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
              })
            }
            className="w-full border rounded-lg p-3"
          />
          {errors.pincode && (
            <p className="text-red-500 text-sm">{errors.pincode}</p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={prev}
            className="flex-1 border rounded-lg py-3 hover:bg-gray-100"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
