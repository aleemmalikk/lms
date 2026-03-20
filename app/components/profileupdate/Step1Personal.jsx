"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/app/lib/api";
import {
  UserIcon,
  CalendarIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export default function Step1Personal({ form, setForm, next, prev, isPopup = false }) {
  const [errors, setErrors] = useState({});
  const [loadingPAN, setLoadingPAN] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const dob = form.dob || form.date_of_birth;

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  };

  const verifyPAN = async (pan) => {
    try {
      setLoadingPAN(true);
      setPanVerified(false);

      const token = getToken();

      const res = await axios.post(
        `${BASE_URL}bbps/bbps/verify-pan/`,
        { pan_number: pan },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      const data = res.data;
      const panName = typeof data === "object" ? data?.name || data?.data?.name : null;

      if (panName) {
        setForm((prev) => ({
          ...prev,
          name: panName
        }));
        setErrors((prev) => ({ ...prev, pan: "" }));
        setPanVerified(true);
      } else {
        setErrors((prev) => ({ ...prev, pan: "Invalid PAN or name not found" }));
      }
    } catch (error) {
      const data = error?.response?.data;
      const msg = typeof data === "string"
        ? data
        : data?.message || data?.pan_number?.[0] || "PAN verification failed";
      setErrors((prev) => ({ ...prev, pan: msg }));
      setPanVerified(false);
    } finally {
      setLoadingPAN(false);
    }
  };


  useEffect(() => {
    const pan = form.pan || form.pan_number;
    if (pan && pan.length === 10 && (form.name || form.first_name)) {
      setPanVerified(true);
    }

    if (!form.name && form.first_name) {
      setForm((prev) => ({
        ...prev,
        name: `${form.first_name || ""} ${form.last_name || ""}`.trim()
      }));
    }
  }, [form]);

  const validatePAN = (pan) => {
    if (!pan) return "PAN required";
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!regex.test(pan)) return "Invalid PAN (ABCDE1234F)";
    return "";
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const formattedValue = name === "pan" ? value.toUpperCase() : value;

    if (name === "pan") {
      setForm((prev) => ({
        ...prev,
        pan: formattedValue,          // ✅ ALWAYS keep pan
        pan_number: formattedValue,   // ✅ backend field
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: formattedValue
      }));
    }

    // PAN verification logic same
    if (name === "pan") {
      setPanVerified(false);

      if (formattedValue.length === 10) {
        const error = validatePAN(formattedValue);

        if (!error) {
          await verifyPAN(formattedValue);
        } else {
          setErrors((prev) => ({ ...prev, pan: error }));
        }
      }
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(form.dob || form.date_of_birth);

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
        Personal Information
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN Card Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <IdentificationIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="pan"
              value={form.pan || form.pan_number || ""}
              onChange={handleChange}
              maxLength={10}
              placeholder="ABCDE1234F"
              className="w-full pl-10 pr-24 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute right-3 top-3 text-sm">
              {loadingPAN && <span className="text-gray-400">Verifying...</span>}
              {!loadingPAN && panVerified && (
                <span className="text-green-600 font-medium">✓ Verified</span>
              )}
            </div>
          </div>
          {errors.pan && (
            <p className="text-red-500 text-sm mt-1">{errors.pan}</p>
          )}
        </div>

        {/* NAME */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={
                form.name ||
                `${form.first_name || ""} ${form.last_name || ""}`.trim()
              }
              disabled
              placeholder="Auto filled from PAN"
              className="w-full pl-10 py-3 border rounded-lg bg-gray-100 text-gray-600"
            />
          </div>
        </div>

        {/* DOB */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              name="dob"
              value={form.dob || form.date_of_birth || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  date_of_birth: e.target.value
                })
              }
              className="w-full pl-10 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {age && (
            <p className="text-purple-600 text-sm mt-1">
              Age: {age} years
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={prev}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 inline mr-1" />
            Back
          </button>
          <button
            onClick={next}
            disabled={!panVerified || !dob}
            className={`flex-1 py-3 rounded-lg text-white font-medium transition-all ${panVerified && dob
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            Continue
            <ArrowRightIcon className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}