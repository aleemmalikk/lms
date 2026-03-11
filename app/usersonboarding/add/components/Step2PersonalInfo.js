import { useState } from "react";
import { FaPhone, FaIdCard, FaCalendar, FaVenusMars } from "react-icons/fa";

export default function Step2PersonalInfo({ formData, handleInputChange }) {
  const [errors, setErrors] = useState({});
  const star = <span className="text-red-500 ml-1">*</span>;

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "first_name":
      case "last_name":
        if (!/^[A-Za-z\s]+$/.test(value)) {
          error = "Only letters are allowed";
        }
        break;

      case "phone_number":
      case "alternative_phone":
        if (!/^\d*$/.test(value)) {
          error = "Only numbers allowed";
        } else if (value.length !== 10) {
          error = "Phone number must be 10 digits";
        }
        break;

      case "aadhar_number":
        if (!/^\d*$/.test(value)) {
          error = "Only numbers allowed";
        } else if (value.length !== 12) {
          error = "Aadhar must be 12 digits";
        }
        break;

      case "pan_number":
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
          error = "Invalid PAN format (ABCDE1234F)";
        }
        break;

      case "date_of_birth":
        if (new Date(value) > new Date()) {
          error = "Date of birth cannot be in future";
        }
        break;

      case "gender":
        if (!value) {
          error = "Please select gender";
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const onChangeWithValidation = (e) => {
    let { name, value } = e.target;

    // 🔒 Number-only enforcement
    if (
      ["phone_number", "alternative_phone", "aadhar_number"].includes(name)
    ) {
      value = value.replace(/\D/g, "");
    }

    // 🔠 PAN auto-uppercase
    if (name === "pan_number") {
      value = value.toUpperCase();
    }

    handleInputChange({
      target: { name, value }
    });

    validateField(name, value);
  };

  const inputClass = (field) =>
    `text-black w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#112772] ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="space-y-4">
      {/* First & Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name {star}
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={onChangeWithValidation}
            className={inputClass("first_name")}
            placeholder="Enter first name"
            required
          />
          {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name {star}
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={onChangeWithValidation}
            className={inputClass("last_name")}
            placeholder="Enter last name"
            required
          />
          {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
        </div>
      </div>

      {/* Phone Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaPhone className="inline mr-2 text-gray-400" />
            Phone Number {star}
          </label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={onChangeWithValidation}
            maxLength={10}
            className={inputClass("phone_number")}
            placeholder="10 digit mobile number"
            required
          />
          {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaPhone className="inline mr-2 text-gray-400" />
            Alternative Phone {star}
          </label>
          <input
            type="text"
            name="alternative_phone"
            value={formData.alternative_phone}
            onChange={onChangeWithValidation}
            maxLength={10}
            className={inputClass("alternative_phone")}
            placeholder="10 digit mobile number"
            required
          />
          {errors.alternative_phone && (
            <p className="text-red-500 text-xs mt-1">{errors.alternative_phone}</p>
          )}
        </div>
      </div>

      {/* Aadhar & PAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaIdCard className="inline mr-2 text-gray-400" />
            Aadhar Number {star}
          </label>
          <input
            type="text"
            name="aadhar_number"
            value={formData.aadhar_number}
            onChange={onChangeWithValidation}
            maxLength={12}
            className={inputClass("aadhar_number")}
            placeholder="12 digit Aadhar number"
            required
          />
          {errors.aadhar_number && <p className="text-red-500 text-xs mt-1">{errors.aadhar_number}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaIdCard className="inline mr-2 text-gray-400" />
            PAN Number {star}
          </label>
          <input
            type="text"
            name="pan_number"
            value={formData.pan_number}
            onChange={onChangeWithValidation}
            maxLength={10}
            className={inputClass("pan_number")}
            placeholder="ABCDE1234F"
            required
          />
          {errors.pan_number && <p className="text-red-500 text-xs mt-1">{errors.pan_number}</p>}
        </div>
      </div>

      {/* DOB & Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaCalendar className="inline mr-2 text-gray-400" />
            Date of Birth {star}
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={onChangeWithValidation}
            className={inputClass("date_of_birth")}
            required
          />
          {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaVenusMars className="inline mr-2 text-gray-400" />
            Gender {star}
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={onChangeWithValidation}
            className={inputClass("gender")}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </div>
      </div>
    </div>
  );
}
