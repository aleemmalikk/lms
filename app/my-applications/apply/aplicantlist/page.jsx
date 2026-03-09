"use client";

import { useEffect, useState } from "react";
import { getWithAuth } from "../../../lib/api";
import Link from "next/link";

export default function LoanDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getWithAuth("loan-applications/stats/");
            setStats(data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    if (loading) return <div className="p-10">Loading...</div>;

    const statusMap = {};
    stats.status_breakdown.forEach((item) => {
        statusMap[item.status] = item.count;
    });

    return (
        <div className="">
            <h1 className="text-3xl font-bold mb-5 text-black">
                Loan Applications Dashboard
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6 max-w-6xl mx-auto">
                <Card title="Total" value={stats.total_applications} color="bg-blue-600" />
                <Card title="Approved" value={statusMap.approved || 0} color="bg-green-600" />
                <Card title="Rejected" value={statusMap.rejected || 0} color="bg-red-600" />
                <Card title="Risk Review" value={statusMap.risk_review || 0} color="bg-yellow-500" />
                <Card title="Disbursed" value={statusMap.disbursed || 0} color="bg-purple-600" />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
                <h2 className="text-xl font-semibold mb-6 text-black">
                    Applicant List
                </h2>

                <table className="min-w-full text-sm text-left text-black">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-3">Applicant Name</th>
                            <th className="px-4 py-3">Applicant Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">City</th>
                            <th className="px-4 py-3">PAN</th>
                            <th className="px-4 py-3">Retailer</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">CIBIL</th>
                            <th className="px-4 py-3">FOIR</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Applied On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.applications.map((app) => (
                            <tr key={app.id} className="border-b">
                                <td className="px-4 py-3 font-semibold">
                                    <Link
                                        href={`/my-applications/${app.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {app.full_name || "N/A"}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">
                                    {app.email || "N/A"}
                                </td>
                                <td className="px-4 py-3">
                                    {app.phone || "N/A"}
                                </td>
                                <td className="px-4 py-3">
                                    {app.city || "N/A"}
                                </td>
                                <td className="px-4 py-3">
                                    {app.pan_number || "N/A"}
                                </td>
                                <td className="px-4 py-3">
                                    {app.user.username}
                                </td>
                                <td className="px-4 py-3">
                                    {app.category.name}
                                </td>
                                <td className="px-4 py-3">
                                    ₹{app.requested_amount}
                                </td>
                                <td className="px-4 py-3">
                                    {app.cibil_score}
                                </td>
                                <td className="px-4 py-3">
                                    {app.foir}%
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={app.status} />
                                </td>
                                <td className="px-4 py-3">
                                    {new Date(app.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Card({ title, value, color }) {
    return (
        <div className={`p-3 rounded-lg shadow-sm border border-white/10 ${color}`}>
            <p className="text-xs uppercase tracking-wide opacity-80">
                {title}
            </p>
            <p className="text-xl font-semibold mt-1">
                {value}
            </p>
        </div>
    );
}

function StatusBadge({ status }) {
    const colors = {
        approved: "bg-green-100 text-green-700",
        rejected: "bg-red-100 text-red-700",
        risk_review: "bg-yellow-100 text-yellow-700",
        disbursed: "bg-purple-100 text-purple-700",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-700"}`}>
            {status}
        </span>
    );
}