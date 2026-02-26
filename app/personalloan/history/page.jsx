"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    FaHistory,
    FaArrowLeft,
    FaSearch,
    FaFilter,
    FaDownload,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaCreditCard,
    FaChevronRight,
    FaCalendarAlt,
    FaUser,
    FaPhone,
    FaIdCard
} from "react-icons/fa";
import { BASE_URL, getAuthToken } from "../../lib/api";


function StatusBadge({ status }) {
    const statusConfig = {
        success: {
            icon: FaCheckCircle,
            color: "bg-emerald-100 text-emerald-700 border-emerald-200"
        },
        approved: {
            icon: FaCheckCircle,
            color: "bg-emerald-100 text-emerald-700 border-emerald-200"
        },
        pending: {
            icon: FaClock,
            color: "bg-amber-100 text-amber-700 border-amber-200"
        },
        failed: {
            icon: FaTimesCircle,
            color: "bg-rose-100 text-rose-700 border-rose-200"
        },
        rejected: {
            icon: FaTimesCircle,
            color: "bg-rose-100 text-rose-700 border-rose-200"
        }
    };

    const config = statusConfig[status?.toLowerCase()] || {
        icon: FaClock,
        color: "bg-gray-100 text-gray-700 border-gray-200"
    };

    const Icon = config.icon;

    return (
        <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}>
            <Icon className="text-sm" />
            {status}
        </span>
    );
}


export default function CreditHistoryPage() {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = getAuthToken();
                const res = await fetch(`${BASE_URL}creditlinks/history/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const result = await res.json();
                setData(result.transactions || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const filteredData = data.filter(item =>
        item.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 py-6">

            <div className="max-w-7xl mx-auto px-4">

                <div className="bg-gradient-to-r from-[#34d399] via-[#60a5fa] to-[#3b82f6]
                        text-white rounded-3xl shadow-2xl p-8 mb-8">

                    <div className="flex flex-col md:flex-row justify-between gap-6">

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push("/creditcard")}
                                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition"
                            >
                                <FaArrowLeft />
                            </button>

                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-3">
                                    <FaHistory /> Application History
                                </h1>
                                <p className="text-white/90 mt-1">
                                    Track all credit card applications
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="bg-white/20 px-6 py-3 rounded-xl text-center">
                                <p className="text-sm">Total</p>
                                <p className="text-2xl font-bold">{data.length}</p>
                            </div>
                            <div className="bg-white/20 px-6 py-3 rounded-xl text-center">
                                <p className="text-sm">Success</p>
                                <p className="text-2xl font-bold">
                                    {data.filter(d => d.status === "success").length}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Transaction ID..."
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl
                         focus:border-[#033483] focus:ring-4 focus:ring-[#6DDC01]/30 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-[#033483] font-semibold">
                        Loading...
                    </div>
                ) : filteredData.length > 0 ? (
                    <div className="space-y-3">
                        {filteredData.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md 
                   transition px-6 py-4 border border-gray-100"
                            >
                                <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 text-sm">

                                    <div className="font-mono text-[#033483] font-semibold min-w-[170px]">
                                        #{item.transaction_id}
                                    </div>

                                    <div className="min-w-[110px]">
                                        <StatusBadge status={item.status} />
                                    </div>

                                    <div className="flex items-center gap-2 min-w-[180px]">
                                        <FaUser className="text-gray-400 text-xs" />
                                        <span className="font-medium">{item.customer_name}</span>
                                    </div>

                                    <div className="flex items-center gap-2 min-w-[140px]">
                                        <FaPhone className="text-gray-400 text-xs" />
                                        {item.customer_mobile}
                                    </div>

                                    <div className="flex items-center gap-2 min-w-[130px]">
                                        <FaCalendarAlt className="text-gray-400 text-xs" />
                                        {new Date(item.created_at).toLocaleDateString("en-IN")}
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                ) : (

                    <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-300">
                        <FaHistory className="text-4xl text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Applications Found</h3>
                        <button
                            onClick={() => router.push("/creditcard")}
                            className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r 
                         from-[#033483] to-[#6DDC01] text-white shadow-lg"
                        >
                            Apply Credit Card
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}