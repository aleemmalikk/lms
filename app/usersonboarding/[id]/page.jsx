"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaUserShield,
  FaCalendar,
  FaIdCard,
  FaWallet,
  FaEdit,
  FaExclamationTriangle,
  FaPhone,
  FaBuilding,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCog,
  FaVenusMars,
  FaLandmark,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaChartLine,
   FaMapPin, 
  FaBriefcase, 
  FaRupeeSign 
} from "react-icons/fa";
import { BASE_URL } from "../../lib/api";

export default function UserDetailsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}users/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setError("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Error fetching user details");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      'superadmin': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      'admin': 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      'master': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      'dealer': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
      'retailer': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
    };

    const roleNames = {
      'superadmin': 'Super Admin',
      'admin': 'Admin',
      'master': 'Master',
      'dealer': 'Dealer',
      'retailer': 'Retailer'
    };

    return (
      <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${roleStyles[role] || 'bg-gray-500 text-white'}`}>
        {roleNames[role] || role}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const DetailCard = ({ title, icon: Icon, children, className = "" }) => {
    // Add validation to check if Icon is a valid component
    if (!Icon || typeof Icon === 'string') {
      // Return a fallback or null if Icon is invalid
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaUser className="w-5 h-5 text-[#112772]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">{title}</h3>
          </div>
          {children}
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
      >
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="w-5 h-5 text-[#112772]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">{title}</h3>
        </div>
        {children}
      </motion.div>
    );
  };

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <span className="text-sm text-gray-900 font-medium text-right">
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </span>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200"
    };

    // Add this check to ensure Icon is a valid component
    if (!Icon || typeof Icon === 'string') {
      return null; // or return a fallback component
    }

    return (
      <div className={`p-4 rounded-lg border-2 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <Icon className="w-8 h-8 opacity-70" />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#112772] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <FaExclamationTriangle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">User Not Found</h2>
          <p className="text-gray-600 mb-8 text-lg">{error || "The requested user could not be found."}</p>
          <button
            onClick={() => router.push("/usersonboarding")}
            className="bg-[#112772] text-white px-8 py-3 rounded-lg hover:bg-blue-900 transition-all duration-300 transform hover:scale-105 flex items-center mx-auto"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: FaUser },
    { id: "personal", label: "Personal Info", icon: FaIdCard },
    // { id: "business", label: "Business", icon: FaBuilding },
    // { id: "financial", label: "Financial", icon: FaWallet }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {/* <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">

              <div>
                <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-[#112772] to-blue-600 bg-clip-text text-transparent">
                  User Details
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Complete profile information for <span className="font-semibold text-[#112772]">{user.username}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {getRoleBadge(user.role)}
              <button
                onClick={() => router.push(`/usersonboarding/${user.id}/edit`)}
                className="bg-gradient-to-r from-[#112772] to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center font-semibold"
              >
                <FaEdit className="w-4 h-4 mr-2" />
                Edit User
              </button>
            </div>
          </div>
        </motion.div> */}

        {/* User Profile Header */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#112772] to-blue-600 rounded-2xl shadow-xl text-white p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-3xl backdrop-blur-sm border-2 border-white/30">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{user.username}</h2>
                <p className="text-blue-100 text-lg">{user.email}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                    <FaCheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <span className="text-blue-100">
                    User ID: {user.role_uid}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100">Member since</p>
              <p className="text-xl font-semibold">{formatDate(user.date_joined)}</p>
            </div>
          </div>
        </motion.div> */}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-8">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
                    ? "bg-[#112772] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    title="Wallet Balance"
                    value={`₹${user.wallet?.balance || '0.00'}`}
                    icon={FaMoneyBillWave}
                    color="green"
                  />
                  <StatCard
                    title="Account Status"
                    value="Active"
                    icon={FaShieldAlt}
                    color="blue"
                  />
                  {/* <StatCard
                    title="User Role"
                    value={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    icon={FaUserShield}
                    color="purple"
                  /> */}
                </div>

                {/* Basic Information */}
                <DetailCard title="Basic Information" icon={FaUser}>
                  <div className="space-y-2">
  <InfoRow label="User ID" value={user.role_uid} icon={FaIdCard} />
  <InfoRow label="Username" value={user.username} icon={FaUser} />
  <InfoRow label="Phone Number" value={user.phone_number} icon={FaPhone} />
  <InfoRow label="Email Address" value={user.email} icon={FaEnvelope} />
  <InfoRow label="Pincode" value={user.pincode} icon={FaMapPin} />
  <InfoRow label="Employment Type" value={user.employment_type} icon={FaBriefcase} />
  <InfoRow label="Monthly Income" value={user.monthly_income} icon={FaRupeeSign} />
  <InfoRow label="Role" value={user.role} icon={FaUserShield} />
  <InfoRow label="Account Created" value={formatDateTime(user.date_joined)} icon={FaCalendar} />
  {user.created_by_username && (
    <InfoRow label="Created By" value={user.created_by_username} icon={FaUser} />
  )}
</div>
                </DetailCard>

                {/* Contact Information */}
                {(user.phone_number || user.alternative_phone) && (
                  <DetailCard title="Contact Information" icon={FaPhone}>
                    <div className="space-y-2">
                      <InfoRow label="Alternative Phone" value={user.alternative_phone} />
                    </div>
                  </DetailCard>
                )}
              </div>
            )}

            {activeTab === "personal" && (
              <div className="space-y-6">
                <DetailCard title="Personal Details" icon={FaIdCard}>
                  <div className="space-y-2">
                    <InfoRow label="Full Name" value={[user.first_name, user.last_name].filter(Boolean).join(" ")}icon={FaUser}/>
                    <InfoRow label="Gender" value={user.gender} icon={FaVenusMars} />
                    <InfoRow label="Date of Birth" value={formatDate(user.date_of_birth)} icon={FaCalendar} />
                    <InfoRow label="Aadhar Number" value={user.aadhar_number} />
                    <InfoRow label="PAN Number" value={user.pan_number} />
                  </div>
                </DetailCard>
              </div>
            )}

            {activeTab === "business" && (
              <div className="space-y-6">
                {(user.business_name || user.business_nature) && (
                  <DetailCard title="Business Information" icon={FaBuilding}>
                    <div className="space-y-2">
                      <InfoRow label="Business Name" value={user.business_name} />
                      <InfoRow label="Business Nature" value={user.business_nature} />
                      <InfoRow label="Registration Number" value={user.business_registration_number} />
                      <InfoRow label="GST Number" value={user.gst_number} />
                      <InfoRow label="Ownership Type" value={user.business_ownership_type} />
                    </div>
                  </DetailCard>
                )}

                {(user.address || user.state || user.city) && (
                  <DetailCard title="Address Information" icon={FaMapMarkerAlt}>
                    <div className="space-y-2">
                      <InfoRow label="Address" value={user.address} />
                      <InfoRow label="State" value={user.state} />
                      <InfoRow label="City" value={user.city} />
                      <InfoRow label="Landmark" value={user.landmark} icon={FaLandmark} />
                    </div>
                  </DetailCard>
                )}
              </div>
            )}

            {activeTab === "financial" && (
              <div className="space-y-6">
                <DetailCard title="Wallet Information" icon={FaWallet}>
                  <div className="text-center py-8">
                    <div className="text-5xl font-bold text-green-600 mb-4">
                      ₹{user.wallet?.balance || '0.00'}
                    </div>
                    <p className="text-gray-600">Current Wallet Balance</p>
                  </div>
                </DetailCard>

                {(user.bank_name || user.account_number) && (
                  <DetailCard title="Bank Details" icon={FaCreditCard}>
                    <div className="space-y-2">
                      <InfoRow label="Bank Name" value={user.bank_name} />
                      <InfoRow label="Account Number" value={user.account_number} />
                      <InfoRow label="IFSC Code" value={user.ifsc_code} />
                      <InfoRow label="Account Holder" value={user.account_holder_name} />
                    </div>
                  </DetailCard>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          {/* <div className="lg:col-span-1">
            <div className="space-y-6"> */}
              {/* Quick Actions */}
              {/* <DetailCard title="Quick Actions" icon={FaCog}>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/usersonboarding/${user.id}/edit`)}
                    className="w-full bg-[#112772] text-white py-3 rounded-lg hover:bg-blue-900 transition-all duration-200 transform hover:scale-105 font-semibold"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => router.push(`/transactions?user=${user.id}`)}
                    className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    View Transactions
                  </button>

                </div>
              </DetailCard> */}

              {/* Account Status */}
              {/* <DetailCard title="Account Status" icon={FaShieldAlt}>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-semibold text-green-800">Active</p>
                    <p className="text-sm text-green-600">Account is active and operational</p>
                  </div>
                </div>
              </DetailCard> */}

              {/* Recent Activity */}
              {/* <DetailCard title="Recent Activity" icon={FaClock}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Profile Viewed</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Login</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </DetailCard>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}