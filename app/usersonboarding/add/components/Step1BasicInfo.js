import { motion } from "framer-motion";
import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaUserShield, FaCheck } from "react-icons/fa";
import { FaUserTie, FaStore, FaShoppingCart } from "react-icons/fa";

export default function Step1BasicInfo({
  formData,
  handleInputChange,
  availableRoles
}) {
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";

    if (name === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Invalid email address";
      }
    }

    if (name === "password") {
      if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(value)) {
        error = "Password must contain letters & numbers (min 6 chars)";
      }
    }

    if (name === "confirmPassword") {
      if (value !== formData.password) {
        error = "Passwords do not match";
      }
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const onChangeWithValidation = (e) => {
    const { name, value } = e.target;

    handleInputChange(e);

    if (name === "email") {
      handleInputChange({
        target: {
          name: "username",
          value: value
        }
      });
    }

    validateField(name, value);

    if (name === "password" && formData.confirmPassword) {
      validateField("confirmPassword", formData.confirmPassword);
    }
  };



  const getRoleColor = (role) => {
    const colorMap = {
      'superadmin': 'border-purple-200 bg-purple-50 hover:bg-purple-100',
      'admin': 'border-red-200 bg-red-50 hover:bg-red-100',
      'master': 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      'dealer': 'border-green-200 bg-green-50 hover:bg-green-100',
      'retailer': 'border-orange-200 bg-orange-50 hover:bg-orange-100'
    };
    return colorMap[role] || 'border-gray-200 bg-gray-50 hover:bg-gray-100';
  };

  const getRoleTextColor = (role) => {
    const colorMap = {
      'superadmin': 'text-purple-800',
      'admin': 'text-red-800',
      'master': 'text-blue-800',
      'dealer': 'text-green-800',
      'retailer': 'text-orange-800'
    };
    return colorMap[role] || 'text-gray-800';
  };

  const getRoleIconColor = (role) => {
    const colorMap = {
      'superadmin': 'text-purple-600',
      'admin': 'text-red-600',
      'master': 'text-blue-600',
      'dealer': 'text-green-600',
      'retailer': 'text-orange-600'
    };
    return colorMap[role] || 'text-gray-600';
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      'FaUserShield': FaUserShield,
      'FaUserTie': FaUserTie,
      'FaStore': FaStore,
      'FaShoppingCart': FaShoppingCart
    };
    return iconMap[iconName] || FaUser;
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaEnvelope className="w-4 h-4 inline mr-2 text-gray-400" />
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onChangeWithValidation}
          required
          className={`text-black w-full px-4 py-2 border rounded-lg 
    ${errors.email ? "border-red-500" : "border-gray-300"}`}
          placeholder="Enter email"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaLock className="w-4 h-4 inline mr-2 text-gray-400" />
            Password *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={onChangeWithValidation}
            required
            className={`text-black w-full px-4 py-2 border rounded-lg 
    ${errors.password ? "border-red-500" : "border-gray-300"}`}
            placeholder="Min 6 chars, letters & numbers"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaLock className="w-4 h-4 inline mr-2 text-gray-400" />
            Confirm Password *
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onChangeWithValidation}
            required
            className={`text-black w-full px-4 py-2 border rounded-lg 
    ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
            placeholder="Confirm password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}

        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          <FaUserShield className="w-4 h-4 inline mr-2 text-gray-400" />
          Select Role *
        </label>

        {errors.role && (
          <p className="text-red-500 text-xs mt-2">{errors.role}</p>
        )}


        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {availableRoles.map((role) => {
            const IconComponent = getIconComponent(role.icon);
            return (
              <motion.button
                key={role.value}
                type="button"
                onClick={() => handleInputChange({
                  target: { name: 'role', value: role.value }
                })}
                className={`p-2 rounded-lg border-2 transition-all duration-200 text-left ${formData.role === role.value
                  ? `border-[#112772] bg-blue-50 ring-2 ring-blue-100`
                  : `${getRoleColor(role.value)} border-gray-200`
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getRoleIconColor(role.value)} bg-white`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${getRoleTextColor(role.value)}`}>
                      {role.label}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {role.description}
                    </p>
                  </div>
                  {formData.role === role.value && (
                    <div className="w-5 h-5 bg-[#112772] rounded-full flex items-center justify-center">
                      <FaCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}