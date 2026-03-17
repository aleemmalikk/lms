"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getWithAuth, postWithAuth } from "../../lib/api";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Shield,
  AlertTriangle,
  Banknote,
  Calendar,
  MapPin,
  Home,
  Briefcase,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Download,
  FileText,
  Eye,
  RefreshCw,
  Activity,
  Zap,
  DollarSign,
  Percent,
  Award,
  Fingerprint,
  FileCheck,
  AlertCircle,
  MessageSquare,
  Send,
  Copy,
  Sparkles,
  Bell,
  ChevronRight,
  ChevronDown,
  Upload,
  Share2,
  Bookmark,
  Info,
  Check,
  X,
  Plus,
  Search,
  Filter,
  Moon,
  Sun,
  Wallet,
  PieChart,
  BarChart,
  LineChart,
  Target,
  Coffee,
  Image,
  Database,
  Monitor,
  Headphones,
  Wifi,
  Leaf,
  Cloud,
  Wind,
  Droplet,
  Flame,
  Pill,
  Syringe,
  Stethoscope,
  Bone,
  Brain,
  Baby,
  Adult,
  Wheelchair,
  Volume2,
  Mic,
  Video,
  Camera,
  Battery,
  Power,
  Repeat,
  Shuffle,
  Play,
  Pause,
  Stop,
  Maximize,
  Minimize,
  Bitcoin,
  Coins,
  PiggyBank,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Ruler,
  Square,
  Circle,
  Triangle,
  Sparkle,
  Wave,
  Mountain,
  River,
  Ocean,
  Forest,
  Fire,
  Ghost,
  Bird,
  Cat,
  Dog,
  Fish,
  Music,
  Speaker,
  Guitar,
  Piano
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ApplicationDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [actionMessage, setActionMessage] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Support Team",
      message: "Please upload your latest bank statement for verification.",
      time: "2 hours ago",
      isUser: false,
      read: true
    },
    {
      id: 2,
      sender: "You",
      message: "I've uploaded the documents. Please check.",
      time: "1 hour ago",
      isUser: true,
      read: true
    }
  ]);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchData = async () => {
    try {
      const res = await getWithAuth(`loan-applications/${id}/`);
      setData(res);
    } catch (error) {
      console.error("Failed to fetch application:", error);
    }
  };

  const callAction = async (endpoint, actionName) => {
    setLoading(true);
    setActionMessage({ type: "info", text: `Processing ${actionName}...` });

    try {
      await postWithAuth(`loan-applications/${id}/${endpoint}/`);
      await fetchData();
      setActionMessage({ type: "success", text: `${actionName} completed successfully!` });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (e) {
      setActionMessage({ type: "error", text: `${actionName} failed. Please try again.` });
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      sender: "You",
      message: message,
      time: "Just now",
      isUser: true,
      read: false
    };
    
    setMessages([...messages, newMessage]);
    setMessage("");
    
    // Simulate reply after 2 seconds
    setTimeout(() => {
      const reply = {
        id: messages.length + 2,
        sender: "Support Team",
        message: "Thank you for your message. Our team will review it shortly.",
        time: "Just now",
        isUser: false,
        read: false
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  if (!data) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading application details...</p>
        </div>
      </motion.div>
    );
  }

  const statusColors = {
    approved: { 
      bg: "bg-emerald-100", 
      text: "text-emerald-700", 
      border: "border-emerald-200", 
      icon: CheckCircle, 
      label: "Approved"
    },
    rejected: { 
      bg: "bg-rose-100", 
      text: "text-rose-700", 
      border: "border-rose-200", 
      icon: XCircle, 
      label: "Rejected"
    },
    risk_review: { 
      bg: "bg-amber-100", 
      text: "text-amber-700", 
      border: "border-amber-200", 
      icon: AlertTriangle, 
      label: "Risk Review"
    },
    disbursed: { 
      bg: "bg-purple-100", 
      text: "text-purple-700", 
      border: "border-purple-200", 
      icon: Banknote, 
      label: "Disbursed"
    },
    lead: { 
      bg: "bg-gray-100", 
      text: "text-gray-700", 
      border: "border-gray-200", 
      icon: Clock, 
      label: "Lead"
    },
    pending: { 
      bg: "bg-blue-100", 
      text: "text-blue-700", 
      border: "border-blue-200", 
      icon: Clock, 
      label: "Pending"
    }
  };

  const status = statusColors[data.status] || statusColors.pending;
  const StatusIcon = status.icon;

  const tabs = [
    { id: "overview", label: "Overview", icon: Eye, color: "bg-blue-500" },
    { id: "documents", label: "Documents", icon: FileText, color: "bg-purple-500" },
    { id: "timeline", label: "Timeline", icon: Clock, color: "bg-amber-500" },
    { id: "messages", label: "Messages", icon: MessageSquare, color: "bg-emerald-500" },
    { id: "analytics", label: "Analytics", icon: BarChart, color: "bg-rose-500" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link
                  href="/applications"
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </Link>
              </motion.div>
              
              <div>
                <div className="flex items-center gap-3">
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold text-gray-900"
                  >
                    Loan Application
                  </motion.h1>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className={`inline-flex items-center gap-1 px-3 py-1 ${status.bg} ${status.text} rounded-full text-sm font-medium border ${status.border}`}>
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                  </motion.div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-500 font-mono">ID: {id}</p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigator.clipboard.writeText(id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copy ID"
                  >
                    <Copy size={14} className="text-gray-400" />
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {darkMode ? <Sun size={20} className="text-gray-600" /> : <Moon size={20} className="text-gray-600" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative"
              >
                <Bell size={20} className="text-gray-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  3
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Download size={20} className="text-gray-600" />
              </motion.button>

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md cursor-pointer"
              >
                JD
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Message Toast */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 20 }}
            className={`fixed top-24 right-4 z-50 px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3 ${
              actionMessage.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
              actionMessage.type === "error" ? "bg-rose-50 border-rose-200 text-rose-700" :
              "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            {actionMessage.type === "success" && <CheckCircle size={20} />}
            {actionMessage.type === "error" && <AlertCircle size={20} />}
            {actionMessage.type === "info" && <RefreshCw size={20} className="animate-spin" />}
            <span className="font-medium">{actionMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { icon: DollarSign, label: "Requested Amount", value: `₹${data.requested_amount?.toLocaleString() || '0'}`, bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" },
            { icon: Percent, label: "Interest Rate", value: data.interest_rate ? `${data.interest_rate}%` : "N/A", bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "bg-emerald-100" },
            { icon: Activity, label: "CIBIL Score", value: data.cibil_score || "N/A", bg: "bg-amber-50", text: "text-amber-600", iconBg: "bg-amber-100" },
            { icon: Award, label: "Risk Score", value: data.risk_score || "N/A", bg: data.risk_score > 50 ? "bg-rose-50" : "bg-emerald-50", text: data.risk_score > 50 ? "text-rose-600" : "text-emerald-600", iconBg: data.risk_score > 50 ? "bg-rose-100" : "bg-emerald-100" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                  <stat.icon size={24} className={stat.text} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.label === "Risk Score" 
                    ? data.risk_score > 50 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {stat.label === "Risk Score" ? (data.risk_score > 50 ? "High" : "Low") : "Active"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex flex-wrap">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 ${tab.color} rounded-lg`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <tab.icon size={16} />
                  {tab.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <motion.div 
            layout
            className="lg:col-span-2 space-y-6"
          >
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Applicant Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User size={18} className="text-blue-600" />
                        Applicant Information
                        <span className="ml-auto text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                          Verified
                        </span>
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                          icon={<User size={16} />}
                          label="Full Name"
                          value={data.full_name}
                          color="bg-blue-50 text-blue-600"
                          iconBg="bg-blue-100"
                        />
                        <InfoCard
                          icon={<Mail size={16} />}
                          label="Email"
                          value={data.email}
                          color="bg-purple-50 text-purple-600"
                          iconBg="bg-purple-100"
                        />
                        <InfoCard
                          icon={<Phone size={16} />}
                          label="Phone"
                          value={data.phone}
                          color="bg-emerald-50 text-emerald-600"
                          iconBg="bg-emerald-100"
                        />
                        <InfoCard
                          icon={<CreditCard size={16} />}
                          label="PAN Number"
                          value={data.pan_number}
                          color="bg-amber-50 text-amber-600"
                          iconBg="bg-amber-100"
                        />
                        <InfoCard
                          icon={<MapPin size={16} />}
                          label="City"
                          value={data.city}
                          color="bg-rose-50 text-rose-600"
                          iconBg="bg-rose-100"
                        />
                        <InfoCard
                          icon={<Home size={16} />}
                          label="Address"
                          value={data.address}
                          color="bg-indigo-50 text-indigo-600"
                          iconBg="bg-indigo-100"
                          fullWidth
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Loan Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Banknote size={18} className="text-emerald-600" />
                        Loan Details
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                          icon={<Briefcase size={16} />}
                          label="Loan Category"
                          value={data.category?.name}
                          color="bg-indigo-50 text-indigo-600"
                          iconBg="bg-indigo-100"
                        />
                        <InfoCard
                          icon={<DollarSign size={16} />}
                          label="Requested Amount"
                          value={`₹${data.requested_amount?.toLocaleString()}`}
                          color="bg-emerald-50 text-emerald-600"
                          iconBg="bg-emerald-100"
                        />
                        <InfoCard
                          icon={<Calendar size={16} />}
                          label="Tenure"
                          value={`${data.tenure_months} months`}
                          color="bg-amber-50 text-amber-600"
                          iconBg="bg-amber-100"
                        />
                        <InfoCard
                          icon={<Award size={16} />}
                          label="CIBIL Score"
                          value={data.cibil_score}
                          color={data.cibil_score > 700 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}
                          iconBg={data.cibil_score > 700 ? "bg-emerald-100" : "bg-amber-100"}
                        />
                        <InfoCard
                          icon={<Percent size={16} />}
                          label="FOIR"
                          value={data.foir ? `${data.foir}%` : "N/A"}
                          color="bg-purple-50 text-purple-600"
                          iconBg="bg-purple-100"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Risk Analysis */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Shield size={18} className="text-rose-600" />
                        Risk & Fraud Analysis
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <RiskCard
                          label="Fraud Score"
                          value={data.fraud_score}
                          max={100}
                          color="rose"
                        />
                        <RiskCard
                          label="Risk Score"
                          value={data.risk_score}
                          max={100}
                          color={data.risk_score > 50 ? "rose" : "emerald"}
                        />
                        <RiskCard
                          label="Bounce Count"
                          value={data.bounce_count}
                          max={10}
                          color={data.bounce_count > 5 ? "rose" : "amber"}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Approval Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle size={18} className="text-purple-600" />
                        Approval Details
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                          icon={<Banknote size={16} />}
                          label="Approved Amount"
                          value={data.approved_amount ? `₹${data.approved_amount.toLocaleString()}` : "Not Approved"}
                          color="bg-emerald-50 text-emerald-600"
                          iconBg="bg-emerald-100"
                        />
                        <InfoCard
                          icon={<Percent size={16} />}
                          label="Interest Rate"
                          value={data.interest_rate ? `${data.interest_rate}%` : "N/A"}
                          color="bg-blue-50 text-blue-600"
                          iconBg="bg-blue-100"
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "documents" && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileText size={18} className="text-purple-600" />
                      Uploaded Documents
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: "PAN Card", status: "verified", date: "2024-01-15", size: "2.3 MB", icon: CreditCard },
                        { name: "Aadhaar Card", status: "verified", date: "2024-01-15", size: "3.1 MB", icon: CreditCard },
                        { name: "Bank Statement", status: "pending", date: "2024-01-16", size: "5.7 MB", icon: FileText },
                        { name: "Income Proof", status: "pending", date: "2024-01-16", size: "1.8 MB", icon: FileText },
                      ].map((doc, i) => {
                        const Icon = doc.icon;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -2 }}
                            className="group bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer border border-gray-200"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setShowDocPreview(true);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg ${
                                doc.status === "verified" ? "bg-emerald-100" : "bg-amber-100"
                              } flex items-center justify-center`}>
                                <Icon size={20} className={doc.status === "verified" ? "text-emerald-600" : "text-amber-600"} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 mb-1">{doc.name}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{doc.date}</span>
                                  <span>•</span>
                                  <span>{doc.size}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    doc.status === "verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                  }`}>
                                    {doc.status === "verified" ? <Check size={10} /> : <Clock size={10} />}
                                    {doc.status}
                                  </span>
                                </div>
                              </div>
                              <Eye size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Upload New Document */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Upload size={20} className="text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload new document</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === "timeline" && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock size={18} className="text-amber-600" />
                      Application Timeline
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                      
                      {[
                        { 
                          action: "Application Submitted", 
                          date: "2024-01-15 10:30 AM", 
                          status: "completed", 
                          description: "Application received and logged in system",
                          icon: FileText
                        },
                        { 
                          action: "KYC Verification", 
                          date: "2024-01-15 11:45 AM", 
                          status: "completed", 
                          description: "Documents verified successfully",
                          icon: Fingerprint
                        },
                        { 
                          action: "Bank Statement Analysis", 
                          date: "2024-01-16 09:20 AM", 
                          status: "in-progress", 
                          description: "Analyzing last 6 months transactions",
                          icon: FileCheck
                        },
                        { 
                          action: "Risk Assessment", 
                          date: "Pending", 
                          status: "pending", 
                          description: "Calculating risk score and fraud detection",
                          icon: Shield
                        },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative flex items-start gap-4 mb-6 last:mb-0"
                          >
                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                              item.status === "completed" ? "bg-emerald-100" :
                              item.status === "in-progress" ? "bg-blue-100" :
                              "bg-gray-100"
                            }`}>
                              <Icon size={14} className={
                                item.status === "completed" ? "text-emerald-600" :
                                item.status === "in-progress" ? "text-blue-600" :
                                "text-gray-400"
                              } />
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-semibold text-gray-900">{item.action}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  item.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                  item.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                                  "bg-gray-100 text-gray-600"
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mb-1">{item.description}</p>
                              <p className="text-xs text-gray-400">{item.date}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "messages" && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare size={18} className="text-emerald-600" />
                      Messages
                    </h2>
                  </div>
                  <div className="h-[400px] flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            msg.isUser 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${msg.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                              {msg.time}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={sendMessage}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Send size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "analytics" && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <BarChart size={18} className="text-rose-600" />
                      Analytics
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {[
                        { label: "Income Stability", value: "85%", color: "bg-emerald-500" },
                        { label: "Credit History", value: "720", color: "bg-blue-500" },
                        { label: "Debt Ratio", value: "32%", color: "bg-amber-500" },
                        { label: "Employment Score", value: "92%", color: "bg-purple-500" },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                          <p className="text-lg font-bold text-gray-900">{item.value}</p>
                          <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div 
                              className={`h-full ${item.color} rounded-full`}
                              style={{ width: typeof item.value === 'string' ? item.value : '0%' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                        <PieChart size={32} />
                      </div>
                      <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                        <LineChart size={32} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sidebar - Actions */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Zap size={18} className="text-blue-600" />
                  Processing Actions
                </h2>
              </div>

              <div className="p-4 space-y-2">
                <ActionBtn
                  icon={<Fingerprint size={16} />}
                  label="Verify KYC"
                  onClick={() => callAction("verify_kyc", "KYC Verification")}
                  loading={loading}
                  color="bg-blue-600 hover:bg-blue-700"
                />

                <ActionBtn
                  icon={<Award size={16} />}
                  label="Fetch CIBIL"
                  onClick={() => callAction("fetch_bureau", "CIBIL Fetch")}
                  loading={loading}
                  color="bg-purple-600 hover:bg-purple-700"
                />

                <ActionBtn
                  icon={<FileCheck size={16} />}
                  label="Analyze Bank"
                  onClick={() => callAction("analyze_bank_statement", "Bank Analysis")}
                  loading={loading}
                  color="bg-emerald-600 hover:bg-emerald-700"
                />

                <ActionBtn
                  icon={<Shield size={16} />}
                  label="Detect Fraud"
                  onClick={() => callAction("detect_fraud", "Fraud Detection")}
                  loading={loading}
                  color="bg-amber-600 hover:bg-amber-700"
                />

                <ActionBtn
                  icon={<Activity size={16} />}
                  label="Calculate Risk"
                  onClick={() => callAction("calculate_risk_score", "Risk Calculation")}
                  loading={loading}
                  color="bg-rose-600 hover:bg-rose-700"
                />

                <div className="border-t border-gray-200 my-4 pt-4">
                  <ActionBtn
                    icon={<CheckCircle size={16} />}
                    label="Approve Loan"
                    onClick={() => callAction("approve_loan", "Loan Approval")}
                    loading={loading}
                    color="bg-green-600 hover:bg-green-700"
                    fullWidth
                  />

                  <ActionBtn
                    icon={<Banknote size={16} />}
                    label="Disburse Loan"
                    onClick={() => callAction("disburse", "Disbursement")}
                    loading={loading}
                    color="bg-indigo-600 hover:bg-indigo-700"
                    fullWidth
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Quick Info */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <Info size={14} className="text-blue-600" />
                  Quick Info
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Application Date</span>
                    <span className="font-medium text-gray-900">2024-01-15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="font-medium text-gray-900">2024-01-16</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned To</span>
                    <span className="font-medium text-gray-900">John Doe</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {showDocPreview && selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowDocPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedDoc.name}</h3>
                <button
                  onClick={() => setShowDocPreview(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <FileText size={48} className="text-gray-400" />
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Size: {selectedDoc.size} • Uploaded: {selectedDoc.date}
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    Download
                  </button>
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Verify
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Info Card Component
function InfoCard({ icon, label, value, color = "bg-gray-50", iconBg = "bg-gray-100", fullWidth = false }) {
  return (
    <div className={`flex items-start gap-3 p-3 ${color} rounded-lg ${fullWidth ? 'md:col-span-2' : ''}`}>
      <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <span className={color.replace('bg-', 'text-')}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value || "N/A"}</p>
      </div>
    </div>
  );
}

// Risk Card Component
function RiskCard({ label, value, max = 100, color = "blue" }) {
  const percentage = (value / max) * 100;
  const colors = {
    rose: { bg: "bg-rose-50", text: "text-rose-600", bar: "bg-rose-500" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", bar: "bg-amber-500" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", bar: "bg-blue-500" },
  };
  const scheme = colors[color] || colors.blue;

  return (
    <div className={`p-3 ${scheme.bg} rounded-lg`}>
      <p className={`text-xs font-medium ${scheme.text} mb-1`}>{label}</p>
      <p className="text-lg font-bold text-gray-900 mb-1">{value || 0}</p>
      <div className="h-1.5 bg-white rounded-full overflow-hidden">
        <div
          className={`h-full ${scheme.bar} rounded-full`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Action Button Component
function ActionBtn({ icon, label, onClick, loading, color = "bg-blue-600", fullWidth = false, className = "" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading}
      className={`${color} text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : 'w-full'} px-4 py-2.5 flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <RefreshCw size={14} className="animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </motion.button>
  );
}