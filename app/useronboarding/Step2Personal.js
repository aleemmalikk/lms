"use client";
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/app/lib/api";

import {
  UserIcon,
  CalendarIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export default function Step2Personal({ form, setForm, next, prev }) {

  const [errors, setErrors] = useState({});
  const [loadingPAN, setLoadingPAN] = useState(false);
  const [panVerified, setPanVerified] = useState(false); // ✅ extra

  // ✅ GET TOKEN
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken")
    );
  };

  // ✅ PAN VERIFY API
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
      console.log("PAN API RESPONSE:", data);

      // ✅ HANDLE RESPONSE SAFELY
      const panName =
        typeof data === "object"
          ? data?.name || data?.data?.name
          : null;

      if (panName) {
        setForm((prev) => ({
          ...prev,
          name: panName
        }));

        setErrors((prev) => ({
          ...prev,
          pan: ""
        }));

        setPanVerified(true); // ✅ success
      } else {
        setErrors((prev) => ({
          ...prev,
          pan: "Invalid PAN or name not found"
        }));
      }

    } catch (error) {
      console.log("PAN ERROR:", error);

      const data = error?.response?.data;

      const msg =
        typeof data === "string"
          ? data
          : data?.message ||
            data?.pan_number?.[0] ||
            "PAN verification failed";

      setErrors((prev) => ({
        ...prev,
        pan: msg // ✅ ALWAYS STRING
      }));

      setPanVerified(false);
    } finally {
      setLoadingPAN(false);
    }
  };

  // ✅ VALIDATION
  const validatePAN = (pan) => {
    if (!pan) return "PAN required";
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!regex.test(pan)) return "Invalid PAN (ABCDE1234F)";
    return "";
  };

  // ✅ INPUT CHANGE
  const handleChange = async (e) => {
    const { name, value } = e.target;
    const formattedValue = name === "pan" ? value.toUpperCase() : value;

    setForm({
      ...form,
      [name]: formattedValue
    });

    // 🔥 PAN VERIFY TRIGGER
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

  // ✅ AGE CALC
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

  const age = calculateAge(form.dob);

  return (
    <div className="w-full max-w-xl mx-auto">

      <h2 className="text-2xl font-bold text-center mb-6">
        Personal Information
      </h2>

      <div className="space-y-6">

        {/* PAN */}
        <div>
          <label className="block text-sm font-medium mb-2">
            PAN Card Number
          </label>

          <div className="relative">
            <IdentificationIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>

            <input
              type="text"
              name="pan"
              value={form.pan || ""}
              onChange={handleChange}
              maxLength={10}
              placeholder="ABCDE1234F"
              className="w-full pl-10 pr-24 py-3 border rounded-lg border-gray-300"
            />

            {/* 🔥 STATUS UI */}
            <div className="absolute right-3 top-3 text-sm">
              {loadingPAN && <span className="text-gray-400">Verifying...</span>}
              {!loadingPAN && panVerified && (
                <span className="text-green-600 font-medium">✔ Verified</span>
              )}
            </div>
          </div>

          {errors.pan && (
            <p className="text-red-500 text-sm mt-1">
              {typeof errors.pan === "string"
                ? errors.pan
                : "Something went wrong"}
            </p>
          )}
        </div>

        {/* NAME */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Full Name
          </label>

          <div className="relative">
            <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>

            <input
              type="text"
              value={form.name || ""}
              disabled
              placeholder="Auto filled from PAN"
              className="w-full pl-10 py-3 border rounded-lg bg-gray-100"
            />
          </div>
        </div>

        {/* DOB */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Date of Birth
          </label>

          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>

            <input
              type="date"
              name="dob"
              value={form.dob || ""}
              onChange={(e) =>
                setForm({ ...form, dob: e.target.value })
              }
              className="w-full pl-10 py-3 border rounded-lg"
            />
          </div>

          {age && (
            <p className="text-purple-600 text-sm mt-1">
              Age: {age} years
            </p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 pt-6">
          <button onClick={prev} className="flex-1 border py-3 rounded-lg">
            <ArrowLeftIcon className="w-4 h-4 inline mr-1"/>
            Back
          </button>

          <button
            onClick={next}
            disabled={!panVerified} // 🔥 IMPORTANT
            className={`flex-1 py-3 rounded-lg text-white ${
              panVerified ? "bg-purple-600" : "bg-gray-400"
            }`}
          >
            Continue
            <ArrowRightIcon className="w-4 h-4 inline ml-1"/>
          </button>
        </div>

      </div>
    </div>
  );
}