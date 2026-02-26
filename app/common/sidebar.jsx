"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import axios from "axios";

import {
  FaHome,
  FaCog,
  FaRegFileAlt,
  FaCogs,
  FaHandHoldingUsd,
  FaTimes,
  FaUserShield,
  FaUsers,
  FaChartBar,
  FaPlusCircle,
  FaHeadset,
  FaChartLine,
  FaUniversity,
  FaUndoAlt,
  FaUserPlus,
} from "react-icons/fa";

import { getUserRole, BASE_URL } from "../lib/api";

export default function Sidebar({ isMobileOpen, isCollapsed, onToggle, onClose }) {
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
    if (userRole?.toLowerCase() !== "retailer") {
      setServices([]);
      return;
    }

    async function fetchServices() {
      try {
        const { data } = await axios.get(`${BASE_URL}categories/`);
        const allowedIds = [5, 2, 6, 4, 3];

        const mapped = data
          .filter((cat) => allowedIds.includes(cat.id))
          .map((cat) => {

            return null;
          })
          .filter(Boolean);

        const orderPriority = [
          "/services/subservices?category=6",
          "/dmt",
          "/recharge",
          "/dth-recharge",
        ];

        mapped.sort((a, b) => {
          return (
            orderPriority.indexOf(a.path) -
            orderPriority.indexOf(b.path)
          );
        });

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

  const baseMenu = [
    { label: "Home", path: dashboardRoute, icon: <FaHome /> },
  ];

  const adminMenu = [
    ...baseMenu,
   
    { label: "Catogeory", path: "/catogeory", icon: <FaChartLine /> },
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

  const dealerMenu = [
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



  const retailerMenu = [
    ...baseMenu,
    ...services,
    // { label: "commission", path: "/commission", icon: <FaChartBar /> },
    // { label: "Add Bank", path: "/addbank", icon: <FaUniversity /> },
    // { label: "Reports", path: "/reports", icon: <FaRegFileAlt /> },
    // { label: "Check Status", path: "/status", icon: <FaChartLine /> },
    // { label: "Refunds", path: "/refunds", icon: <FaUndoAlt /> },
    { label: "loan", path: "/loan", icon: <FaHeadset /> },
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
    bg-gradient-to-b from-[#bff6dc] via-[#c4def0] to-[#bad0ee]
    transition-all duration-300
    ${isCollapsed ? "w-16" : "w-64"}
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
      >


        <div className="flex-shrink-0 flex items-center justify-between border-b border-[#1e3a8a] md:hidden">
          <Image src="/image/lms.jpg" alt="Logo" width={40} height={40} />
          <button onClick={onClose} className="text-white hover:text-blue-300">
            <FaTimes size={20} />
          </button>
        </div>

        <div
          className="flex items-center justify-center gap-2
    px-3 py-2.5
    bg-gradient-to-r from-[#34d399] via-[#60a5fa] to-[#3b82f6]
    border-b border-white/40"
        >
          <div
            className={`relative transition-all duration-300
      ${isCollapsed
                ? "w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-white"
                : "w-44 h-10"
              }
    `}
          >
            <Image
              src={isCollapsed ? "/lms.jpg" : "/lms.jpg"}
              alt="Logo"
              fill
              className={`object-contain ${isCollapsed ? "rounded-full p-1" : ""
                }`}
              priority
            />
          </div>

          {!isCollapsed && userRole && (
            <span className="px-2 py-1 bg-white/90 text-blue-700 text-xs rounded-full capitalize font-semibold">
              {userRole}
            </span>
          )}
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <nav className="flex-1 overflow-y-auto p-1 space-y-1 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-800">
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
                  className={`text-xl flex items-center py-1.5 mb-4 mt-2 rounded-xl transition-colors duration-200
    ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"}
    ${active
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-black hover:bg-green-600/50 hover:text-white"
                    }`}
                >

                  {renderIcon(item.apiIcon, item.icon)}
                  <span className={`${isCollapsed ? "hidden" : "block"}`}>
                    {item.label}
                  </span>

                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}