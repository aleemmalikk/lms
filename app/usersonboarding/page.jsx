"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useWallet } from "../context/walletcontext";
import {
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaUsers,
  FaUserShield,
  FaUserTie,
  FaStore,
  FaShoppingCart,
  FaFilter,
  FaExclamationTriangle,
  FaCalendar,
  FaIdCard,
  FaPlusCircle,
  FaMinusCircle,
  FaCheck,
} from "react-icons/fa";
import { BASE_URL } from "../lib/api";

export default function UsersOnboardingPage() {
  const { walletBalance, updateWalletBalance } = useWallet();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [canCreateUsers, setCanCreateUsers] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [walletPin, setWalletPin] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [hierarchyStats, setHierarchyStats] = useState({
    total: 0,
    master: 0,
    dealer: 0,
    retailer: 0,
  });
  const [showMoneyModal, setShowMoneyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactionType, setTransactionType] = useState("add");
  const [amount, setAmount] = useState("");
  const [transactionLoading, setTransactionLoading] = useState(false);
  const router = useRouter();
  const [adminBalance, setAdminBalance] = useState("0.00");
  const [notes, setNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [popupAmount, setPopupAmount] = useState("");

  useEffect(() => {
    checkPermissionsAndFetchUsers();
    fetchAdminBalance();
  }, []);

  useEffect(() => {
    filterUsers();
    setCurrentPage(1);
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    calculateHierarchyStats();
  }, [users]);

  const checkPermissionsAndFetchUsers = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    setCurrentUserRole(userRole);
    setCurrentUserId(userId);
    setCanCreateUsers(userRole !== "retailer");
    fetchUsers();
  };

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  useEffect(() => {
    if (showErrorPopup) {
      const timer = setTimeout(() => {
        setShowErrorPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorPopup]);

  const fetchUsers = async () => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("userRole"); // 🔥 FIX

    const res = await fetch(`${BASE_URL}user-hierarchy/my_hierarchy/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    let list = [];

    if (data.created_users && Array.isArray(data.created_users)) {
      list = data.created_users;
    } else if (data.users && Array.isArray(data.users)) {
      list = data.users;
    }

    const users = list.map((u) => ({
      id: u.id,
      public_id: u.role_uid,
      username: u.username,
      role: u.role,

      first_name: u.first_name,
      last_name: u.last_name,
      phone_number: u.phone_number,
      email: u.email,
      pan_number: u.pan_number,
      date_of_birth: u.date_of_birth,
      pincode: u.pincode,
      employment_type: u.employment_type,
      monthly_income: u.monthly_income,

      wallet: {
        balance: u.wallet?.balance || "0",
      },
    }));

    setUsers(users);
    setFilteredUsers(users);
    setLoading(false);
  };

  const filterUsers = () => {
    if (!users || users.length === 0) {
      setFilteredUsers([]);
      return;
    }

    let filtered = [...users];

    filtered = filtered.filter(
      (user) => user.id.toString() !== currentUserId.toString(),
    );

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (user) =>
          (user.username && user.username.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term)) ||
          user.public_id?.toLowerCase().includes(term) ||
          (user.phone_number && user.phone_number.includes(searchTerm)) ||
          (user.created_by_username &&
            user.created_by_username.toLowerCase().includes(term)),
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const paginatedUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const calculateHierarchyStats = () => {
    const stats = {
      total: users.length,
      master: users.filter((user) => user.role === "master").length,
      dealer: users.filter((user) => user.role === "dealer").length,
      retailer: users.filter((user) => user.role === "retailer").length,
    };

    setHierarchyStats(stats);
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      superadmin: "bg-purple-100 text-purple-800 border border-purple-200",
      admin: "bg-red-100 text-red-800 border border-red-200",
      master: "bg-blue-100 text-blue-800 border border-blue-200",
      dealer: "bg-green-100 text-green-800 border border-green-200",
      retailer: "bg-orange-100 text-orange-800 border border-orange-200",
    };

    const roleNames = {
      superadmin: "Super Admin",
      admin: "Admin",
      master: "Master",
      dealer: "Dealer",
      retailer: "Retailer",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${roleStyles[role]}`}
      >
        {roleNames[role]}
      </span>
    );
  };

  const getRoleIcon = (role) => {
    const icons = {
      superadmin: <FaUserShield className="w-5 h-5" />,
      admin: <FaUserTie className="w-5 h-5" />,
      master: <FaUserTie className="w-5 h-5" />,
      dealer: <FaStore className="w-5 h-5" />,
      retailer: <FaShoppingCart className="w-5 h-5" />,
    };
    return icons[role] || <FaUsers className="w-5 h-5" />;
  };

  const getAvailableRolesForFilter = () => {
    const roles = users.map((user) => user.role);
    const uniqueRoles = [...new Set(roles)];

    const roleNames = {
      superadmin: "Super Admin",
      admin: "Admin",
      master: "Master",
      dealer: "Dealer",
      retailer: "Retailer",
    };

    return [
      { value: "all", label: "All Roles" },
      ...uniqueRoles.map((role) => ({
        value: role,
        label: roleNames[role] || role,
      })),
    ];
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const { id, username, role } = userToDelete;

    if (!canDeleteUser(role, id)) {
      setSuccessMessage("You don't have permission to delete this user");
      setShowErrorPopup(true);
      setShowDeletePopup(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}users/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));

        setSuccessMessage(`User "${username}" deleted successfully`);
        setShowSuccessPopup(true);
      } else {
        const data = await res.json();
        setSuccessMessage(extractErrorMessage(data, "Failed to delete user"));
        setShowErrorPopup(true);
      }
    } catch (err) {
      setSuccessMessage("Error deleting user. Please try again.");
      setShowErrorPopup(true);
    } finally {
      setShowDeletePopup(false);
      setUserToDelete(null);
    }
  };

  // https://chatgpt.com/c/697101db-aeac-8321-a9f2-9b808915bed0

  const extractErrorMessage = (data, fallback = "Something went wrong") => {
    if (!data || typeof data !== "object") return fallback;

    const firstKey = Object.keys(data)[0];
    const value = data[firstKey];

    if (Array.isArray(value)) return value[0];
    if (typeof value === "string") return value;

    return fallback;
  };

  const handleConfirmWithPin = async () => {
    if (!walletPin) {
      setSuccessMessage("Please enter wallet PIN");
      setShowErrorPopup(true);
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setSuccessMessage("Please enter a valid amount");
      setShowErrorPopup(true);
      return;
    }

    setTransactionLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setSuccessMessage("Session expired. Please login again.");
        setShowErrorPopup(true);
        return;
      }

      const transactionData = {
        user_id: selectedUser.id,
        amount: parseFloat(amount),
        transaction_type: transactionType === "add" ? "credit" : "debit",
        pin: walletPin,
        notes:
          notes ||
          `${transactionType === "add" ? "Added" : "Deducted"} money by ${localStorage.getItem("username") || "Admin"}`,
      };

      const res = await fetch(`${BASE_URL}wallets/direct_transfer/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = extractErrorMessage(data, "Transaction failed");
        setSuccessMessage(errorMsg);
        setShowErrorPopup(true);
        setShowPinModal(false);
        return;
      }

      if (data.admin_balance !== undefined && data.admin_balance !== null) {
        updateWalletBalance(data.admin_balance);
        setAdminBalance(data.admin_balance);
      }

      setSuccessMessage(
        `${transactionType === "add" ? "Successfully added" : "Successfully deducted"} ₹${parseFloat(amount).toLocaleString("en-IN")}\n` +
          `User Balance: ₹${parseFloat(data.user_balance).toLocaleString("en-IN")}\n` +
          `Your Balance: ₹${parseFloat(data.admin_balance).toLocaleString("en-IN")}`,
      );
      setPopupAmount(amount);
      setShowSuccessPopup(true);

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === selectedUser.id
            ? { ...u, wallet: { ...u.wallet, balance: data.user_balance } }
            : u,
        ),
      );

      setAdminBalance(data.admin_balance);

      setWalletPin("");
      setNotes("");
      setAmount("");
      setTimeout(() => {
        setShowPinModal(false);
        setShowMoneyModal(false);
        setSelectedUser(null);
      }, 1000);
    } catch (err) {
      setSuccessMessage(err?.message || "Transaction error. Please try again.");
      setShowErrorPopup(true);
      setShowPinModal(false);
    } finally {
      setTransactionLoading(false);
    }
  };

  const canDeleteUser = (userRole, userId) => {
    if (userId.toString() === currentUserId.toString()) return false;

    const roleOrder = ["superadmin", "admin", "master", "dealer", "retailer"];

    const currentIndex = roleOrder.indexOf(currentUserRole);
    const targetIndex = roleOrder.indexOf(userRole);

    return targetIndex > currentIndex;
  };

  const canManageWallet = (userRole, userId) => {
    if (userId.toString() === currentUserId.toString()) {
      return false;
    }

    const roleHierarchy = [
      "superadmin",
      "admin",
      "master",
      "dealer",
      "retailer",
    ];
    const currentUserIndex = roleHierarchy.indexOf(currentUserRole);
    const targetUserIndex = roleHierarchy.indexOf(userRole);

    return targetUserIndex > currentUserIndex;
  };

  const getRoleName = (roleValue) => {
    const roleNames = {
      superadmin: "Super Admin",
      admin: "Admin",
      master: "Master",
      dealer: "Dealer",
      retailer: "Retailer",
      all: "All Roles",
    };
    return roleNames[roleValue] || roleValue;
  };

  const handleMoneyTransactionClick = (user, type) => {
    setSelectedUser(user);
    setTransactionType(type);
    setAmount("");
    setShowMoneyModal(true);
  };

  const fetchAdminBalance = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}wallets/balance/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminBalance(data.balance);
      }
    } catch (e) {
      console.error("Failed to fetch admin balance");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112772] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {showDeletePopup && userToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 border"
          >
            <div className="flex items-start">
              <FaTrash className="w-6 h-6 text-red-600 mt-1" />
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Delete
                </h3>
                <p className="mt-2 text-gray-700">
                  Are you sure you want to delete user
                  <span className="font-semibold text-red-600">
                    {" "}
                    {userToDelete.username}
                  </span>
                  ?
                  <br />
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeletePopup(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showErrorPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl shadow-lg max-w-md w-full p-6"
          >
            <div className="flex items-start">
              <FaExclamationTriangle className="w-6 h-6 text-red-600 mt-1" />
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800">
                  Transaction Failed
                </h3>
                <p className="mt-2 text-red-700 whitespace-pre-line">
                  {successMessage}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowErrorPopup(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-xl shadow-lg max-w-md w-full p-6"
          >
            <div className="flex items-start">
              <FaCheck className="w-6 h-6 text-green-600 mt-1" />
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-green-800">
                  Success
                </h3>
                <p className="mt-2 text-green-700">{successMessage}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#112772] rounded-xl">
                <FaUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Users Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage users based on your role:{" "}
                  <span className="font-medium text-[#112772]">
                    {currentUserRole}
                  </span>
                </p>
              </div>
            </div>

            {/* <div className="flex gap-3">
              {canCreateUsers && (
                <Link
                  href="/usersonboarding/add"
                  className="bg-[#112772] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors flex items-center"
                >
                  <FaUserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Link>
              )}
            </div> */}
          </div>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        > */}
        {/* <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{hierarchyStats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FaUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div> */}
        {/* 
          {['master', 'dealer', 'retailer'].map(role => {
            const count = hierarchyStats[role];
            const roleColors = {
              'master': 'bg-blue-50 text-blue-600',
              'dealer': 'bg-green-50 text-green-600',
              'retailer': 'bg-orange-50 text-orange-600'
            };

            const roleNames = {
              'master': 'Masters',
              'dealer': 'Dealers',
              'retailer': 'Retailers'
            };

            return (
              <div key={role} className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{roleNames[role]}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div className={`p-3 ${roleColors[role]} rounded-lg`}>
                    {getRoleIcon(role)}
                  </div>
                </div>
              </div>
            );
          })} */}

        {/* <div className="bg-[#112772] rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Your Role</p>
                <p className="text-2xl font-bold text-white">{currentUserRole}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FaUserShield className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div> */}

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by username, email or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400 w-4 h-4" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#112772] focus:border-transparent min-w-[140px]"
                  disabled={loading}
                >
                  {getAvailableRolesForFilter().map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Money Transaction Modal - Now positioned inside the content area */}
        {showMoneyModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            {/* Semi-transparent overlay - NO BLACK BACKGROUND */}
            <div
              className="absolute inset-0 bg-gray-500/30 backdrop-blur-sm"
              onClick={() => setShowMoneyModal(false)}
            />

            {/* Modal content */}
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    {transactionType === "add" ? "Add Money" : "Deduct Money"}
                  </h3>
                  <button
                    onClick={() => setShowMoneyModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#112772] flex items-center justify-center text-white font-bold">
                      {selectedUser.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-blue-600">
                        {selectedUser.username}
                      </div>
                      <div className="text-sm text-gray-600">
                        Current Balance: ₹
                        {parseFloat(
                          selectedUser.wallet?.balance || "0",
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-blue-700 font-medium">
                  Your Balance: ₹{parseFloat(adminBalance || "0").toFixed(2)}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772] focus:border-transparent"
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                    autoFocus
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Reason)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 text-gray-500 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772]"
                    placeholder="Reason for adding/deducting money"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowMoneyModal(false)}
                    className="flex-1 px-4 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={transactionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowPinModal(true)}
                    className={`flex-1 px-4 py-1 rounded-lg text-white transition-colors flex items-center justify-center ${
                      transactionType === "add"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-amber-600 hover:bg-amber-700"
                    }`}
                    disabled={transactionLoading}
                  >
                    {transactionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : transactionType === "add" ? (
                      <>
                        <FaPlusCircle className="w-4 h-4 mr-2" />
                        Add Money
                      </>
                    ) : (
                      <>
                        <FaMinusCircle className="w-4 h-4 mr-2" />
                        Deduct Money
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showPinModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowPinModal(false)}
            />

            <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900">
                Enter Wallet PIN
              </h3>

              <input
                type="password"
                value={walletPin}
                onChange={(e) => setWalletPin(e.target.value)}
                maxLength={6}
                className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772]"
                placeholder="Enter 6-digit PIN"
                autoFocus
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setWalletPin("");
                    setShowPinModal(false);
                  }}
                  className="flex-1 border px-4 py-2 text-black rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmWithPin}
                  className="flex-1 bg-[#112772] text-white px-4 py-2 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
        >
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <FaExclamationTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600 mb-4">
                {users.length === 0
                  ? "No users in your hierarchy yet."
                  : `No ${getRoleName(roleFilter).toLowerCase()} users match your search criteria.`}
              </p>
              {canCreateUsers && users.length === 0 && (
                <Link
                  href="/usersonboarding/add"
                  className="bg-[#112772] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors inline-flex items-center"
                >
                  <FaUserPlus className="w-4 h-4 mr-2" />
                  Add First User
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Full Name
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Mobile Number
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      PAN No
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      DOB
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Pincode
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Employment
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Monthly Income
                    </th>

                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user, index) => {
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        {/* ID */}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.role_uid || user.id}
                        </td>

                        {/* Full Name */}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.first_name || ""} {user.last_name || ""}
                        </td>

                        {/* Mobile */}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.phone_number || "—"}
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.email || "—"}
                        </td>

                        {/* PAN */}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.pan_number || "—"}
                        </td>

                        {/* DOB */}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.date_of_birth || "—"}
                        </td>

                        {/* Pincode */}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.pincode || "—"}
                        </td>

                        {/* Employment */}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.employment_type || "—"}
                        </td>

                        {/* Monthly Income */}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.monthly_income || "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                router.push(`/usersonboarding/${user.id}`)
                              }
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg"
                              title="View"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                router.push(`/usersonboarding/${user.id}/edit`)
                              }
                              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg"
                              title="Edit"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeletePopup(true);
                              }}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstUser + 1}–
                    {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                    {filteredUsers.length}
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className={`px-3 py-1 rounded-lg border text-sm ${
                        currentPage === 1
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          currentPage === i + 1
                            ? "bg-[#112772] text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className={`px-3 py-1 rounded-lg border text-sm ${
                        currentPage === totalPages
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
