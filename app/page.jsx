"use client";

import { useEffect, useState } from "react";
import {
  IndianRupee,
  Percent,
  Clock,
  Building2,
  Tag,
  ArrowRight,
  ChevronDown,
  CheckCircle,
  Shield,
  Zap,
  Star,
  TrendingUp,
  GraduationCap,
  Search,
  Filter,
  Sparkles,
  Heart,
  Bell,
  User,
  Menu,
  X,
  Globe,
  Award,
  Lock,
  ThumbsUp,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Users,
  Briefcase,
  Home,
  Car,
  Gem,
  GraduationCap as GraduationIcon,
  Moon,
  Sun,
  BarChart2,
  PieChart,
  Activity,
  CreditCard,
  TrendingDown,
  Calendar,
  FileText,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import { isAuthenticated, getWithAuth, BASE_URL } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import ProfileCompletionPopup from "./components/ProfileCompletionPopup";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";

// ─── Logged-in Dashboard ─────────────────────────────────────────────────────

function LoggedInDashboard({ loanProducts, loading, error }) {
  // ── Mock / derived data for charts ──────────────────────────────────────
  const loanTypeDistribution = [
    { name: "Personal", value: 35, color: "#3b82f6" },
    { name: "Business", value: 25, color: "#06b6d4" },
    { name: "Home", value: 20, color: "#10b981" },
    { name: "Education", value: 10, color: "#8b5cf6" },
    { name: "Vehicle", value: 7, color: "#f59e0b" },
    { name: "Gold", value: 3, color: "#f97316" },
  ];

  const disbursalTrend = [
    { month: "Aug", amount: 42 },
    { month: "Sep", amount: 58 },
    { month: "Oct", amount: 51 },
    { month: "Nov", amount: 73 },
    { month: "Dec", amount: 89 },
    { month: "Jan", amount: 95 },
    { month: "Feb", amount: 110 },
    { month: "Mar", amount: 128 },
  ];

  const interestRateComparison = loanProducts.slice(0, 6).map((l, i) => ({
    name: l.loan_type || `Loan ${i + 1}`,
    min: parseFloat(l.min_interest_rate) || 7.5 + i * 0.5,
    max: parseFloat(l.max_interest_rate) || 12 + i * 0.5,
  }));

  const approvalStats = [
    { name: "Approved", value: 72, fill: "#10b981" },
    { name: "Pending", value: 18, fill: "#f59e0b" },
    { name: "Rejected", value: 10, fill: "#ef4444" },
  ];

  const amountRange = loanProducts.slice(0, 5).map((l, i) => ({
    name: l.name?.split(" ")[0] || `P${i + 1}`,
    min: (l.min_amount || 50000) / 100000,
    max: (l.max_amount || 5000000) / 100000,
  }));

  const monthlyEMI = [
    { tenure: "12M", emi: 9200 },
    { tenure: "24M", emi: 5100 },
    { tenure: "36M", emi: 3700 },
    { tenure: "48M", emi: 2900 },
    { tenure: "60M", emi: 2400 },
  ];

  const kpis = [
    {
      label: "Total Products",
      value: loanProducts.length,
      icon: <FileText size={22} />,
      color: "blue",
      change: "+3 this month",
      up: true,
    },
    {
      label: "Avg Interest Rate",
      value: "10.2%",
      icon: <Percent size={22} />,
      color: "cyan",
      change: "-0.3% vs last month",
      up: false,
    },
    {
      label: "Max Loan Amount",
      value: "₹5Cr",
      icon: <IndianRupee size={22} />,
      color: "emerald",
      change: "Across all products",
      up: true,
    },
    {
      label: "Approval Rate",
      value: "72%",
      icon: <CheckSquare size={22} />,
      color: "violet",
      change: "+5% vs last month",
      up: true,
    },
  ];

  const colorMap = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
      badge: "text-blue-600 dark:text-blue-400",
    },
    cyan: {
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
      icon: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400",
      badge: "text-cyan-600 dark:text-cyan-400",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      icon: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
      badge: "text-emerald-600 dark:text-emerald-400",
    },
    violet: {
      bg: "bg-violet-50 dark:bg-violet-900/20",
      icon: "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400",
      badge: "text-violet-600 dark:text-violet-400",
    },
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-xl text-sm">
          <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
            {label}
          </p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="font-medium">
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors mt-0">
      {/* ── Top greeting bar ── */}
      {/* <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-6 py-6 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-0.5">
              Welcome back 👋
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Loan Dashboard
            </h1>
          </div>
        </div>
      </div> */}

      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const c = colorMap[kpi.color];
            return (
              <div
                key={i}
                className={`${c.bg} rounded-2xl p-5 border border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:-translate-y-0.5 shadow-sm`}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center mb-3`}
                >
                  {kpi.icon}
                </div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white mb-0.5">
                  {kpi.value}
                </div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  {kpi.label}
                </div>
                <div
                  className={`text-xs font-medium flex items-center gap-1 ${c.badge}`}
                >
                  {kpi.up ? (
                    <TrendingUp size={11} />
                  ) : (
                    <TrendingDown size={11} />
                  )}
                  {kpi.change}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Row 1: Disbursal Trend + Loan Type Pie ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Disbursal Area Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Monthly Disbursal Trend
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Crores ₹ disbursed per month
                </p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Activity
                  size={18}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={disbursalTrend}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="disbursalGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="₹ Crore"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#disbursalGrad)"
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Loan Type Pie */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Loan Type Mix
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Distribution by type
                </p>
              </div>
              <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
                <PieChart
                  size={18}
                  className="text-violet-600 dark:text-violet-400"
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <RechartsPieChart>
                <Pie
                  data={loanTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {loanTypeDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
              {loanTypeDistribution.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  {item.name}{" "}
                  <span className="ml-auto font-semibold text-gray-800 dark:text-gray-200">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 2: Interest Rate Bar + Approval Radial ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interest Rate Range */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Interest Rate Range by Loan Type
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Min & Max rates (%)
                </p>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <Percent
                  size={18}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>
            {interestRateComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={interestRateComparison}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="min"
                    name="Min Rate"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="max"
                    name="Max Rate"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                No rate data available
              </div>
            )}
          </div>

          {/* Approval Stats Radial */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Approval Status
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Current cycle</p>
              </div>
              <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <CheckCircle size={18} className="text-orange-500" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="25%"
                outerRadius="80%"
                data={approvalStats}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={6}
                  background={{ fill: "#f3f4f6" }}
                  label={{
                    position: "insideStart",
                    fill: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
                <Tooltip formatter={(v) => `${v}%`} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              {approvalStats.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: s.fill }}
                    />
                    <span className="text-gray-600 dark:text-gray-400">
                      {s.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {s.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Loan Amount Range Bar + EMI Line ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loan Amount Range */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Loan Amount Range
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">In Lakhs (₹)</p>
              </div>
              <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                <IndianRupee
                  size={18}
                  className="text-cyan-600 dark:text-cyan-400"
                />
              </div>
            </div>
            {amountRange.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={amountRange}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    unit="L"
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="min"
                    name="Min (L)"
                    fill="#06b6d4"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="max"
                    name="Max (L)"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Loading...
              </div>
            )}
          </div>

          {/* EMI vs Tenure */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  EMI vs Tenure
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  For ₹1L personal loan at 10.5%
                </p>
              </div>
              <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
                <Clock size={18} className="text-rose-500" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={monthlyEMI}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="tenure"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="emi"
                  name="EMI (₹)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ fill: "#f43f5e", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Loan Products Table ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                All Loan Products
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {loanProducts.length} products available
              </p>
            </div>
            {/* <Link
              href="/apply"
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
            >
              Apply <ArrowRight size={12} />
            </Link> */}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/60">
                    {[
                      "Product",
                      "Type",
                      "Amount Range",
                      "Interest Rate",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
                        className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loanProducts.map((loan, i) => (
                    <tr
                      key={loan.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {loan.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {loan.description}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                          {loan.loan_type || "Loan"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">
                        ₹{loan.min_amount?.toLocaleString() || "50K"} – ₹
                        {loan.max_amount?.toLocaleString() || "50L"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 w-20">
                            <div
                              className="bg-gradient-to-r from-emerald-400 to-blue-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(100, ((parseFloat(loan.min_interest_rate) || 7.5) / 20) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {loan.min_interest_rate || "7.5"}%–
                            {loan.max_interest_rate || "15"}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {/* <Link
                          href={`/apply?loan=${loan.id}`}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1"
                        >
                          Apply <ArrowRight size={11} />
                        </Link> */}
                      </td>
                    </tr>
                  ))}
                  {loanProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-12 text-gray-400"
                      >
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function Dashboard() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(null);
  const [loanProducts, setLoanProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  const closePopup = () => setIsPopupOpen(false);

  const getLoanIcon = (type) =>
    ({
      "Personal Loan": <User size={24} />,
      "Business Loan": <TrendingUp size={24} />,
      "Home Loan": <Home size={24} />,
      "Education Loan": <GraduationIcon size={24} />,
      "Vehicle Loan": <Car size={24} />,
      "Gold Loan": <Gem size={24} />,
    })[type] || <Briefcase size={24} />;

  useEffect(() => {
    const fetchLoanProducts = async () => {
      try {
        setLoading(true);
        let data;
        if (loggedIn) {
          data = await getWithAuth("loan-products/");
        } else {
          const response = await fetch(`${BASE_URL}loan-products/`);
          if (!response.ok) throw new Error("Failed to fetch loan products");
          data = await response.json();
        }
        setLoanProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching loan products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLoanProducts();
  }, [loggedIn]);

  useEffect(() => {
    if (loggedIn) {
      checkProfile();
    }
  }, [loggedIn]);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  const filterOptions = [
    { id: "all", label: "All Loans", icon: <Briefcase size={16} /> },
    { id: "Personal Loan", label: "Personal", icon: <User size={16} /> },
    { id: "Business Loan", label: "Business", icon: <TrendingUp size={16} /> },
    { id: "Home Loan", label: "Home", icon: <Home size={16} /> },
    {
      id: "Education Loan",
      label: "Education",
      icon: <GraduationIcon size={16} />,
    },
    { id: "Vehicle Loan", label: "Vehicle", icon: <Car size={16} /> },
    { id: "Gold Loan", label: "Gold", icon: <Gem size={16} /> },
  ];

  const filtered = loanProducts.filter((loan) => {
    const matchesFilter =
      filter === "All" ||
      loan.loan_type === filter ||
      loan.name?.includes(filter);
    const matchesSearch =
      searchQuery === "" ||
      loan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.loan_type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const checkProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await axios.get(`${BASE_URL}users/my_profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = res.data;
      setProfileData(user);

      if (
        !user.pan_number ||
        !user.monthly_income ||
        !user.cibil_score
      ) {
        setShowProfilePopup(true);
      } else {
        setShowProfilePopup(false);
      }

    } catch (err) {
      console.log("Profile fetch error", err);
    }
  };

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.patch(
        `${BASE_URL}users/update_profile/`,
        {
          pan_number: profileData.pan_number,
          monthly_income: profileData.monthly_income,
          cibil_score: profileData.cibil_score,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Profile Updated");
      setShowProfilePopup(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  if (loggedIn) {
    return (
      <>
        <>
          <ProfileCompletionPopup
            open={showProfilePopup}
            profileData={profileData}
            setProfileData={setProfileData}
            onUpdate={updateProfile}
            onClose={() => setShowProfilePopup(false)}
          />

          <LoggedInDashboard
            loanProducts={loanProducts}
            loading={loading}
            error={error}
          />
        </>


      </>
    );
  }

  if (loggedIn === null) return null;
  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-r from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900 bg-[length:200%_200%] animate-gradient">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500/10 to-transparent -top-48 -right-24 animate-float" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500/10 to-transparent -bottom-24 -left-24 animate-float-delayed" />

        <div className="relative z-10 max-w-3xl animate-fadeInUp md:mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 text-sm font-semibold backdrop-blur-md mb-8">
            <Sparkles size={16} />
            <span>RBI Registered | 100% Secure</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
            Smart Loans for <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Smart People
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-xl">
            Discover loans with zero hidden charges, instant approval, and
            flexible repayment options tailored to your needs.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-400/30 transition-all inline-flex items-center gap-2 group"
              onClick={() =>
                document
                  .getElementById("products")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Products{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold rounded-full hover:border-blue-400 hover:bg-blue-500/10 transition-all">
              Watch Demo
            </button>
          </div>

          <div className="flex gap-8 mt-5 mb-5">
            {[
              { value: "₹500Cr+", label: "Loans Disbursed" },
              { value: "50K+", label: "Happy Customers" },
              { value: "4.8★", label: "Customer Rating" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Cards */}
        <div className="hidden lg:block absolute right-[5%] top-1/2 -translate-y-1/2 space-y-4 animate-float">
          {[
            {
              icon: <Zap size={24} />,
              title: "Instant Approval",
              value: "Under 10 minutes",
            },
            {
              icon: <Percent size={24} />,
              title: "Interest Rates",
              value: "Starting at 7.5%",
              offset: "ml-8",
            },
            {
              icon: <IndianRupee size={24} />,
              title: "Loan Amount",
              value: "Up to ₹5 Crore",
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-xl border border-blue-500/20 shadow-xl hover:border-blue-400 transition-all hover:-translate-x-2 ${card.offset || ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  {card.icon}
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">
                    {card.title}
                  </h4>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Search Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-5">
        <div className="relative">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
          <input
            type="text"
            className="w-full pl-14 pr-36 py-2 rounded-full border-2 border-gray-300 bg-white text-gray-900 text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-sm transition-all"
            placeholder="Search for loans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 shadow-md transition-all flex items-center gap-2">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap gap-3 justify-center">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setFilter(option.id);
                setActiveCategory(option.id);
              }}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border font-semibold text-sm transition-all hover:-translate-y-0.5 ${filter === option.id
                ? "bg-blue-500 border-blue-500 text-white"
                : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600"
                }`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Featured Loan Products
          </h2>
          <p className="text-lg text-blue-600 dark:text-blue-800 max-w-2xl mx-auto">
            Choose from our wide range of loan products designed to meet your
            specific needs
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Loading amazing loans for you...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Oops! Something went wrong: {error}</p>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="text-center mb-8 text-gray-500 dark:text-gray-400">
                Found <strong>{filtered.length}</strong> results for "
                {searchQuery}"
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((loan, index) => (
                <ProductCard key={loan.id} loan={loan} index={index} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No loans found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter.
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We're committed to providing the best loan experience with
              transparency and speed
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap size={28} />,
                title: "Lightning Fast",
                desc: "Get approval in minutes, not days",
              },
              {
                icon: <Shield size={28} />,
                title: "100% Secure",
                desc: "Bank-grade security for your data",
              },
              {
                icon: <ThumbsUp size={28} />,
                title: "No Hidden Fees",
                desc: "Complete transparency in pricing",
              },
              {
                icon: <Award size={28} />,
                title: "Best Rates",
                desc: "Competitive interest rates guaranteed",
              },
              {
                icon: <Users size={28} />,
                title: "Expert Support",
                desc: "Dedicated relationship managers",
              },
              {
                icon: <Lock size={28} />,
                title: "Privacy First",
                desc: "Your data stays confidential",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect loan
            with us
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/apply"
              className="px-8 py-3 bg-white text-blue-700 font-bold rounded-full hover:shadow-xl hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
            >
              Apply Now <ArrowRight size={18} />
            </Link>
            <button className="px-8 py-3 bg-transparent border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 hover:border-white transition-all inline-flex items-center gap-2">
              Talk to Expert <Phone size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent mb-4">
                FinLoan
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Your trusted partner for smart financial solutions.
              </p>
              <div className="flex gap-3">
                {[Globe, Mail, Phone, MapPin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
            {[
              {
                title: "Products",
                links: [
                  "Personal Loan",
                  "Business Loan",
                  "Home Loan",
                  "Education Loan",
                ],
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Blog", "Press"],
              },
              {
                title: "Support",
                links: [
                  "Help Center",
                  "Contact Us",
                  "Privacy Policy",
                  "Terms of Service",
                ],
              },
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href="#"
                        className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>


          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
            <p>
              &copy; 2026 FinLoan. All rights reserved. | RBI Registered NBFC
            </p>
          </div>
        </div>
      </footer>

      {/* POPUP - Only shows for NON-logged in users */}
      {!loggedIn && isPopupOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-md transition-opacity"
            onClick={closePopup}
          />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div
              className="relative bg-white/85 backdrop-blur-xl rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl border-2 border-blue-300/40 animate-fadeInUp"
              onClick={(e) => e.stopPropagation()}
              style={{ animationDuration: "0.4s" }}
            >
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 p-8 text-white rounded-t-3xl">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20" />
                <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/10 rounded-full translate-x-28 translate-y-28" />
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold border border-white/30">
                      <Sparkles size={16} className="animate-pulse" />
                      <span>RBI Approved Loans</span>
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-3 text-center tracking-tight">
                    ✨ All Loan Products
                  </h2>
                  <p className="text-center text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
                    Choose from our complete range of loan options tailored for
                    your dreams
                  </p>
                </div>
              </div>

              <div className="p-8 bg-blue-50/40">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 text-lg">
                      Loading amazing loans for you...
                    </p>
                  </div>
                ) : loanProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🏦</div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                      No loans available
                    </h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {loanProducts.map((loan) => (
                      <div
                        key={loan.id}
                        className="group bg-white/70 backdrop-blur-md rounded-2xl p-5 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-blue-100 hover:border-blue-400 cursor-pointer hover:-translate-y-1"
                        onClick={() => router.push(`/apply?loan=${loan.id}`)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {getLoanIcon(loan.loan_type)}
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {loan.name}
                              </h3>
                              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                                {loan.loan_type || "Loan"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                              {loan.description || "Flexible loan option."}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                                <Zap size={12} /> Instant
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                                <Shield size={12} /> Secure
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                                <Clock size={12} /> Flexible
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 bg-white rounded-xl p-3 border border-gray-100">
                              <div>
                                <div className="text-xs text-gray-400 mb-1">
                                  Amount Range
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                  ₹{loan.min_amount?.toLocaleString() || "50K"}{" "}
                                  - ₹
                                  {loan.max_amount?.toLocaleString() || "50L"}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400 mb-1">
                                  Interest Rate
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                  {loan.min_interest_rate || "7.5"}% -{" "}
                                  {loan.max_interest_rate || "15"}%
                                </div>
                              </div>
                            </div>
                            <button className="mt-3 w-full py-2.5 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-sm font-semibold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all">
                              Apply Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-gradient {
          animation: gradient 15s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite reverse;
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out;
        }
      `}</style>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ loan, index }) {
  const colorSchemes = {
    "Personal Loan": {
      from: "from-blue-900",
      to: "to-blue-600",
      icon: <User size={24} />,
    },
    "Business Loan": {
      from: "from-cyan-900",
      to: "to-cyan-600",
      icon: <TrendingUp size={24} />,
    },
    "Home Loan": {
      from: "from-green-900",
      to: "to-green-600",
      icon: <Home size={24} />,
    },
    "Education Loan": {
      from: "from-purple-900",
      to: "to-purple-600",
      icon: <GraduationIcon size={24} />,
    },
    "Vehicle Loan": {
      from: "from-orange-900",
      to: "to-orange-600",
      icon: <Car size={24} />,
    },
    "Gold Loan": {
      from: "from-amber-900",
      to: "to-amber-600",
      icon: <Gem size={24} />,
    },
    default: {
      from: "from-blue-900",
      to: "to-blue-600",
      icon: <Briefcase size={24} />,
    },
  };

  const scheme = colorSchemes[loan.loan_type] || colorSchemes.default;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:-translate-y-2 hover:scale-[1.02] hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 animate-fadeInUp"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className={`h-24 bg-gradient-to-r ${scheme.from} ${scheme.to} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
        <span className="absolute top-3 right-3 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/30">
          {loan.loan_type || "Featured"}
        </span>
      </div>
      <div className="relative px-6 pb-6">
        <div className="absolute -top-6 left-6 w-14 h-14 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-lg">
          <div className={`text-${scheme.to.replace("to-", "")}`}>
            {scheme.icon}
          </div>
        </div>
        <div className="pt-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {loan.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
            {loan.description || "Flexible loan option with competitive rates"}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-semibold text-gray-600 dark:text-gray-300">
              <Shield size={12} /> Zero Collateral
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-semibold text-gray-600 dark:text-gray-300">
              <Zap size={12} /> Instant Approval
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-semibold text-gray-600 dark:text-gray-300">
              <Clock size={12} /> Flexible Tenure
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200 dark:border-gray-700 mb-4">
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Amount Range
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                ₹{loan.min_amount?.toLocaleString() || "50K"} - ₹
                {loan.max_amount?.toLocaleString() || "50L"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Interest Rate
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {loan.min_interest_rate || "7.5"}% -{" "}
                {loan.max_interest_rate || "15"}%
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Building2 size={14} />
              <span>{loan.branch || "All Branches"}</span>
            </div>
            {/* <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-400/30 hover:translate-x-1 transition-all"
            >
              Apply <ArrowRight size={14} />
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}
