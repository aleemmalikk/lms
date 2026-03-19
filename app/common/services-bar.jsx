"use client";

import { useRouter } from "next/navigation";
import {
  FaMobileAlt,
  FaSatelliteDish,
  FaThLarge,
  FaUniversity,
  FaShieldAlt,
  FaChartLine,
  FaCreditCard,
  FaPlane,
  FaFingerprint,
  FaExchangeAlt,
  FaFileInvoiceDollar,
} from "react-icons/fa";

export default function ServicesBar({ isSidebarExpanded }) {
  const router = useRouter();

  const services = [
    // {
    //   label: "AEPS",
    //   icon: <FaFingerprint />,
    //   path: "/aeps",
    //   color: "from-green-500 to-emerald-500",
    // },
    // {
    //   label: "Bill Payment",
    //   icon: <FaThLarge />,
    //   path: "/services/subservices?category=6",
    //   color: "from-indigo-500 to-blue-500",
    // },
    // {
    //   label: "DMT",
    //   icon: <FaExchangeAlt />,
    //   path: "/dmt",
    //   color: "from-blue-500 to-indigo-600",
    // },
    // {
    //   label: "Vendor Payment",
    //   icon: <FaFileInvoiceDollar />,
    //   path: "/vendorpayment",
    //   color: "from-pink-500 to-rose-600",
    // },
    // {
    //   label: "Mobile Recharge",
    //   icon: <FaMobileAlt />,
    //   path: "/recharge",
    //   color: "from-green-500 to-emerald-500",
    // },
    // {
    //   label: "DTH / Cable",
    //   icon: <FaSatelliteDish />,
    //   path: "/dth-recharge",
    //   color: "from-purple-500 to-pink-500",
    // },
    // {
    //   label: "Loan",
    //   icon: <FaUniversity />,
    //   path: "/services/subservices?category=7",
    //   color: "from-orange-500 to-amber-500",
    // },
    // {
    //   label: "Insurance",
    //   icon: <FaShieldAlt />,
    //   path: "/services/subservices?category=8",
    //   color: "from-red-500 to-rose-500",
    // },
    // {
    //   label: "CIBIL Score",
    //   icon: <FaChartLine />,
    //   path: "/civilscore",
    //   color: "from-cyan-500 to-sky-500",
    // },
    // {
    //   label: "Credit Card",
    //   icon: <FaCreditCard />,
    //   path: "/creditcard",
    //   color: "from-yellow-500 to-orange-500",
    // },
    // {
    //   label: "Travel & Stay",
    //   icon: <FaPlane />,
    //   path: "/services/subservices?category=13",
    //   color: "from-teal-500 to-green-500",
    // },
  ];

  // return (
  //   <div
  //     className={`fixed top-[60px] right-0 z-30
  //   transition-all duration-300
  //   ${isSidebarExpanded ? "md:left-64" : "md:left-16"}
  // `}
  //   >
  //     <div
  //       className=" bg-gray-100 shadow-lg rounded-b-xl"
  //       style={{
  //         clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 5% 100%, 0 85%)",
  //       }}
  //     >
  //       <div className="flex justify-start gap-4 px-6 py-2 overflow-x-auto scrollbar-hide">
  //         {services.map((service, i) => (
  //           <button
  //             key={i}
  //             onClick={() => router.push(service.path)}
  //             className="group flex items-center gap-3
  //             rounded-2xl px-2.5 py-1
  //             bg-white
  //             border border-gray-200
  //             shadow-sm hover:shadow-lg
  //             transition-all duration-300
  //             whitespace-nowrap"
  //           >
  //             <div
  //               className={`w-9 h-7 rounded-xl flex items-center justify-center
  //             bg-gradient-to-br ${service.color}
  //             text-white
  //             group-hover:scale-110 transition-transform duration-300`}
  //             >
  //               {service.icon}
  //             </div>

  //             <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
  //               {service.label}
  //             </span>
  //           </button>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );
}
