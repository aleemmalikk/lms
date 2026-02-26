"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, BASE_URL } from "../../lib/api";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Shield, 
  CheckCircle, 
  X, 
  Sparkles,
  Key,
  UserCheck,
  AlertCircle
} from "lucide-react";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const [modal, setModal] = useState({
    show: false,
    type: "success", // success, error, warning
    title: "",
    message: "",
    icon: null
  });
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    // Check password strength
    const newPassword = formData.newPassword;
    setPasswordStrength({
      hasMinLength: newPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasLowerCase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    });
  }, [formData.newPassword]);

  const showModal = (type, title, message, icon) => {
    setModal({
      show: true,
      type,
      title,
      message,
      icon
    });
  };

  const closeModal = () => {
    setModal({ show: false, type: "", title: "", message: "", icon: null });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const calculatePasswordStrength = () => {
    const requirements = Object.values(passwordStrength);
    const metCount = requirements.filter(Boolean).length;
    return (metCount / requirements.length) * 100;
  };

  const getPasswordStrengthColor = () => {
    const strength = calculatePasswordStrength();
    if (strength <= 40) return "bg-red-500";
    if (strength <= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    const strength = calculatePasswordStrength();
    if (strength <= 40) return "Weak";
    if (strength <= 70) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      showModal(
        "error",
        "Missing Information",
        "Please fill in all fields to continue.",
        <AlertCircle className="text-red-500" size={48} />
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showModal(
        "error",
        "Passwords Don't Match",
        "New password and confirm password must be identical.",
        <X className="text-red-500" size={48} />
      );
      return;
    }

    if (formData.newPassword.length < 8) {
      showModal(
        "error",
        "Password Too Short",
        "Password must be at least 8 characters long for better security.",
        <AlertCircle className="text-red-500" size={48} />
      );
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}users/change_password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: formData.oldPassword,
          new_password: formData.newPassword,
        }),
      });

      const contentType = res.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Server error");
      }

      if (res.ok) {
        showModal(
          "success",
          "Password Changed Successfully!",
          "Your password has been updated securely. You can now use your new password to login.",
          <div className="relative">
            <CheckCircle className="text-green-500" size={48} />
            <Sparkles className="absolute -top-2 -right-2 text-yellow-400" size={20} />
          </div>
        );
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showModal(
          "error",
          "Password Change Failed",
          data.error || data.detail || data.message || "Please check your current password and try again.",
          <X className="text-red-500" size={48} />
        );
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      showModal(
        "error",
        "Something Went Wrong",
        "We couldn't change your password. Please check your connection and try again.",
        <AlertCircle className="text-red-500" size={48} />
      );
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
      met ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
    }`}>
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
        met ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
      }`}>
        {met ? <CheckCircle size={14} /> : <div className="w-2 h-2 bg-gray-400 rounded-full" />}
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );

  // Success Modal Component
  const SuccessModal = () => {
    if (!modal.show) return null;

    const getModalConfig = () => {
      switch (modal.type) {
        case "success":
          return {
            bgColor: "bg-gradient-to-br from-green-50 to-emerald-100",
            borderColor: "border-green-200",
            buttonColor: "bg-green-500 hover:bg-green-600",
            iconBg: "bg-green-100"
          };
        case "error":
          return {
            bgColor: "bg-gradient-to-br from-red-50 to-pink-100",
            borderColor: "border-red-200",
            buttonColor: "bg-red-500 hover:bg-red-600",
            iconBg: "bg-red-100"
          };
        default:
          return {
            bgColor: "bg-gradient-to-br from-blue-50 to-cyan-100",
            borderColor: "border-blue-200",
            buttonColor: "bg-blue-500 hover:bg-blue-600",
            iconBg: "bg-blue-100"
          };
      }
    };

    const config = getModalConfig();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className={`rounded-3xl shadow-2xl max-w-md w-full ${config.bgColor} border ${config.borderColor} transform transition-all duration-300 scale-100 animate-scaleIn`}>
          <div className="p-8 text-center">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Icon */}
            <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {modal.icon}
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {modal.title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {modal.message}
            </p>

            {/* Action Button */}
            <button
              onClick={closeModal}
              className={`w-full text-white px-6 py-2 rounded-xl transition-all duration-200 ${config.buttonColor} shadow-lg transform hover:scale-105 active:scale-95 font-semibold`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <SuccessModal />
      
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-2">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#112772] to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Key className="text-white" size={32} />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#112772] to-blue-600 bg-clip-text text-transparent">
            Change Password
          </h1>
          <p className="text-lg text-gray-600">
            Secure your account with a strong, unique password
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Current Password */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Lock size={16} className="text-[#112772]" />
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.oldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#112772] focus:border-[#112772] transition-all duration-300 pr-12 bg-gray-50/50 group-hover:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('oldPassword')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#112772] transition-colors duration-200"
                  >
                    {showPasswords.oldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Key size={16} className="text-[#112772]" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#112772] focus:border-[#112772] transition-all duration-300 pr-12 bg-gray-50/50 group-hover:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('newPassword')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#112772] transition-colors duration-200"
                  >
                    {showPasswords.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-700">Password Strength</h4>
                      <span className={`text-sm font-bold ${getPasswordStrengthColor().replace('bg-', 'text-')}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    
                    {/* Strength Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                        style={{ width: `${calculatePasswordStrength()}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <PasswordRequirement met={passwordStrength.hasMinLength} text="8+ characters" />
                      <PasswordRequirement met={passwordStrength.hasUpperCase} text="Uppercase letter" />
                      <PasswordRequirement met={passwordStrength.hasLowerCase} text="Lowercase letter" />
                      <PasswordRequirement met={passwordStrength.hasNumber} text="Number" />
                      <PasswordRequirement met={passwordStrength.hasSpecialChar} text="Special character" />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <UserCheck size={16} className="text-[#112772]" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-[#112772] focus:border-[#112772] transition-all duration-300 pr-12 ${
                      formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                        ? "border-red-300 bg-red-50/50"
                        : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                        ? "border-green-300 bg-green-50/50"
                        : "border-gray-200 bg-gray-50/50 group-hover:bg-white"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#112772] transition-colors duration-200"
                  >
                    {showPasswords.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <div className="flex items-center gap-2 mt-3 text-green-600 text-sm font-medium animate-fadeIn">
                    <CheckCircle size={18} />
                    <span>Passwords match perfectly!</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-gradient-to-r from-[#112772] to-blue-700 text-white font-bold rounded-xl hover:from-blue-800 hover:to-[#112772] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl relative overflow-hidden group"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg">Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Shield size={20} />
                      <span className="text-lg">Change Password Securely</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-[#112772] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>
          </div>
          
          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-2 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Shield size={16} className="text-[#112772]" />
              <span>Your password is encrypted and stored securely</span>
            </div>
          </div>
        </div>        
      </div>
    </div>
  );
}