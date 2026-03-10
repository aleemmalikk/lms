import axios from "axios";

export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.29.196:8000/apis/";
export const BASE_URL1 = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.29.196:8000/api/";
export const FILES_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.29.196:8000/";


function extractErrorMessage(error) {
  if (error.response?.data) {
    const data = error.response.data;

    if (typeof data === "string") return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.detail) return data.detail;

    if (typeof data === "object") {
      const firstKey = Object.keys(data)[0];
      if (Array.isArray(data[firstKey])) {
        return data[firstKey][0];
      }
      return JSON.stringify(data);
    }
  }

  if (error.request) return "Server not responding";
  return error.message || "Something went wrong";
}



export const getUserDataFromToken = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));
    return {
      user_id: decodedPayload.user_id,
      username: decodedPayload.username,
      role: decodedPayload.role,
      email: decodedPayload.email
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// In lib/api.js
export const searchBanks = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}dmt/banks/?search=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to fetch banks');
    return await response.json();
  } catch (error) {
    console.error('Error searching banks:', error);
    return [];
  }
};

// ✅ Backward compatibility - get only user ID
export const getUserIdFromToken = () => {
  const userData = getUserDataFromToken();
  return userData ? userData.user_id : null;
};

export const validateLoginAccess = (userRole) => {
  const allowedRoles = ['admin', 'dealer', 'master', 'retailer'];
  const normalizedRole = userRole?.toLowerCase();

  if (normalizedRole === 'superadmin') {
    return {
      allowed: false,
      redirectUrl: 'https://wikin-admin.vercel.app/',
      message: 'Superadmin should use the admin panel'
    };
  }

  if (!allowedRoles.includes(normalizedRole)) {
    return {
      allowed: false,
      redirectUrl: '/',
      message: 'Your role does not have permission to access this portal'
    };
  }

  return { allowed: true };
};

export const getUserRole = () => {
  if (typeof window === "undefined") return null;

  const userData = getUserDataFromToken();
  if (userData?.role) return userData.role;

  return localStorage.getItem("user_role") ||
    localStorage.getItem("userRole") ||
    localStorage.getItem("role");
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;

  const token = getAuthToken();
  const username = localStorage.getItem("username");
  const authStatus = localStorage.getItem("isAuthenticated");

  console.log('🔐 Authentication Check:', {
    hasToken: !!token,
    hasUsername: !!username,
    authStatus,
    tokenLength: token?.length
  });

  return !!token;
};

export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
};

export const storeAuthData = (tokenData) => {
  if (typeof window === 'undefined') return;

  localStorage.setItem("accessToken", tokenData.access);
  localStorage.setItem("refreshToken", tokenData.refresh);
  localStorage.setItem("userRole", tokenData.role);
  localStorage.setItem("userId", tokenData.user_id);
  localStorage.setItem("username", tokenData.username);
  localStorage.setItem("permissions", JSON.stringify(tokenData.permissions || []));
  localStorage.setItem("isAuthenticated", "true");
};

export const getAuthData = () => {
  if (typeof window === 'undefined') {
    return {
      accessToken: null,
      refreshToken: null,
      userRole: null,
      userId: null,
      username: null,
      permissions: [],
      isAuthenticated: false,
    };
  }

  return {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
    userRole: localStorage.getItem("userRole"),
    userId: localStorage.getItem("userId"),
    username: localStorage.getItem("username"),
    permissions: JSON.parse(localStorage.getItem("permissions") || "[]"),
    isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
  };
};

export const clearAuthData = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("permissions");
  localStorage.removeItem("isAuthenticated");
};

export const storeUserData = (response) => {
  if (typeof window === "undefined") return;

  const username = response.username || response.user?.username || localStorage.getItem("username");
  const accessToken = response.access_token || response.access;
  const refreshToken = response.refresh_token || response.refresh;
  const userRole = response.user?.role || response.role;
  const userId = response.user?.id || response.user_id;

  console.log('💾 Storing User Data:', {
    username,
    hasAccessToken: !!accessToken,
    userRole,
    userId
  });

  if (username) localStorage.setItem("username", username);
  if (accessToken) {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("accessToken", accessToken);
  }

  if (refreshToken) {
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  if (userRole) {
    localStorage.setItem("user_role", userRole);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("role", userRole);
  }

  if (userId) {
    localStorage.setItem("user_id", userId);
    localStorage.setItem("userId", userId);
  }

  if (response.user) {
    localStorage.setItem("user_data", JSON.stringify(response.user));
  }

  localStorage.setItem("isAuthenticated", "true");

  console.log('✅ User data stored successfully');
};

export const logout = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("username");
  localStorage.removeItem("user_data");
  localStorage.removeItem("otp_token");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_role");

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");
  localStorage.removeItem("permissions");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("wallet_balance");

  window.location.href = "/";
};


export async function post(endpoint, body, requireAuth = false) {
  try {
    const response = requireAuth
      ? await postWithAuth(endpoint, body)
      : await axios.post(`${BASE_URL}${endpoint}`, body, {
        headers: { "Content-Type": "application/json" },
      });

    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    console.error("POST Error:", message);
    throw new Error(message);
  }
}


export const patchWithAuth = async (url, data, config = {}) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const isFormData = data instanceof FormData;

    const headers = {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...config.headers,
    };

    console.log("🔵 PATCH Request:", {
      url: `${BASE_URL}${url}`,
      method: "PATCH",
      headers,
      body: isFormData ? "FormData" : data,
    });

    const response = await fetch(`${BASE_URL}${url}`, {
      method: "PATCH",
      headers,
      body: isFormData ? data : JSON.stringify(data),
      ...config,
    });

    console.log("🟢 PATCH Response Status:", response.status, response.statusText);

    const responseClone = response.clone();

    if (!response.ok) {
      let errorData;
      try {
        errorData = await responseClone.json();
      } catch (e) {
        try {
          errorData = await response.text();
        } catch (textError) {
          errorData = `Failed to parse error response: ${textError.message}`;
        }
      }

      console.error("🔴 PATCH Error:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      if (response.status === 401) {
        logout();
        throw new Error("Session expired. Please login again.");
      }

      throw new Error(
        errorData.detail ||
        errorData.message ||
        errorData.error ||
        `HTTP error! status: ${response.status}`
      );
    }

    const responseData = await response.json();
    console.log("🟢 PATCH Success:", responseData);
    return responseData;
  } catch (error) {
    console.error("🔴 PATCH Request Failed:", error);
    throw error;
  }
};





export async function postWithAuth(endpoint, body, config = {}) {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const isFormData = body instanceof FormData;

    const headers = {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...config.headers,
    };

    console.log("🔵 POST Request:", {
      url: `${BASE_URL}${endpoint}`,
      method: "POST",
      headers,
      body: isFormData ? "FormData" : body,
    });

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: isFormData ? body : JSON.stringify(body),
      ...config,
    });

    console.log("🟢 POST Response Status:", response.status, response.statusText);

    const responseClone = response.clone();

    if (!response.ok) {
      let errorData;
      try {
        errorData = await responseClone.json();
      } catch (e) {
        try {
          errorData = await response.text();
        } catch (textError) {
          errorData = `Failed to parse error response: ${textError.message}`;
        }
      }

      console.error("🔴 POST Error:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      if (response.status === 401) {
        logout();
        throw new Error("Session expired. Please login again.");
      }

      throw new Error(
        errorData.detail ||
        errorData.message ||
        errorData.error ||
        `HTTP error! status: ${response.status}`
      );
    }

    const responseData = await response.json();
    console.log("🟢 POST Success:", responseData);
    return responseData;
  } catch (error) {
    console.error("🔴 POST Request Failed:", error);
    throw error;
  }
}

export async function getWithAuth(endpoint) {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      logout();
      throw new Error("Session expired. Please login again.");
    }

    const message = extractErrorMessage(error);
    console.error("GET Error:", message);
    throw new Error(message);
  }
}


export async function getCategories(token) {
  try {
    const authToken = token || getAuthToken();
    const response = await axios.get(`${BASE_URL}services/categories/`, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    console.error("getCategories Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
}

export async function getSubCategories(token, catId) {
  try {
    const authToken = token || getAuthToken();
    const url = catId
      ? `${BASE_URL}services/subcategories/?category=${catId}`
      : `${BASE_URL}services/subcategories/`;
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    console.error("getSubCategories Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch subcategories"
    );
  }
}

export async function getWallet(token) {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) throw new Error("No token found");

    const response = await axios.get(`${BASE_URL}wallets/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log("💰 Wallet API Response:", response.data);

    const data = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    return {
      balance: data?.balance || 0,
    };
  } catch (error) {
    console.error("Wallet API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.detail ||
      "Failed to load wallet data"
    );
  }
}

export async function withdrawFunds(token, amount) {
  try {
    const authToken = token || getAuthToken();
    const response = await axios.post(
      `${BASE_URL}wallets/withdraw/`,
      { amount },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Withdraw Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to withdraw funds");
  }
}

export async function addFunds(token, formData) {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) throw new Error("No token found");

    console.log("Submitting Fund Request with:");
    for (const [key, value] of formData.entries()) {
      console.log("➡️", key, ":", value);
    }

    const response = await axios.post(`${BASE_URL}fund-requests/`, formData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log("✅ Add Fund Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Add Fund Error (Full):", error);

    const msg =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.response?.data ||
      error.message ||
      "Failed to add funds";

    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
}

export const getTransactionHistory = async (token) => {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) throw new Error("No token found");

    const response = await axios.get(`${BASE_URL}wallets/transaction_history/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log("📊 Transaction History API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Transaction History API Error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.detail ||
      "Failed to fetch transaction history"
    );
  }
};

export async function getFundRequests(token, params = {}) {
  try {
    const response = await axios.get(`${BASE_URL}fund-requests/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch fund requests");
  }
}

export async function approveFundRequest(token, requestId, adminNotes = '') {
  try {
    const response = await axios.post(
      `${BASE_URL}fund-requests/${requestId}/approve/`,
      { admin_notes: adminNotes },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to approve fund request");
  }
}



export async function updateUserCommissionPlan(token, planId, data) {
  try {
    const response = await axios.patch(
      `${BASE_URL}user-commission-plans/${planId}/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update user commission plan");
  }
}



export async function getUserPlan(token) {
  try {
    const response = await axios.get(`${BASE_URL}user-commission-plans/user_plan/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch user plan");
  }
}


export async function assignCommissionPlan(token, data) {
  try {
    const response = await axios.post(
      `${BASE_URL}user-commission-plans/assign_plan/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to assign commission plan");
  }
}



export async function getUserCommissionPlans(token, params = {}) {
  try {
    const response = await axios.get(
      `${BASE_URL}user-commission-plans/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch user commission plans");
  }
}



export async function rejectFundRequest(token, requestId, adminNotes = '') {
  try {
    const response = await axios.post(
      `${BASE_URL}fund-requests/${requestId}/reject/`,
      { admin_notes: adminNotes },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to reject fund request");
  }
}

export async function deleteFundRequest(token, requestId) {
  try {
    const response = await axios.delete(
      `${BASE_URL}fund-requests/${requestId}/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete fund request");
  }
}



export async function createServiceCommission(token, data) {
  try {
    const response = await axios.post(
      `${BASE_URL}service-commissions/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create service commission");
  }
}


export async function updateServiceCommission(token, commissionId, data) {
  try {
    const response = await axios.put(
      `${BASE_URL}service-commissions/${commissionId}/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update service commission");
  }
}

export async function deleteServiceCommission(token, commissionId) {
  try {
    const response = await axios.delete(
      `${BASE_URL}service-commissions/${commissionId}/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete service commission");
  }
}

export const bulkCreateServiceCommissions = async (token, data) => {
  const response = await fetch(`${BASE_URL}service-commissions/bulk_create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to bulk create commissions');
  }

  return await response.json();
};


// ✅ Service Categories & Subcategories
export async function getServiceCategories(token) {
  try {
    const response = await axios.get(`${BASE_URL}categories/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch service categories");
  }
}

export async function getServiceSubcategories(token, categoryId = null) {
  try {
    const params = categoryId ? { category: categoryId } : {};
    const response = await axios.get(`${BASE_URL}subcategories/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch service subcategories");
  }
}

export async function getCommissionPlans(token) {
  try {
    const response = await axios.get(`${BASE_URL}commission-plans/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch commission plans");
  }
}


export async function deleteUserCommissionPlan(token, planId) {
  try {
    const response = await axios.delete(
      `${BASE_URL}user-commission-plans/${planId}/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete user commission plan");
  }
}


export const processServicePayment = async (paymentData) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await axios.post(
      `${BASE_URL}transactions/pay_for_service/`,
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }
    );

    console.log("💰 Payment successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Payment error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Payment failed"
    );
  }
};



export const submitServiceForm = async (formData, isCategoryForm = false) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const endpoint = isCategoryForm
      ? 'services/create-direct-category-form/'
      : 'services/create-submission-direct/';

    const response = await axios.post(
      `${BASE_URL}${endpoint}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      }
    );

    console.log("✅ Form submission successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Form submission error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Form submission failed"
    );
  }
};



export const getWalletBalance = async () => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await axios.get(
      `${BASE_URL}wallets/balance/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Wallet balance error:", error);
    throw error;
  }
};


export async function getMyServices(token) {
  try {
    const response = await axios.get(`${BASE_URL}service-permissions/my_services/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('🔵 My Services Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('🔴 My Services Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch my services");
  }
}

export async function getAvailableServices(token, userId = null) {
  try {
    const params = userId ? { user_id: userId } : {};
    const response = await axios.get(`${BASE_URL}service-permissions/available_services/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: params,
    });
    console.log('🔵 Available Services Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('🔴 Available Services Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch available services");
  }
}

// In lib/api.js - update getCategoriesWithPermissions function
export async function getCategoriesWithPermissions(token) {
  try {
    const availableServices = await getMyServices(token);

    console.log('🔍 getCategoriesWithPermissions - Raw API Response:', availableServices);

    if (availableServices && availableServices.categories) {
      // Process categories with permissions
      const processedCategories = availableServices.categories.map(cat => ({
        ...cat,
        is_active: cat.is_active || false,
        can_view: cat.can_view || false,
        can_use: cat.can_use || false
      }));

      // Process subcategories with proper permission inheritance
      const processedSubcategories = (availableServices.subcategories || []).map(sub => {
        // Find the parent category to inherit permissions if needed
        const parentCategory = availableServices.categories.find(
          cat => cat.id === sub.category
        );

        return {
          ...sub,
          is_active: sub.is_active || false,
          can_view: sub.can_view || (parentCategory ? parentCategory.can_view : false),
          can_use: sub.can_use || (parentCategory ? parentCategory.can_use : false)
        };
      });

      console.log('✅ Processed Categories:', processedCategories);
      console.log('✅ Processed Subcategories:', processedSubcategories);

      return {
        categories: processedCategories,
        subcategories: processedSubcategories
      };
    }

    // Fallback to basic categories if permission API fails
    console.log('🟡 Using fallback categories (no permissions data)');
    const allCategories = await getServiceCategories(token);
    const allSubcategories = await getServiceSubcategories(token);

    const filteredCategories = allCategories.filter(cat => cat.is_active);
    const filteredSubcategories = allSubcategories.filter(sub => sub.is_active);

    return {
      categories: filteredCategories,
      subcategories: filteredSubcategories
    };
  } catch (error) {
    console.error('❌ Categories with permissions error:', error);
    throw error;
  }
}


// ...existing code...
export async function addBank(token, bankData) {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) throw new Error("No token found");

    const response = await axios.post(
      `${BASE_URL}user/banks/`,
      bankData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("addBank Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.detail ||
      "Failed to add bank"
    );
  }
}

export async function getBank(token, bankData) {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) throw new Error("No token found");

    const response = await axios.get(
      `${BASE_URL}user/banks/`,
      {
        params: bankData, // 👈 GET me data yaha jaata hai
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("addBank Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.detail ||
      "Failed to get bank"
    );
  }
}


export async function getSubCategoriesWithPermissions(token, catId) {
  try {
    const authToken = token || getAuthToken();

    // First get all available services with permissions
    const availableServices = await getMyServices(token);

    if (availableServices && availableServices.subcategories) {
      // Filter subcategories by category and check permissions
      const filteredSubcategories = availableServices.subcategories.filter(sub => {
        const matchesCategory = !catId || sub.category == catId;
        const hasPermission = sub.can_view && sub.can_use && sub.is_active;
        return matchesCategory && hasPermission;
      });

      console.log('✅ Filtered Subcategories with Permissions:', filteredSubcategories);
      return filteredSubcategories;
    }

    // Fallback to basic subcategories
    console.log('🟡 Using fallback subcategories');
    const url = catId
      ? `${BASE_URL}services/subcategories/?category=${catId}`
      : `${BASE_URL}services/subcategories/`;

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    // Filter only active subcategories
    const activeSubcategories = response.data.filter(sub => sub.is_active);
    return activeSubcategories;

  } catch (error) {
    console.error("getSubCategoriesWithPermissions Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch subcategories"
    );
  }
}


export const requestRefund = async (data) => {
  try {
    const response = await postWithAuth("refunds/request_refund/", data);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to request refund");
  }
};

export const getEligibleTransactions = async () => {
  try {
    const response = await getWithAuth("refunds/eligible_transactions/");
    return response;
  } catch (error) {
    throw new Error("Failed to fetch eligible transactions");
  }
};

export const getRefundHistory = async () => {
  try {
    const response = await getWithAuth("refunds/");
    return response;
  } catch (error) {
    throw new Error("Failed to fetch refund history");
  }
};

// Admin refund functions
export const getAdminRefunds = async () => {
  try {
    const response = await getWithAuth("admin/refunds/");
    return response;
  } catch (error) {
    throw new Error("Failed to fetch admin refunds");
  }
};

export const processRefund = async (refundId, action, adminNotes) => {
  try {
    const response = await postWithAuth(
      `admin/refunds/${refundId}/process_refund/`,
      { action, admin_notes: adminNotes }
    );
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to process refund");
  }
};



export async function getOperatorCommissions(token, params = {}) {
  try {
    const response = await axios.get(`${BASE_URL}commission/operator-commissions/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch operator commissions");
  }
}

export async function createOperatorCommission(token, data) {
  try {
    const response = await axios.post(
      `${BASE_URL}commission/operator-commissions/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create operator commission");
  }
}

export async function updateOperatorCommission(token, commissionId, data) {
  try {
    const response = await axios.put(
      `${BASE_URL}commission/operator-commissions/${commissionId}/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update operator commission");
  }
}

export async function deleteOperatorCommission(token, commissionId) {
  try {
    const response = await axios.delete(
      `${BASE_URL}commission/operator-commissions/${commissionId}/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete operator commission");
  }
}

export async function bulkCreateOperatorCommissions(token, data) {
  try {
    const response = await axios.post(
      `${BASE_URL}commission/operator-commissions/bulk_create_operator_commissions/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to bulk create operator commissions");
  }
}


export async function getServiceCommissions(token, params = {}) {
  try {
    const response = await axios.get(`${BASE_URL}service-commissions/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch service commissions");
  }
}



export async function getAllOperators(token, params = {}) {
  try {
    const response = await axios.get(
      `${BASE_URL}commission/operator-commissions/available_operators/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch operators");
  }
}


export async function getAvailableOperators(token, params = {}) {
  try {
    const response = await axios.get(
      `${BASE_URL}commission/operator-commissions/available_operators/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: params,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching operators:', error);
    return { operators: [], count: 0 };
  }
}

export async function getOperatorTypes(token) {
  try {
    const response = await axios.get(`${BASE_URL}commission/operator-commissions/operator_types/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch operator types");
  }
}

export async function getOperatorsBySubcategory(token, subcategoryId) {
  try {
    const response = await axios.get(
      `${BASE_URL}services/operators/by-subcategory/${subcategoryId}/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching operators for subcategory:", error);
    return getAvailableOperators(token, { service_subcategory_id: subcategoryId });
  }
}



export async function getCommissionRoleStats(token) {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) throw new Error("No authentication token found");
    
    const url = `${BASE_URL}commission/commission-transactions/role_stats/`;
    
    console.log("🔍 Fetching Commission Role Stats from:", url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("✅ Commission Role Stats Response:", data);
    return data;
  } catch (error) {
    console.error("❌ Commission Role Stats API Error:", error);
    throw new Error(error.response?.data?.detail || error.message || "Failed to fetch role stats");
  }
}


export async function getCommissionSummary(token, filters = {}) {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) throw new Error("No authentication token found");
    
    const params = new URLSearchParams();
    
    if (filters.service_category) {
      params.append('service_category', filters.service_category);
    }
    
    if (filters.service_subcategory) {
      params.append('service_subcategory', filters.service_subcategory);
    }
    
    if (filters.commission_plan) {
      params.append('commission_plan', filters.commission_plan);
    }
    
    const url = `${BASE_URL}commission/my-service-commissions/my_commission_summary/${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log("🔍 Fetching Commission Summary from:", url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("✅ Commission Summary Response:", data);
    return data;
  } catch (error) {
    console.error("❌ Commission Summary API Error:", error);
    throw new Error(error.response?.data?.detail || error.message || "Failed to fetch commission summary");
  }
}



export async function getMyCommissions(token, filters = {}) {
  try {
    const authToken = token || getAuthToken();
    if (!authToken) throw new Error("No authentication token found");

    const params = new URLSearchParams();
    
    if (filters.role) {
      params.append('role', filters.role);
    }
    
    if (filters.start_date) {
      params.append('start_date', filters.start_date);
    }
    
    if (filters.end_date) {
      params.append('end_date', filters.end_date);
    }
    
    const url = `${BASE_URL}commission/commission-transactions/my_commissions/${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log("🔍 Fetching My Commissions from:", url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("✅ My Commissions Response:", data);
    return data;
  } catch (error) {
    console.error("❌ My Commissions API Error:", error);
    throw new Error(error.response?.data?.detail || error.message || "Failed to fetch commissions");
  }
}



export default {
  getUserDataFromToken,
  getUserIdFromToken,
  getUserRole,
  isAuthenticated,
  getAuthToken,
  storeAuthData,
  getAuthData,
  clearAuthData,
  storeUserData,
  logout,
  post,
  getUserPlan,
  postWithAuth,
  getWithAuth,
  patchWithAuth,
  getCategories,
  getSubCategories,
  getServiceCategories,
  getServiceSubcategories,
  getWallet,
  withdrawFunds,
  addFunds,
  getTransactionHistory,
  getFundRequests,
  approveFundRequest,
  rejectFundRequest,
  deleteFundRequest,
  createServiceCommission,
  updateServiceCommission,
  deleteServiceCommission,
  bulkCreateServiceCommissions,
  processServicePayment,
  submitServiceForm,
  getWalletBalance,
  getMyServices,
  getAvailableServices,
  getCategoriesWithPermissions,
  requestRefund,
  getEligibleTransactions,
  getRefundHistory,
  getAdminRefunds,
  processRefund,
  getOperatorCommissions,
  createOperatorCommission,
  updateOperatorCommission,
  deleteOperatorCommission,
  bulkCreateOperatorCommissions,
  getAllOperators,
  getAvailableOperators,
  getOperatorTypes,
  getOperatorsBySubcategory,
  getServiceCommissions,
  getUserCommissionPlans,
  updateUserCommissionPlan,
  getCommissionPlans,
  deleteUserCommissionPlan,
  assignCommissionPlan,
  getCommissionRoleStats,
  getCommissionSummary,
  getMyCommissions,
};