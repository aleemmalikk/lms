"use client";
import { useState, useEffect, useRef } from "react";
import {
  FaUser, FaCamera, FaWallet, FaIdCard, FaUniversity,
  FaCheckCircle, FaTimesCircle, FaSpinner,
  FaMapMarkerAlt, FaBuilding, FaCreditCard
} from "react-icons/fa";
import { getWithAuth, postWithAuth, patchWithAuth } from "../lib/api";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fetchedRef = useRef(false);
  const [imgError, setImgError] = useState(false);



  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchProfile();
  }, []);


  const fetchProfile = async () => {
    try {
      const data = await getWithAuth("users/my_profile/");
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToKYC = () => {
    router.push("/profile/kyc");
  };

  if (loading) {
    return <ProfileLoader />;
  }

  if (!profile) {
    return <ErrorState onRetry={fetchProfile} />;
  }

  return (
    <div>
      <div>
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ProfilePictureSection
              profile={profile}
              onUpdate={fetchProfile}
            />

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800 capitalize mb-2">
                {profile.first_name && profile.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile.username
                }
              </h2>
              <p className="text-gray-600 capitalize mb-1">{profile.role}</p>
              <p className="text-sm text-blue-600 font-semibold">
                User ID: {profile.role_based_id}
              </p>
              <p className="text-gray-500 mb-3">{profile.email}</p>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  <FaCheckCircle className="text-xs" />
                  Active
                </div>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${profile.aadhar_number && profile.pan_number
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
                  }`}>
                  {profile.aadhar_number && profile.pan_number ? (
                    <>
                      <FaCheckCircle /> Verified
                    </>
                  ) : (
                    <>
                      <FaTimesCircle /> KYC Pending
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={navigateToKYC}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            >
              <FaIdCard />
              Upload KYC Documents
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats profile={profile} />

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <InfoSection title="Personal Information" icon={FaUser}>
            <InfoField label="Username" value={profile.username} />
            <InfoField label="Email" value={profile.email} />
            <InfoField label="Phone Number" value={profile.phone_number} />
            <InfoField label="Alternative Phone" value={profile.alternative_phone} />
            <InfoField label="Date of Birth" value={profile.date_of_birth} />
            <InfoField label="Gender" value={profile.gender} />
          </InfoSection>

          {/* Business Information */}
          <InfoSection title="Business Information" icon={FaBuilding}>
            <InfoField label="Business Name" value={profile.business_name} />
            <InfoField label="Business Nature" value={profile.business_nature} />
            <InfoField label="Registration Number" value={profile.business_registration_number} />
            <InfoField label="GST Number" value={profile.gst_number} />
            <InfoField label="Ownership Type" value={profile.business_ownership_type} />
          </InfoSection>

          {/* Address Information */}
          <InfoSection title="Address Information" icon={FaMapMarkerAlt}>
            <InfoField label="Address" value={profile.address} />
            <InfoField label="City" value={profile.city} />
            <InfoField label="State" value={profile.state} />
            <InfoField label="Pincode" value={profile.pincode} />
            <InfoField label="Landmark" value={profile.landmark} />
          </InfoSection>

          {/* Bank Information */}
          <InfoSection title="Bank Information" icon={FaUniversity}>
            <InfoField label="Bank Name" value={profile.bank_name} />
            <InfoField label="Account Number" value={profile.account_number} />
            <InfoField label="IFSC Code" value={profile.ifsc_code} />
            <InfoField label="Account Holder Name" value={profile.account_holder_name} />
          </InfoSection>

          {/* Wallet Information */}
          <InfoSection title="Wallet Information" icon={FaWallet}>
            <InfoField label="Balance" value={`₹${profile.wallet?.balance || '0.00'}`} />
            <InfoField label="PIN Status" value={profile.wallet?.is_pin_set ? "Set" : "Not Set"} />
            <InfoField
              label="Member Since"
              value={new Date(profile.date_joined).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            />
          </InfoSection>

          {/* KYC Documents Information */}
          <InfoSection title="KYC Documents" icon={FaCreditCard}>
            <InfoField label="Aadhar Number" value={profile.aadhar_number} />
            <InfoField label="PAN Number" value={profile.pan_number} />
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Document Verification Status:</p>
              <div className="flex items-center gap-2">
                {profile.aadhar_verified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    <FaCheckCircle /> Aadhar Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                    <FaTimesCircle /> Aadhar Not Verified
                  </span>
                )}
                {profile.pan_verified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    <FaCheckCircle /> PAN Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                    <FaTimesCircle /> PAN Not Verified
                  </span>
                )}
              </div>
            </div>
          </InfoSection>
        </div>
      </div>
    </div>
  );
}

// Profile Picture Section Component - ENHANCED DEBUGGING
const ProfilePictureSection = ({ profile, onUpdate }) => {
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setMessage("❌ Please select a valid image file (JPEG, PNG, GIF)");
      return;
    }

    if (file.size > maxSize) {
      setMessage("❌ Image size should be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      console.log("🔄 Step 1: Uploading image to upload-images endpoint...");
      console.log("📁 File details:", {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Step 1: Upload image to the images endpoint using FormData
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);

      // Make POST request to upload-images endpoint
      const uploadResponse = await postWithAuth("upload-images/", uploadFormData);
      console.log("🟢 Upload response:", uploadResponse);

      // Get the image URL from response
      const imageUrl = uploadResponse.image || uploadResponse.image_url;

      if (!imageUrl) {
        console.error("❌ No image URL in response:", uploadResponse);
        throw new Error("No image URL returned from server");
      }

      console.log("🔄 Step 2: Updating profile with image URL:", imageUrl);

      // Step 2: Update user profile with the image URL using PATCH
      const updateData = {
        profile_picture: imageUrl
      };

      console.log("🔄 Update data:", updateData);

      const updateResponse = await patchWithAuth("users/update_profile/", updateData);
      console.log("🟢 Profile update response:", updateResponse);

      setMessage("✅ Profile picture updated successfully!");

      setTimeout(() => {
        if (typeof onUpdate === "function") {
          onUpdate();
        }
      }, 500);


    } catch (error) {
      console.error("🔴 Profile picture upload error:", error);
      setMessage(`❌ Failed to upload profile picture: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="text-center">
      <div className="relative inline-block">
        <img
          src={
            !imgError && profile.profile_picture
              ? profile.profile_picture
              : "/default-avatar.png"
          }
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover shadow-lg"
          onError={() => setImgError(true)}
        />


        <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-3 cursor-pointer hover:bg-blue-600 transition-all shadow-md">
          {uploading ? (
            <FaSpinner className="text-white text-base animate-spin" />
          ) : (
            <FaCamera className="text-white text-base" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

// Quick Stats Component
const QuickStats = ({ profile }) => {
  const kycProgress = calculateKYCProgress(profile);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow-lg p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">₹{profile.wallet?.balance || '0.00'}</div>
        <div className="text-sm text-gray-600">Wallet Balance</div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{kycProgress}%</div>
        <div className="text-sm text-gray-600">KYC Progress</div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 text-center">
        <div className="text-2xl font-bold text-purple-600">
          {profile.wallet?.is_pin_set ? "✓" : "✗"}
        </div>
        <div className="text-sm text-gray-600">PIN Status</div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 text-center">
        <div className="text-2xl font-bold text-orange-600">
          {profile.bank_name ? "✓" : "✗"}
        </div>
        <div className="text-sm text-gray-600">Bank Added</div>
      </div>
    </div>
  );
};

// Info Section Component
const InfoSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="text-blue-500 text-xl" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

// Info Field Component
const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 min-h-[42px] flex items-center">
      {value || <span className="text-gray-400">Not provided</span>}
    </div>
  </div>
);

// Loading Component
const ProfileLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading your profile...</p>
    </div>
  </div>
);

// Error State Component
const ErrorState = ({ onRetry }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center max-w-md">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Profile</h2>
      <p className="text-gray-600 mb-6">We couldn't load your profile information. Please check your connection and try again.</p>
      <button
        onClick={onRetry}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Utility Function
const calculateKYCProgress = (profile) => {
  const requiredFields = [
    'first_name', 'last_name', 'phone_number', 'aadhar_number',
    'pan_number', 'date_of_birth', 'address', 'city', 'state', 'pincode',
    'bank_name', 'account_number', 'ifsc_code', 'account_holder_name'
  ];

  const completedFields = requiredFields.filter(field =>
    profile[field] && String(profile[field]).trim()
  ).length;

  return Math.round((completedFields / requiredFields.length) * 100);
};