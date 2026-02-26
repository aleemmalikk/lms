"use client";
import React from "react";
import Link from "next/link";
import {
  FaFileInvoice,
  FaMobileAlt,
  FaShieldAlt,
  FaTv,
  FaMoneyBillWave,
} from "react-icons/fa";

const ReportsPage = () => {
  const reports = [
    {
      title: "Bill Payment",
      icon: <FaFileInvoice className="text-[#2e8b57] text-3xl" />,
      count: 24,
      link: "/reports/bill-payment",
    },
    {
      title: "DMT",
      icon: <FaMoneyBillWave className="text-[#2e8b57] text-3xl" />,
      count: 24,
      link: "/reports/dmt",
    },
    {
      title: "Mobile Recharge",
      icon: <FaMobileAlt className="text-[#2e8b57] text-3xl" />,
      count: 24,
      link: "/reports/mobile-recharge",
    },
    {
      title: "DTH/Cable Recharge",
      icon: <FaTv className="text-[#2e8b57] text-3xl" />,
      count: 24,
      link: "/reports/dth-cable-recharge",
    },
    {
      title: "Commission",
      icon: <FaShieldAlt className="text-[#2e8b57] text-3xl" />,
      count: 24,
      link: "/reports/commission",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-green-700 mb-6">Reports</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {reports.map((report, index) => (
          <Link
            href={report.link}
            key={index}
            className="bg-white border border-green-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center p-6 cursor-pointer block"
          >
            <div className="flex justify-center mb-3">
              <div className="bg-green-50 p-4 rounded-full flex items-center justify-center">
                {report.icon}
              </div>
            </div>
            <p className="text-gray-700 font-medium">{report.title}</p>
            <p className="text-black font-bold text-lg mt-1">{report.count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
