"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FaTools, FaHardHat, FaClock, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { GiCog } from "react-icons/gi";
import { BiBuildings } from "react-icons/bi";
import { motion } from "framer-motion";

export default function UnderConstruction() {
  const params = useSearchParams();
  const type = params.get("type");

  const pageConfig = {
    consent: {
      title: "Consent Preference",
      icon: FaHardHat,
      description: "We're updating our consent management system to give you better control over your privacy preferences.",
      color: "from-purple-500 to-pink-500",
      features: ["Enhanced Privacy Controls", "Granular Consent Options", "GDPR Compliant"]
    },
    about: {
      title: "About LMS",
      icon: BiBuildings,
      description: "We're crafting an amazing story about our LMS platform and the team behind it.",
      color: "from-blue-500 to-cyan-500",
      features: ["Company Mission", "Team Stories", "Platform Journey"]
    },
    contact: {
      title: "Contact Us",
      icon: FaEnvelope,
      description: "We're building a better way for you to reach us. Meanwhile, you can still reach us at support@lms.com",
      color: "from-green-500 to-emerald-500",
      features: ["Live Chat Coming Soon", "24/7 Support", "Ticket System"]
    },
    policy: {
      title: "Policy Terms",
      icon: FaClock,
      description: "We're reviewing and updating our policies to ensure they reflect our commitment to transparency.",
      color: "from-orange-500 to-red-500",
      features: ["Updated Privacy Policy", "Terms of Service", "Data Protection"]
    }
  };

  const config = pageConfig[type] || {
    title: "Page",
    icon: FaTools,
    description: "We're currently working hard to improve this page. It will be available very soon.",
    color: "from-blue-500 to-indigo-500",
    features: ["Coming Soon", "Stay Tuned", "Exciting Updates"]
  };

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-8">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,transparent,black)] opacity-20" />
      
      {/* Animated Background Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 text-center border border-white/50 relative z-10"
      >
        {/* Progress Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "75%" }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`absolute top-0 left-0 h-2 bg-gradient-to-r ${config.color} rounded-tl-3xl`}
        />

        {/* Icon Section */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex justify-center mb-8"
        >
          <div className={`bg-gradient-to-br ${config.color} p-6 rounded-3xl shadow-lg`}>
            <IconComponent className="text-white text-6xl" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
        >
          <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {config.title}
          </span>
          <br />
          <span className={`bg-gradient-to-r ${config.color} bg-clip-text text-transparent text-3xl md:text-4xl mt-2 block`}>
            Under Construction
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto"
        >
          {config.description}
        </motion.p>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
        >
          {config.features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm"
            >
              <GiCog className={`text-2xl mx-auto mb-2 text-transparent bg-gradient-to-r ${config.color} bg-clip-text`} />
              <p className="text-gray-700 font-medium">{feature}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-center items-center space-x-2 mb-2">
            <span className="text-sm text-gray-500">Progress</span>
            <span className={`text-sm font-semibold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
              75%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 1, delay: 0.7 }}
              className={`h-2 rounded-full bg-gradient-to-r ${config.color}`}
            />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          {type === 'contact' && (
            <a
              href="mailto:support@lms.com"
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200"
            >
              <FaEnvelope />
              Contact Support
            </a>
          )}
        </motion.div>

        {/* Notification Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 pt-6 border-t border-gray-200"
        >
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            We'll notify you when it's ready. Stay tuned!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}