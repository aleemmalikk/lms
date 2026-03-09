"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import axios from "axios";

import {
  FaHome,
  FaRegFileAlt,
  FaCogs,
  FaHandHoldingUsd,
  FaUserShield,
  FaUsers,
  FaChartBar,
  FaPlusCircle,
  FaHeadset,
  FaChartLine,
  FaUniversity,
  FaUndoAlt,
  FaUserPlus,
  FaFileAlt,
  FaUserCircle,
  FaInfoCircle,
  FaPhoneAlt,
  FaFileContract,
  FaList,
  FaMoneyBillWave
} from "react-icons/fa";

import { getUserRole, BASE_URL } from "../lib/api";

export default function Sidebar({
  isMobileOpen,
  isCollapsed,
  onToggle,
  onClose,
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const [userRole, setUserRole] = useState(null);
  const [services, setServices] = useState([]);


  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isMobileOpen]);


  useEffect(() => {
    setUserRole(getUserRole());
  }, []);


  useEffect(() => {
    if (userRole?.toLowerCase() !== "retailer") return;

    async function fetchServices() {
      try {
        const { data } = await axios.get(`${BASE_URL}categories/`);

        const allowedIds = [5, 2, 6, 4, 3];

        const mapped = data
          .filter((cat) => allowedIds.includes(cat.id))
          .map((cat) => ({
            label: cat.name,
            path: `/services/subservices?category=${cat.id}`,
            apiIcon: cat.icon,
            icon: <FaCogs />,
          }));

        setServices(mapped);
      } catch (err) {
        console.error(err);
      }
    }

    fetchServices();
  }, [userRole]);


  const closeOnMobile = useCallback(() => {
    if (window.innerWidth < 768 && onClose) onClose();
  }, [onClose]);


  const renderIcon = (iconUrl, fallbackIcon) => {
    if (!iconUrl) return fallbackIcon;

    return (
      <div className="relative w-6 h-6">
        <Image
          src={iconUrl}
          alt="icon"
          fill
          className="object-contain brightness-0 invert"
        />
      </div>
    );
  };


  const dashboardRoute = (() => {
    switch (userRole?.toLowerCase()) {
      case "admin":
        return "/admin";
      case "dealer":
        return "/dealer";
      case "master":
        return "/master";
      default:
        return "/";
    }
  })();

  /* ---------------------- Base Menu ---------------------- */

  const baseMenu = [
    { label: "Home", path: dashboardRoute, icon: <FaHome /> },
  ];


  const adminMenu = [
    ...baseMenu,
     { label: "View List", path: "/lons/apply/aplicantlist", icon: <FaList /> },
    { label: "Category", path: "/loan/category", icon: <FaUserShield /> },
    // { label: "Add Bank", path: "/addbank", icon: <FaUniversity /> },
    // { label: "Add Commission", path: "/add-commission", icon: <FaPlusCircle /> },
    // { label: "Commission", path: "/commission", icon: <FaChartBar /> },
    // { label: "Assign Scheme", path: "/assignscheme", icon: <FaUserPlus /> },
    // { label: "Fund Requests", path: "/fundrequests", icon: <FaHandHoldingUsd /> },
    // { label: "Service Management", path: "/adminpannel", icon: <FaCogs /> },
    // { label: "Sign Up Request", path: "/signuprequest", icon: <FaUsers /> },
    // { label: "Refunds", path: "/refunds", icon: <FaUndoAlt /> },
    // { label: "Reports", path: "/reports", icon: <FaRegFileAlt /> },
    // { label: "Admin Helpdesk", path: "/adminhelpdesk", icon: <FaHeadset /> },
    // { label: "Check Status", path: "/status", icon: <FaChartLine /> },
  ];


  const masterMenu = [
    ...baseMenu,
    { label: "User Management", path: "/usersonboarding", icon: <FaUsers /> },
    { label: "Add Commission", path: "/add-commission", icon: <FaPlusCircle /> },
    { label: "Assign Scheme", path: "/assignscheme", icon: <FaUserPlus /> },
    { label: "Fund Requests", path: "/fundrequests", icon: <FaHandHoldingUsd /> },
    { label: "Sign Up Request", path: "/signuprequest", icon: <FaUsers /> },
    { label: "Commission", path: "/commission", icon: <FaChartBar /> },
    { label: "Add Bank", path: "/addbank", icon: <FaUniversity /> },
    { label: "Reports", path: "/reports", icon: <FaRegFileAlt /> },
    { label: "Check Status", path: "/status", icon: <FaChartLine /> },
    { label: "Help Desk", path: "/helpdesk", icon: <FaHeadset /> },
  ];


  const dealerMenu = masterMenu;


  const retailerMenu = [
    ...baseMenu,
    ...services,

    {
      label: "My Applications",
      path: "/my-applications",
      icon: <FaFileAlt size={18} />,
    },

    {
      label: "My Loans",
      path: "/lons/apply",
      icon: <FaMoneyBillWave size={18} />,
    },

    {
      label: "Profile",
      path: "/profile",
      icon: <FaUserCircle size={18} />,
    },

    {
      label: "Credit Reports",
      path: "/reports",
      icon: <FaChartBar size={18} />,
    },

    {
      label: "Consent Preference",
      path: "/status",
      icon: <FaChartLine size={18} />,
    },

    {
      label: "About LMS",
      path: "/about",
      icon: <FaInfoCircle size={18} />,
    },

    {
      label: "Contact Us",
      path: "/contact",
      icon: <FaPhoneAlt size={18} />,
    },

    {
      label: "Policy Terms",
      path: "/policy",
      icon: <FaFileContract size={18} />,
    },
  ];


  const getMenuForRole = () => {
    switch (userRole?.toLowerCase()) {
      case "admin":
        return adminMenu;
      case "dealer":
        return dealerMenu;
      case "master":
        return masterMenu;
      case "retailer":
        return retailerMenu;
      default:
        return baseMenu;
    }
  };

  const roleBasedMenu = getMenuForRole();


  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen
        bg-gradient-to-b from-[#0f172a] via-[#1e3a8a] to-[#2563eb]
        text-white
        transition-all duration-300
        ${isCollapsed ? "w-16" : "w-64"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >

        <div className="flex items-center justify-center h-16 border-b border-white/20">
          <div
            className={`relative transition-all duration-300 ${isCollapsed ? "w-10 h-10" : "w-40 h-10"
              }`}
          >
            <Image
              src={isCollapsed ? "/lms.jpg" : "/lms.jpg"}
              alt="logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>


        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
          {roleBasedMenu.map((item, i) => {
            const active =
              pathname === item.path ||
              (item.path.includes("category") &&
                item.path.includes(currentCategory));

            return (
              <Link
                key={i}
                href={item.path}
                onClick={closeOnMobile}
                className={`group flex items-center rounded-lg
                transition-all duration-200
                ${isCollapsed
                    ? "justify-center py-3"
                    : "gap-3 px-3 py-3"
                  }
                ${active
                    ? "bg-white text-blue-700 shadow-lg"
                    : "hover:bg-white/20"
                  }`}
              >
                <div className="text-lg">{renderIcon(item.apiIcon, item.icon)}</div>

                {!isCollapsed && (
                  <span className="text-sm font-medium tracking-wide">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}