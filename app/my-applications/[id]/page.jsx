"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getWithAuth } from "../../lib/api";
import { User, Mail, Phone, CreditCard, Shield } from "lucide-react";

export default function ApplicationDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    const res = await getWithAuth(`loan-applications/${id}/`);
    setData(res);
  };

  if (!data) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading application...
      </div>
    );
  }

  const statusColors = {
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    risk_review: "bg-yellow-100 text-yellow-700",
    disbursed: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="bg-white shadow rounded-xl p-5 mb-6 flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Loan Application
          </h1>

          <p className="text-sm text-gray-500">
            ID: {id}
          </p>
        </div>

        <span
          className={`px-3 py-1 text-sm rounded-full font-medium ${
            statusColors[data.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {data.status}
        </span>
      </div>

      {/* Applicant Section */}
      <Section title="Applicant Information">

        <Row icon={<User size={18} />} label="Full Name" value={data.full_name} />
        <Row icon={<Mail size={18} />} label="Email" value={data.email} />
        <Row icon={<Phone size={18} />} label="Phone" value={data.phone} />
        <Row icon={<CreditCard size={18} />} label="PAN Number" value={data.pan_number} />

      </Section>

      {/* Loan Section */}
      <Section title="Loan Details">

        <Row label="Loan Category" value={data.category.name} />
        <Row label="Requested Amount" value={`₹${data.requested_amount}`} />
        <Row label="CIBIL Score" value={data.cibil_score} />
        <Row label="FOIR" value={`${data.foir}%`} />

      </Section>

    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white shadow rounded-xl p-5 mb-6">

      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        {title}
      </h2>

      <div className="space-y-3">
        {children}
      </div>

    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 text-sm">

      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        {label}
      </div>

      <div className="font-medium text-gray-800">
        {value || "N/A"}
      </div>

    </div>
  );
}