"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { post, storeUserData, clearAuthData, validateLoginAccess } from "../lib/api.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function EmailLogin({ onShowForgot }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuperAdminPopup, setShowSuperAdminPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (message) setMessage("");
  };

  const handleSuperAdminRedirect = () => {
    console.log('👑 Redirecting superadmin to admin panel');

    const adminUrl = "https://wikin-admin.vercel.app/";
    window.open(adminUrl, '_blank');

    setShowSuperAdminPopup(false);
    setFormData({ username: "", password: "" });
    setMessage("");

    setMessage("Super Admin panel opened in new tab. You can continue login for other users.");

    clearAuthData();
  };

  const handleRoleBasedRedirect = (userRole) => {
    console.log('🔄 Redirecting based on role:', userRole);

    const accessCheck = validateLoginAccess(userRole);

    if (!accessCheck.allowed) {
      if (accessCheck.redirectUrl.startsWith('http')) {
        setShowSuperAdminPopup(true);
        return false;
      } else {
        alert(`❌ ${accessCheck.message}`);
        router.replace(accessCheck.redirectUrl);
      }
      return false;
    }

    // Proceed with normal redirection for allowed roles
    switch (userRole?.toLowerCase()) {
      case 'admin':
        router.replace("/admin");
        break;
      case 'dealer':
        router.replace("/dealer");
        break;
      case 'master':
        router.replace("/master");
        break;
      case 'retailer':
      default:
        router.replace("/");
        break;
    }
    return true;
  };

  useEffect(() => {
    window.google?.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });

    window.google?.accounts.id.renderButton(
      document.getElementById("google-login"),
      { theme: "outline", size: "large", width: 300 }
    );
  }, []);

  const handleGoogleLogin = async (response) => {
    try {
      clearAuthData();

      const res = await post("auth/google_login/", {
        id_token: response.credential,
      });

      if (res?.otp_required && res?.username) {
        localStorage.setItem("username", res.username);
        localStorage.setItem("login_method", "google");
        router.replace("/otp");
        return;
      }

      setMessage("Unexpected response from server");

    } catch (err) {
      console.error("Google Login Failed", err);
      setMessage("Google login failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setMessage("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      console.log('🔐 Attempting login for:', formData.username);

      // Clear any existing auth data first
      clearAuthData();

      const response = await post("auth/login/", {
        username: formData.username,
        password: formData.password,
      });

      console.log("✅ Login Response:", response);

      if (
        response.message?.toLowerCase().includes("otp sent") ||
        response.otp_token
      ) {
        localStorage.setItem("username", formData.username);
        localStorage.setItem("temp_password", formData.password);
        if (response.otp_token)
          localStorage.setItem("otp_token", response.otp_token);
        router.push("/otp");
      } else if (response.success || response.access_token || response.access) {
        // Store user data including role using the updated function
        storeUserData(response);

        // Wait a moment for localStorage to be updated
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get role and validate access
        const userRole = response.user?.role || response.role || localStorage.getItem("user_role");
        console.log("🎭 User Role Detected:", userRole);

        if (userRole) {
          handleRoleBasedRedirect(userRole);
        } else {
          setMessage("Unable to determine user role. Please contact support.");
        }
      } else {
        const errorMessage =
          response.message || "Login failed. Please try again.";
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error("❌ Login Error:", error);

      // Enhanced error messages
      if (error.message?.includes('role') || error.message?.includes('permission')) {
        setMessage("Access denied: " + error.message);
      } else {
        setMessage(error.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (onShowForgot) onShowForgot();
    else router.push("/login/forgetpassword");
  };

  const handlesignuprequest = () => {
    router.push("/login/signuprequest");
  };

  const closeSuperAdminPopup = () => {
    setShowSuperAdminPopup(false);
    setFormData({ username: "", password: "" });
    setMessage("");
  };

  return (
    <>
      {/* Main Container - Height adjusted */}
      <div className="flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl w-full max-w-md p-5 border border-white/20">

          {/* Heading - Reduced */}
          <div className="text-center mb-3">
            <h2 className="text-xl font-bold text-gray-800">
              Welcome Back 
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Login to access your LMS dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username - Compact */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="w-full px-3 py-2 text-sm text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#112772] focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Password - Compact */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 pr-8 text-sm text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#112772] focus:border-transparent outline-none transition"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-[#112772]"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>

              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-[#112772] hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Login Button - Compact */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg text-white font-semibold text-sm bg-gradient-to-r from-[#112772] to-blue-600 hover:opacity-90 transition duration-300 shadow-lg disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Google Login - Compact */}
            <div className="flex justify-center mt-2">
              <div id="google-login" className="scale-90 origin-center"></div>
            </div>

            {/* Signup - Compact */}
            <div className="text-center mt-2">
              <p className="text-xs text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={handlesignuprequest}
                  className="text-[#112772] font-semibold hover:underline"
                >
                  Signup Request
                </button>
              </p>
            </div>

            {/* Message - Compact */}
            {message && (
              <div
                className={`mt-2 p-2 rounded-lg text-xs transition ${
                  message.toLowerCase().includes("invalid") ||
                  message.toLowerCase().includes("error") ||
                  message.toLowerCase().includes("failed") ||
                  message.toLowerCase().includes("denied")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Super Admin Popup */}
      {showSuperAdminPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 max-w-sm w-full">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Super Admin Access</h3>
            <p className="text-xs text-gray-600 mb-3">
              Super Admin detected. Would you like to open the admin panel?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={closeSuperAdminPopup}
                className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSuperAdminRedirect}
                className="px-2 py-1 text-xs bg-[#112772] text-white rounded-lg hover:bg-blue-800 transition"
              >
                Open Admin Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}