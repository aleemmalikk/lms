"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserIcon,
  CalendarIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function Step2Personal({ form, setForm, next, prev }) {

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // validation functions
  const validateName = (name) => {
    if (!name) return "Full name is required";
    if (name.length < 3) return "Name must be at least 3 characters";
    if (!/^[a-zA-Z\s]*$/.test(name)) return "Only letters allowed";
    return "";
  };

  const validateDOB = (dob) => {
    if (!dob) return "Date of birth required";

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) return "Must be 18+";
    if (age > 100) return "Invalid DOB";

    return "";
  };

  const validatePAN = (pan) => {
    if (!pan) return "PAN required";
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!regex.test(pan)) return "Invalid PAN (ABCDE1234F)";
    return "";
  };

  const validateField = (name, value) => {

    let error = "";

    if (name === "name") error = validateName(value);
    if (name === "dob") error = validateDOB(value);
    if (name === "pan") error = validatePAN(value);

    setErrors((prev) => ({ ...prev, [name]: error }));

    return !error;
  };

  const handleChange = (e) => {

    const { name, value } = e.target;

    const formattedValue = name === "pan" ? value.toUpperCase() : value;

    setForm({
      ...form,
      [name]: formattedValue
    });

    if (touched[name]) {
      validateField(name, formattedValue);
    }
  };

  const handleBlur = (e) => {

    const { name, value } = e.target;

    setTouched({
      ...touched,
      [name]: true
    });

    validateField(name, value);
  };

  const validateForm = () => {

    const nameValid = validateField("name", form.name);
    const dobValid = validateField("dob", form.dob);
    const panValid = validateField("pan", form.pan);

    setTouched({
      name: true,
      dob: true,
      pan: true
    });

    return nameValid && dobValid && panValid;
  };

  const handleContinue = () => {
    if (validateForm()) next();
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

  const age = calculateAge(form.dob);

  const fields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      icon: UserIcon,
      helper: ""
    },
    {
      name: "dob",
      label: "Date of Birth",
      type: "date",
      placeholder: "",
      icon: CalendarIcon,
      helper: ""
    },
    {
      name: "pan",
      label: "PAN Card Number",
      type: "text",
      placeholder: "ABCDE1234F",
      icon: IdentificationIcon,
      helper: "5 letters + 4 numbers + 1 letter"
    }
  ];

  return (
    <div className="w-full max-w-xl mx-auto">

      <h2 className="text-2xl font-bold text-center mb-6">
        Personal Information
      </h2>

      <div className="space-y-6">

        {fields.map((field) => (

          <div key={field.name}>

            <label className="block text-sm font-medium mb-2">
              {field.label}
            </label>

            <div className="relative">

              <field.icon className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>

              <input
                type={field.type}
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={field.placeholder}
                maxLength={field.name === "pan" ? 10 : undefined}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg
                ${errors[field.name] && touched[field.name]
                  ? "border-red-400"
                  : "border-gray-300"}
                `}
              />

              {touched[field.name] && form[field.name] && (
                <div className="absolute right-3 top-3">

                  {errors[field.name] ? (
                    <XCircleIcon className="w-5 h-5 text-red-500"/>
                  ) : (
                    <CheckCircleIcon className="w-5 h-5 text-green-500"/>
                  )}

                </div>
              )}

            </div>

            {errors[field.name] && touched[field.name] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[field.name]}
              </p>
            )}

            {field.helper && (
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                <InformationCircleIcon className="w-4 h-4"/>
                {field.helper}
              </p>
            )}

            {field.name === "dob" && age && (
              <p className="text-purple-600 text-sm mt-1">
                Age: {age} years
              </p>
            )}

          </div>

        ))}

        <div className="flex gap-3 pt-6">

          <button
            onClick={prev}
            className="flex-1 border py-3 rounded-lg"
          >
            <ArrowLeftIcon className="w-4 h-4 inline mr-1"/>
            Back
          </button>

          <button
            onClick={handleContinue}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg"
          >
            Continue
            <ArrowRightIcon className="w-4 h-4 inline ml-1"/>
          </button>

        </div>

      </div>
    </div>
  );
}