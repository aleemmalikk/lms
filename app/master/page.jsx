"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import {
  Users,
  CreditCard,
  AlertCircle,
  RefreshCw,
  DollarSign,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  getAuthData,
  isAuthenticated,
  BASE_URL,
  getAuthToken,
} from "../lib/api";
import axios from "axios";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const safeNumber = (value) => Number(value) || 0;

  const [timeRange, setTimeRange] = useState("1M");
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    transactions: [],
    hierarchy: null,
    trendData: [],
  });

  // Color themes
  const COLORS = {
    primary: "#3b82f6",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#8b5cf6",
  };

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return "+12.5%";
    const growth = ((current - previous) / previous) * 100;
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No token found");

      console.log("Fetching dashboard data...");

      // Fetch signup requests (for pending requests count)
      const signupResponse = await axios.get(
        `${BASE_URL}singup-request/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch transaction stats
      const statsResponse = await axios.get(
        `${BASE_URL}wallets/transaction_history/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch user hierarchy
      const hierarchyResponse = await axios.get(
        `${BASE_URL}user-hierarchy/my_hierarchy/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Process data
      const statsData = statsResponse.data;
      const hierarchy = hierarchyResponse.data;
      const signupRequests = signupResponse.data;
      const currentUser = getAuthData().username;

      console.log("API Responses:", {
        statsData,
        hierarchy,
        signupRequests
      });

      const totalSignupRequests = safeNumber(signupRequests?.results?.length);
      const totalUsers = safeNumber(hierarchy?.total_users);
      const totalTransactions = safeNumber(statsData?.total_count) || 0;
      
      const totalRevenue = parseFloat(statsData.total_service_charges) || 0;
      const totalCredit = parseFloat(statsData.total_credit) || 0;
      const totalDebit = parseFloat(statsData.total_debit) || 0;

      // Get commission from stats
      const commissionCategory = statsData.transactions_by_category?.find(
        t => t.transaction_category === "commission"
      );
      const totalCommission = commissionCategory ? parseFloat(commissionCategory.total_amount) : 0;

      // Get recent transactions
      const recentTransactions = statsData?.transactions || [];

      console.log("Recent transactions:", recentTransactions);

      // ✅ FIX: Prepare trend data from actual transactions
      const prepareTrendData = () => {
        const recentTransactions = statsData?.transactions || [];
        
        // If no transactions, return some sample data for demo
        if (recentTransactions.length === 0) {
          return [
            { name: 'Jan', value: 500 },
            { name: 'Feb', value: 300 },
            { name: 'Mar', value: 700 },
            { name: 'Apr', value: 200 },
            { name: 'May', value: 600 },
            { name: 'Jun', value: 400 },
          ];
        }
        
        // Group by month
        const monthlyData = {};
        
        recentTransactions.forEach(txn => {
          const date = new Date(txn.created_at);
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const month = monthNames[date.getMonth()];
          const amount = parseFloat(txn.amount) || 0;
          
          if (!monthlyData[month]) {
            monthlyData[month] = 0;
          }
          
          // For debit transactions, use absolute value for chart
          monthlyData[month] += Math.abs(amount);
        });
        
        // Convert to array and sort by month
        const sortedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trendData = sortedMonths
          .filter(month => monthlyData[month])
          .map(month => ({
            name: month,
            value: monthlyData[month],
            transactions: recentTransactions.filter(txn => 
              new Date(txn.created_at).toLocaleString('default', { month: 'short' }) === month
            ).length
          }))
          .slice(-6); // Show last 6 months
        
        // If still empty, create data from categories
        if (trendData.length === 0 && statsData.transactions_by_category) {
          return statsData.transactions_by_category?.map((item, index) => ({
            name: item.transaction_category.replace(/_/g, ' ').toUpperCase(),
            value: parseFloat(item.total_amount) || 0,
            count: item.count || 0,
            month: `Cat ${index + 1}`,
          })) || [];
        }
        
        return trendData;
      };

      const trendData = prepareTrendData();

      setDashboardData({
        stats: {
          totalSignupRequests,
          totalUsers,
          totalTransactions,
          totalRevenue,
          totalCredit,
          totalDebit,
          totalCommission,
        },
        transactions: recentTransactions,
        hierarchy: hierarchy,
        trendData: trendData,
      });

      console.log("Processed Dashboard Data:", {
        stats: {
          totalSignupRequests,
          totalUsers,
          totalTransactions,
          totalRevenue,
          totalCredit,
          totalDebit,
          totalCommission,
        },
        transactionCount: recentTransactions.length,
        hierarchyData: hierarchy,
        trendData: trendData
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (!isAuthenticated()) {
          router.replace("/auth/login");
          return;
        }
        fetchDashboardData();
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/auth/login");
      }
    };

    checkAuth();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const statCards = [
    {
      title: "Total Registered Users",
      value: safeNumber(dashboardData.stats?.totalUsers).toLocaleString(),
      change: "—",
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      trendIcon: <TrendingUp className="w-4 h-4" />,
    },
    {
      title: "Total Transactions",
      value: safeNumber(dashboardData.stats?.totalTransactions).toLocaleString(),
      change: "—",
      icon: <CreditCard className="w-6 h-6" />,
      color: "bg-green-50 text-green-600",
      borderColor: "border-green-200",
      bgColor: "bg-gradient-to-br from-green-500 to-green-600",
      trendIcon: <TrendingUp className="w-4 h-4" />,
    },
    {
      title: "Total Revenue",
      value: `₹${safeNumber(dashboardData.stats?.totalRevenue).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: "—",
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-purple-50 text-purple-600",
      borderColor: "border-purple-200",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      trendIcon: <TrendingUp className="w-4 h-4" />,
    },
    {
      title: "Pending Signup Requests",
      value: safeNumber(dashboardData.stats?.totalSignupRequests),
      change: "—",
      icon: <AlertCircle className="w-6 h-6" />,
      color: "bg-red-50 text-red-600",
      borderColor: "border-red-200",
      bgColor: "bg-gradient-to-br from-red-500 to-red-600",
      trendIcon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  // ✅ FIXED: User distribution from hierarchy - handle different response structures
  const prepareUserDistribution = () => {
    const hierarchy = dashboardData.hierarchy;
    
    if (!hierarchy) return [];

    // Try different possible response structures
    const possibleDataSources = [
      // Structure 1: hierarchy_stats.downline_by_role
      hierarchy?.hierarchy_stats?.downline_by_role,
      // Structure 2: direct downline_by_role
      hierarchy?.downline_by_role,
      // Structure 3: role_distribution
      hierarchy?.role_distribution,
      // Structure 4: Check if hierarchy_stats is an array
      Array.isArray(hierarchy?.hierarchy_stats) ? hierarchy.hierarchy_stats : null,
      // Structure 5: Check if it's in stats
      hierarchy?.stats?.role_distribution,
    ];

    console.log("Checking user distribution sources:", {
      hierarchy,
      sources: possibleDataSources
    });

    // Find the first valid data source
    let userData = null;
    for (const source of possibleDataSources) {
      if (Array.isArray(source) && source.length > 0) {
        userData = source;
        console.log("Found user data in source:", source);
        break;
      }
    }

    // If no structured data found, create from available information
    if (!userData) {
      console.log("No structured user data found, creating manual distribution");
      return [
        { name: "Admin", value: 1, role: "admin" },
        { name: "Dealer", value: hierarchy?.total_downline_users || 0, role: "dealer" },
        { name: "Retailer", value: hierarchy?.total_retailers || 0, role: "retailer" },
      ].filter(item => item.value > 0);
    }

    // Process the found data
    return userData.map(item => {
      // Determine role name based on item structure
      let role = "";
      let count = 0;

      if (item.role) {
        role = item.role;
        count = item.count || 0;
      } else if (item.name) {
        role = item.name.toLowerCase();
        count = item.value || item.count || 0;
      } else if (item.key) {
        role = item.key;
        count = item.value || 0;
      }

      // Format role name
      const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

      // Assign color based on role
      let color = COLORS.primary;
      if (role.includes("admin") || role.includes("super")) {
        color = COLORS.primary;
      } else if (role.includes("dealer")) {
        color = COLORS.warning;
      } else if (role.includes("retail")) {
        color = COLORS.success;
      } else if (role.includes("user")) {
        color = COLORS.info;
      }

      return {
        name: formattedRole,
        value: safeNumber(count),
        role: role,
        color: color,
      };
    }).filter(item => item.value > 0); // Only show roles with users
  };

  const userDistribution = prepareUserDistribution();

  // Format transaction amount
  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    return num.toFixed(2);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get transaction type color
  const getTransactionTypeColor = (type) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Master Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {getAuthData().username}!</p>
        </div>
       
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map((stat, index) => {
          const isPositive = stat.change.startsWith('+');
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color} ${stat.borderColor} border`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {stat.trendIcon}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-2">{stat.title}</h3>
              <div className="flex items-end justify-between">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</h2>
                <div className="h-1 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stat.bgColor} rounded-full`}
                    style={{ width: `${Math.min(100, (index + 1) * 25)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Transaction Trend */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Transaction Volume</h3>
                <p className="text-gray-500 text-sm">By category (Amount in ₹)</p>
              </div>
            </div>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              {["1D", "1M", "3M", "6M", "1Y"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${timeRange === range
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.trendData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${value}`, "Amount"]}
                  labelStyle={{ color: '#666' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Showing transaction amounts by category
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">User Distribution</h3>
              <p className="text-gray-500 text-sm">Across different roles</p>
            </div>
          </div>
          {userDistribution.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS.primary} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} users`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {userDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color || COLORS.primary }}
                    ></div>
                    <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center">
              <div className="text-gray-300 mb-3">
                <BarChart3 className="w-16 h-16" />
              </div>
              <p className="text-gray-500">No user distribution data available</p>
              <p className="text-sm text-gray-400 mt-1">User roles data will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Recent Transactions</h3>
              </div>
              <button
                onClick={() => router.push("/wallet")}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
              >
                View All →
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-gray-600 font-medium text-sm">ID</th>
                  <th className="text-left p-4 text-gray-600 font-medium text-sm">User</th>
                  <th className="text-left p-4 text-gray-600 font-medium text-sm">Type</th>
                  <th className="text-left p-4 text-gray-600 font-medium text-sm">Amount</th>
                  <th className="text-left p-4 text-gray-600 font-medium text-sm">Status</th>
                  <th className="text-left p-4 text-gray-600 font-medium text-sm">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dashboardData.transactions.length > 0 ? (
                  dashboardData.transactions.slice(0, 5).map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-800">
                          TXN{txn.id}
                        </div>
                        <div className="text-xs text-gray-500">{txn.reference_number}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-700">{txn.wallet_user || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{txn.transaction_category?.replace(/_/g, ' ') || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className={`text-sm font-medium capitalize ${getTransactionTypeColor(txn.transaction_type)}`}>
                          {txn.transaction_type || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`text-sm font-bold ${getTransactionTypeColor(txn.transaction_type)}`}>
                          {txn.transaction_type === 'credit' ? '+' : '-'}₹{formatAmount(txn.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Net: ₹{formatAmount(txn.net_amount)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(txn.status)}`}>
                          {txn.status?.charAt(0).toUpperCase() + txn.status?.slice(1) || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-500">
                          {new Date(txn.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(txn.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <CreditCard className="w-12 h-12 text-gray-300 mb-2" />
                        <p>No recent transactions found</p>
                        <p className="text-sm text-gray-400 mt-1">Transactions will appear here when available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="font-bold text-lg mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-blue-400/50">
              <span className="text-blue-100">Total Credit</span>
              <span className="font-bold">₹{(dashboardData.stats?.totalCredit || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-blue-400/50">
              <span className="text-blue-100">Total Debit</span>
              <span className="font-bold">₹{(dashboardData.stats?.totalDebit || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-blue-400/50">
              <span className="text-blue-100">Commission Earned</span>
              <span className="font-bold">₹{(dashboardData.stats?.totalCommission || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-blue-400/50">
              <span className="text-blue-100">Downline Users</span>
              <span className="font-bold">{dashboardData.hierarchy?.hierarchy_stats?.total_downline || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-blue-400/50">
              <span className="text-blue-100">Service Charges</span>
              <span className="font-bold">₹{(dashboardData.stats?.totalRevenue || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Total Balance</span>
              <span className="font-bold text-green-300">
                ₹{((dashboardData.stats?.totalCredit || 0) - (dashboardData.stats?.totalDebit || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}