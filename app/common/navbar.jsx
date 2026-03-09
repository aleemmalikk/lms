"use client";

import { useState, useRef, useEffect } from "react";
import {
  FaWallet,
  FaShareAlt,
  FaBell,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaUser,
  FaKey,
  FaLock,
  FaSignOutAlt
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { BASE_URL } from "@/app/lib/api";

export default function Navbar({ onMenuToggle, isSidebarOpen }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const [aepsBalance, setAepsBalance] = useState("0.00");


  // 🪙 Fetch Wallet Balance Function
  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.warn("Missing token");
        return;
      }

      const response = await axios.get(`${BASE_URL}wallets/balance/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Wallet Balance API Response:", response.data);

      if (response.data.balance !== undefined) {
        setWalletBalance(response.data.balance);
      } else {
        setWalletBalance(0);
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
      setWalletBalance(0);
    }
  };


  const fetchAEPSBalance = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`${BASE_URL}merchants/wallet_balance/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_id_type: "mobile_number",
          customer_id: "9212094999",
          user_code: "38130001",
        }),
      });

      const data = await response.json();
      if (data.status === 0) {
        setAepsBalance(data.data.balance);
        localStorage.setItem("aeps_balance", data.data.balance);
      }
    } catch (error) {
      console.error("AEPS Error:", error);
    }
  };

  useEffect(() => {
    // first time navbar load
    fetchWalletBalance();

    const handleWalletRefresh = () => {
      console.log("🔔 Wallet refresh event received");
      fetchWalletBalance();
    };

    window.addEventListener("wallet:refresh", handleWalletRefresh);

    return () => {
      window.removeEventListener("wallet:refresh", handleWalletRefresh);
    };
  }, []);


  useEffect(() => {
    if (canViewAEPS(userProfile?.role)) {
      fetchAEPSBalance();
    }
  }, [userProfile]);



  // ✅ Global function for payment pages
  useEffect(() => {
    window.refreshNavbarWallet = () => {
      fetchWalletBalance();
    };
  }, []);

  // 🔒 Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 👤 Fetch User Profile Data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          console.warn("No access token found");
          return;
        }

        const response = await axios.get(`${BASE_URL}users/my_profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("User Profile API Response:", response.data);
        setUserProfile(response.data);

        // Store user data in localStorage for quick access
        localStorage.setItem('user_profile', JSON.stringify(response.data));

      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Try to get from localStorage as fallback
        const cachedProfile = localStorage.getItem('user_profile');
        if (cachedProfile) {
          setUserProfile(JSON.parse(cachedProfile));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Get user display name
  const getDisplayName = () => {
    if (!userProfile) return "User";

    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }

    return userProfile.username || "User";
  };

  // Get user role with proper capitalization
  const getDisplayRole = () => {
    if (!userProfile?.role) return "";

    return userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1);
  };

  const hasBasicProfile = userProfile && (
    userProfile.first_name ||
    userProfile.last_name ||
    userProfile.phone_number
  );


  const canViewAEPS = (role) => {
    return role === "admin";
  };


  return (
    <div className="
  bg-gradient-to-r
  from-[#0f172a]
  via-[#1e3a8a]
  to-[#2563eb]
  backdrop-blur-md
  shadow-lg
">

      <div className="flex justify-between items-center px-2 sm:px-1  py-1 h-[60px]">
        {/* Left Section - Hamburger Menu */}
        <div className="relative hidden md:flex items-center">
          {/* ARROW CARD */}
          <div
            className="
      relative flex items-center gap-4
      px-4 py-1
      bg-white/15 backdrop-blur-md
      text-white
      rounded-l-xl
      shadow-lg
      before:content-['']
      before:absolute
      before:right-[-26px]
      before:top-0
      before:w-0
      before:h-0
      before:border-t-[24px]
      before:border-b-[24px]
      before:border-l-[26px]
      before:border-t-transparent
      before:border-b-transparent
      before:border-l-white/15
    "
          >

            <button
              onClick={onMenuToggle}
              className="flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-white/10
        hover:bg-white/20
        transition"
              title="Toggle Sidebar"
            >
              ☰
            </button>

            {/* WELCOME TEXT */}
            <p className="text-lg font-semibold flex items-center gap-2 whitespace-nowrap">
              <span className="opacity-80">Welcome</span>

              <span className="text-blue-500 font-bold">
                {getDisplayName()}
              </span>

              {userProfile?.role_uid && (
                <span className="px-2 py-0.5 text-sm font-semibold bg-black/20 rounded-md">
                  ID : {userProfile.role_uid.toUpperCase()}
                </span>
              )}
            </p>
          </div>
        </div>


        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 💰 Wallet Button */}
          {/* <button
            onClick={() => router.push("/wallet")}
            className="flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-[#033483] to-[#6DDC01] text-white px-2.5 sm:px-3 py-1.5 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm shadow-md"
          >
            <FaWallet className="text-base" />
            <span className="font-semibold">
              ₹{walletBalance !== null ? walletBalance.toFixed(2) : "0.00"}
            </span>
          </button> */}

          {canViewAEPS(userProfile?.role) && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-lg">
              <FaWallet className="w-4 h-4 text-yellow-300" />
              <span>
                ₹{parseFloat(aepsBalance || "0.00").toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}


          {/* 🤝 Refer to Friend */}
          {/* <button
            onClick={() => router.push("/refer")}
            className="hidden sm:flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-[#033483] to-[#6DDC01] text-white px-3 py-1.5 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 shadow-md"
          >
            <FaShareAlt className="text-base" />
            <span className="font-semibold text-sm">Refer to Friend</span>
          </button> */}

          {/* 🔔 Notifications */}
          <div className="relative cursor-pointer group">
            <div className="p-1.5 rounded-lg hover:bg-[#022b63]/60 transition-all duration-200">
              <FaBell className="text-white text-lg group-hover:text-[#6DDC01] transition-colors" />
            </div>
            <span className="absolute -top-1 -right-1 bg-[#6DDC01] text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-semibold shadow-sm">
              2
            </span>
          </div>

          {/* 👤 Profile Section */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 cursor-pointer group p-1 rounded-lg hover:bg-[#022b63]/60 transition-all duration-200"
            >
              <div className="relative w-5 h-5 sm:w-7 sm:h-7">
                {userProfile?.profile_picture ? (
                  <Image
                    src={userProfile.profile_picture}
                    alt="User Profile"
                    width={28}
                    height={28}
                    className="rounded-full object-cover border border-[#6DDC01] group-hover:border-white transition-colors"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-[#033483] to-[#6DDC01] flex items-center justify-center border border-[#6DDC01] group-hover:border-white transition-colors">
                    <span className="text-white font-semibold text-xs">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <FaChevronDown
                className={`text-white text-xs transition-all duration-300 ${isProfileOpen ? "rotate-180 text-[#6DDC01]" : "group-hover:text-[#6DDC01]"
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-1 w-60 bg-[#033483] text-white rounded-xl shadow-xl border border-[#022b63] animate-fadeIn z-50 backdrop-blur-sm overflow-hidden">
                <div className="p-1.5 flex flex-col gap-1">
                  {/* User Info Header */}
                  <div className="px-3 py-2 border-b border-[#022b63] bg-gradient-to-r from-[#033483] to-[#6DDC01]/30">
                    <div className="flex items-center gap-2 mb-1.5">
                      {userProfile?.profile_picture ? (
                        <Image
                          src={userProfile.profile_picture}
                          alt="User Profile"
                          width={32}
                          height={32}
                          className="rounded-full object-cover border border-[#6DDC01]"
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#033483] to-[#6DDC01] flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {getDisplayName().charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold truncate">{getDisplayName()}</p>
                        <p className="text-[12px] text-gray-200 truncate">
                          {userProfile?.email || "No email provided"}
                        </p>
                      </div>
                    </div>
                    {!hasBasicProfile && (
                      <span className="bg-yellow-300 text-black px-1.5 py-0.5 rounded-full text-[10px]">
                        Profile Incomplete
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      router.push("/dmt/onboarding");
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#022b63]/60 rounded-lg flex items-center gap-2 group transition-all duration-200"
                  >
                    <FaUser className="text-[#6DDC01] text-sm group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-medium text-base">Onboarding KYC</div>
                      <div className="text-sm text-gray-200">Start money transfer KYC</div>
                    </div>
                  </button>

                  {/* Menu Items */}
                  <button
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#022b63]/60 rounded-lg flex items-center gap-2 group transition-all duration-200"
                    onClick={() => {
                      router.push("/profile");
                      setIsProfileOpen(false);
                    }}
                  >
                    <FaUser className="text-[#6DDC01] text-sm group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-medium text-base">My Profile</div>
                      <div className="text-sm text-gray-200">View and edit profile</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      router.push("/login/resetpassword");
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#022b63]/60 rounded-lg flex items-center gap-2 group transition-all duration-200"
                  >
                    <FaKey className="text-[#6DDC01] text-sm group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-medium text-base">Reset Password</div>
                      <div className="text-sm text-gray-200">Change your password</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      router.push("/wallet/resetpin");
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#022b63]/60 rounded-lg flex items-center gap-2 group transition-all duration-200"
                  >
                    <FaLock className="text-[#6DDC01] text-sm group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-medium text-base">Reset PIN</div>
                      <div className="text-sm text-gray-200">Change wallet PIN</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      router.push("/wallet/forgetpin");
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#022b63]/60 rounded-lg flex items-center gap-2 group transition-all duration-200"
                  >
                    <FaKey className="text-[#6DDC01] text-sm group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-medium text-base">Forget PIN</div>
                      <div className="text-sm text-gray-200">Reset wallet PIN</div>
                    </div>
                  </button>

                  {/* Logout Button */}
                  <div className="border-t border-[#022b63] mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-900/40 rounded-lg flex items-center gap-2 group transition-all duration-200"
                    >
                      <FaSignOutAlt className="text-sm group-hover:scale-110 transition-transform" />
                      <span className="font-medium text-base">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}