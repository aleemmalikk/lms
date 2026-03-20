"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  HomeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const pincodeDatabase = {
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "110001": { city: "New Delhi", state: "Delhi" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "560001": { city: "Bangalore", state: "Karnataka" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh" },
  "800001": { city: "Patna", state: "Bihar" }
};

export default function Step2Address({ form, setForm, next, prev }) {

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);

  useEffect(() => {

    if (form.pincode && form.pincode.length === 6) {

      setIsSearching(true);

      setTimeout(() => {

        const location = pincodeDatabase[form.pincode];

        if (location) {

          setForm({
            ...form,
            city: location.city,
            state: location.state
          });

        }

        setIsSearching(false);

      }, 500);

    }

  }, [form.pincode]);



  useEffect(() => {

    if (form.address && form.address.length > 5) {

      const commonAddresses = [
        `${form.address}, Near City Mall`,
        `${form.address}, Opposite Central Park`,
        `${form.address}, Beside Metro Station`
      ];

      setAddressSuggestions(commonAddresses);

    } else {

      setAddressSuggestions([]);

    }

  }, [form.address]);



  const validatePincode = (value) => {

    if (!value) return "Pincode required";

    if (!/^\d{6}$/.test(value)) return "Enter valid 6 digit pincode";

    return "";

  };



  const validateCity = (value) => {

    if (!value) return "City required";

    return "";

  };



  const validateState = (value) => {

    if (!value) return "State required";

    return "";

  };



  const validateAddress = (value) => {

    if (!value) return "Address required";

    if (value.length < 10) return "Enter full address";

    return "";

  };



  const validateField = (name, value) => {

    let error = "";

    if (name === "pincode") error = validatePincode(value);
    if (name === "city") error = validateCity(value);
    if (name === "state") error = validateState(value);
    if (name === "address") error = validateAddress(value);

    setErrors((prev) => ({ ...prev, [name]: error }));

    return !error;

  };



  const handleChange = (e) => {

    const { name, value } = e.target;

    const formattedValue =
      name === "pincode"
        ? value.replace(/\D/g, "").slice(0, 6)
        : value;

    setForm({ ...form, [name]: formattedValue });

    if (touched[name]) validateField(name, formattedValue);

  };



  const handleBlur = (e) => {

    const { name, value } = e.target;

    setTouched({ ...touched, [name]: true });

    validateField(name, value);

  };



  const validateForm = () => {

    const p = validateField("pincode", form.pincode);
    const c = validateField("city", form.city);
    const s = validateField("state", form.state);
    const a = validateField("address", form.address);

    return p && c && s && a;

  };



  const handleContinue = () => {

    if (validateForm()) next();

  };



  const fields = [
    { name: "pincode", label: "Pincode", icon: MapPinIcon },
    { name: "city", label: "City", icon: BuildingOfficeIcon },
    { name: "state", label: "State", icon: GlobeAltIcon },
    { name: "address", label: "Full Address", icon: HomeIcon }
  ];



  return (

    <div className="max-w-xl mx-auto">

      <h2 className="text-2xl font-bold mb-6 text-center">
        Address Details
      </h2>

      <div className="space-y-4">

        {fields.map((field) => (

          <div key={field.name}>

            <label className="block text-sm font-medium mb-1">
              {field.label}
            </label>

            {field.name === "address" ? (

              <textarea
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border rounded-lg p-3"
                rows={3}
              />

            ) : (

              <input
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border rounded-lg p-3"
              />

            )}

            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[field.name]}
              </p>
            )}

          </div>

        ))}

        {addressSuggestions.length > 0 && (

          <div className="border rounded-lg p-3 bg-gray-50">

            <p className="text-sm mb-2">Suggestions</p>

            {addressSuggestions.map((s, i) => (
              <div
                key={i}
                onClick={() => setForm({ ...form, address: s })}
                className="cursor-pointer text-sm hover:text-blue-600"
              >
                {s}
              </div>
            ))}

          </div>

        )}

        <div className="flex gap-3 mt-6">

          <button
            onClick={prev}
            className="flex-1 border rounded-lg py-3"
          >
            Back
          </button>

          <button
            onClick={handleContinue}
            className="flex-1 bg-blue-600 text-white rounded-lg py-3"
          >
            Continue
          </button>

        </div>

      </div>

    </div>

  );

}