"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BASE_URL } from '@/app/lib/api';

import { 
  FaUserShield, 
  FaUser, 
  FaSave, 
  FaSearch, 
  FaCheck, 
  FaTimes,
  FaExclamationTriangle,
  FaUsers,
  FaKey,
  FaEye,
  FaPlus,
  FaTrash,
  FaFilter,
  FaCheckSquare,
  FaSquare
} from "react-icons/fa";

export default function PermissionsPage() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const isSectionSelected = (appLabel) => {
    const sectionPermissions = permissions.filter(p => p.app_label === appLabel);
    const currentSectionIds = new Set(userPermissions.filter(p => p.app_label === appLabel).map(p => p.id));
    return sectionPermissions.length > 0 && sectionPermissions.every(p => currentSectionIds.has(p.id));
  };

  const isSectionPartial = (appLabel) => {
    const sectionPermissions = permissions.filter(p => p.app_label === appLabel);
    const currentSectionIds = new Set(userPermissions.filter(p => p.app_label === appLabel).map(p => p.id));
    return currentSectionIds.size > 0 && currentSectionIds.size < sectionPermissions.length;
  };

  const isAllSelected = () => {
    return permissions.length > 0 && userPermissions.length === permissions.length;
  };

  const isPartialSelected = () => {
    return userPermissions.length > 0 && userPermissions.length < permissions.length;
  };

  const selectSectionPermissions = (appLabel) => {
    const sectionPermissions = permissions.filter(p => p.app_label === appLabel);
    const currentSectionIds = new Set(userPermissions.filter(p => p.app_label === appLabel).map(p => p.id));
    
    if (sectionPermissions.every(p => currentSectionIds.has(p.id))) {
      setUserPermissions(prev => prev.filter(p => p.app_label !== appLabel));
    } else {
      const otherPermissions = userPermissions.filter(p => p.app_label !== appLabel);
      setUserPermissions([...otherPermissions, ...sectionPermissions]);
    }
  };

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserPermissions(selectedUser.id);
    }
  }, [selectedUser]);

  const checkAuthAndFetchData = async () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");
    
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!['superadmin', 'admin'].includes(userRole)) {
      setError("You don't have permission to manage permissions");
      setLoading(false);
      return;
    }

    await fetchUsers();
    await fetchAllPermissions();
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}users/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (res.ok) {
        const usersData = await res.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users");
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}permissions/all_permissions/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (res.ok) {
        const permissionsData = await res.json();
        setPermissions(permissionsData);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setError("Failed to fetch permissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}permissions/user_permissions/?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUserPermissions(data.user_permissions || []);
      }
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      setError("Failed to fetch user permissions");
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setUserPermissions(prev => {
      const isSelected = prev.some(p => p.id === permissionId);
      if (isSelected) {
        return prev.filter(p => p.id !== permissionId);
      } else {
        const permission = permissions.find(p => p.id === permissionId);
        return [...prev, permission];
      }
    });
  };

  const selectAllPermissions = () => {
    setUserPermissions([...permissions]);
  };

  const clearAllPermissions = () => {
    setUserPermissions([]);
  };

  const saveUserPermissions = async () => {
    if (!selectedUser) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("accessToken");
      const permissionIds = userPermissions.map(p => p.id);

      const res = await fetch(`${BASE_URL}permissions/assign_user_permissions/`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          permission_ids: permissionIds
        })
      });

      if (res.ok) {
        setSuccess(`Permissions updated successfully for ${selectedUser.username}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update permissions");
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      setError("Error saving permissions");
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      'superadmin': 'bg-purple-100 text-purple-800 border-purple-200',
      'admin': 'bg-red-100 text-red-800 border-red-200',
      'master': 'bg-blue-100 text-blue-800 border-blue-200',
      'dealer': 'bg-green-100 text-green-800 border-green-200',
      'retailer': 'bg-orange-100 text-orange-800 border-orange-200'
    };

    const roleNames = {
      'superadmin': 'Super Admin',
      'admin': 'Admin',
      'master': 'Master',
      'dealer': 'Dealer',
      'retailer': 'Retailer'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${roleStyles[role]}`}>
        {roleNames[role]}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const appLabel = permission.app_label;
    if (!acc[appLabel]) {
      acc[appLabel] = [];
    }
    acc[appLabel].push(permission);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112772]"></div>
      </div>
    );
  }

  if (error && !['superadmin', 'admin'].includes(localStorage.getItem("userRole"))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push("/")}
            className="bg-[#112772] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 py-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-[#112772] to-blue-600 rounded-xl">
                <FaUserShield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Permission Management</h1>
                <p className="text-gray-600 mt-2">
                  Manage user permissions and access controls
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center"
          >
            <FaExclamationTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center"
          >
            <FaCheck className="w-5 h-5 mr-3 flex-shrink-0" />
            {success}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Users List */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaUsers className="w-5 h-5 mr-2 text-[#112772]" />
                  Users
                </h3>
              </div>

              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112772] focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-400 w-4 h-4" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#112772] focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="master">Master</option>
                    <option value="dealer">Dealer</option>
                    <option value="retailer">Retailer</option>
                  </select>
                </div>
              </div>

              {/* Users List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredUsers.map((user, index) => (
                  <motion.button
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left p-4 border-b border-gray-100 transition-colors ${
                      selectedUser?.id === user.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#112772] to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                        <div className="mt-1">
                          {getRoleBadge(user.role)}
                        </div>
                      </div>
                      {selectedUser?.id === user.id && (
                        <FaCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Permissions Panel */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              {!selectedUser ? (
                <div className="text-center py-12">
                  <FaUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a User
                  </h3>
                  <p className="text-gray-600">
                    Choose a user from the list to manage their permissions
                  </p>
                </div>
              ) : (
                <>
                  {/* User Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#112772] to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {selectedUser.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {selectedUser.username}
                          </h2>
                          <div className="flex items-center space-x-2 mt-1">
                            {getRoleBadge(selectedUser.role)}
                            <span className="text-sm text-gray-600">
                              {selectedUser.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Bulk Actions */}
                        <div className="flex items-center space-x-2 mr-4">
                          <button
                            onClick={selectAllPermissions}
                            className="flex items-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <FaCheckSquare className="w-4 h-4 mr-1" />
                            Select All
                          </button>
                          <button
                            onClick={clearAllPermissions}
                            className="flex items-center px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <FaSquare className="w-4 h-4 mr-1" />
                            Clear All
                          </button>
                        </div>
                        <button
                          onClick={saveUserPermissions}
                          disabled={saving}
                          className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
                            saving
                              ? "bg-gray-400 cursor-not-allowed text-white"
                              : "bg-[#112772] hover:bg-blue-900 text-white"
                          }`}
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave className="w-4 h-4 mr-2" />
                              Save Permissions
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Permissions List */}
                  <div className="p-6 max-h-96 overflow-y-auto">
                    <div className="space-y-6">
                      {Object.entries(groupedPermissions).map(([appLabel, appPermissions]) => {
                        const isSectionAllSelected = isSectionSelected(appLabel);
                        const isSectionPartialSelected = isSectionPartial(appLabel);
                        
                        return (
                          <div key={appLabel} className="border border-gray-200 rounded-lg">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900 uppercase text-sm">
                                {appLabel}
                              </h3>
                              <button
                                onClick={() => selectSectionPermissions(appLabel)}
                                className={`flex items-center space-x-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  isSectionAllSelected 
                                    ? 'bg-[#112772] text-white hover:bg-blue-900' 
                                    : isSectionPartialSelected
                                    ? 'bg-blue-100 text-[#112772] hover:bg-blue-200'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {isSectionAllSelected ? (
                                  <>
                                    <FaCheckSquare className="w-3 h-3" />
                                    <span>Deselect All</span>
                                  </>
                                ) : isSectionPartialSelected ? (
                                  <>
                                    <FaCheckSquare className="w-3 h-3" />
                                    <span>Select All</span>
                                  </>
                                ) : (
                                  <>
                                    <FaSquare className="w-3 h-3" />
                                    <span>Select All</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="p-4 space-y-2">
                              {appPermissions.map((permission) => {
                                const isSelected = userPermissions.some(p => p.id === permission.id);
                                return (
                                  <div
                                    key={permission.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3">
                                        <FaKey className="w-4 h-4 text-gray-400" />
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">
                                            {permission.name}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {permission.codename}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handlePermissionToggle(permission.id)}
                                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                        isSelected
                                          ? 'bg-[#112772] border-[#112772] text-white'
                                          : 'border-gray-300 hover:border-[#112772]'
                                      }`}
                                    >
                                      {isSelected && <FaCheck className="w-3 h-3" />}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {userPermissions.length} of {permissions.length} permissions selected
                        </span>
                        {isAllSelected() && (
                          <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                            All permissions selected
                          </span>
                        )}
                        {isPartialSelected() && (
                          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            Partial selection
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-[#112772]">
                        User ID: {selectedUser.id}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}



