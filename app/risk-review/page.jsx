"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWithAuth } from "../lib/api";
import { 
  ShieldExclamationIcon, 
  UserCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function RiskReviewPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterScore, setFilterScore] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getWithAuth("loan-applications/");
      const filtered = res.filter(a => a.status === "risk_review");
      setApps(filtered);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (e, appId) => {
    e.stopPropagation();
    router.push(`/my-applications/${appId}`);
  };

  const getRiskBadgeColor = (score) => {
    if (score >= 80) return "bg-red-100 text-red-800 border-red-200";
    if (score >= 60) return "bg-orange-100 text-orange-800 border-orange-200";
    if (score >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getCIBILColor = (score) => {
    if (score >= 750) return "text-green-600 font-semibold";
    if (score >= 650) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  const filteredApps = filterScore === 'all' 
    ? apps 
    : apps.filter(app => {
        if (filterScore === 'high') return app.risk_score >= 70;
        if (filterScore === 'medium') return app.risk_score >= 40 && app.risk_score < 70;
        if (filterScore === 'low') return app.risk_score < 40;
        return true;
      });

  const stats = {
    total: apps.length,
    highRisk: apps.filter(a => a.risk_score >= 70).length,
    mediumRisk: apps.filter(a => a.risk_score >= 40 && a.risk_score < 70).length,
    lowRisk: apps.filter(a => a.risk_score < 40).length,
    averageCIBIL: Math.round(apps.reduce((acc, a) => acc + (a.cibil_score || 0), 0) / (apps.length || 1))
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading risk review applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Risk Review Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and assess high-risk loan applications</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowPathIcon className="h-5 w-5 text-gray-500" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">High Risk</p>
                <p className="text-3xl font-bold text-red-600">{stats.highRisk}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ShieldExclamationIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Medium Risk</p>
                <p className="text-3xl font-bold text-orange-600">{stats.mediumRisk}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Low Risk</p>
                <p className="text-3xl font-bold text-green-600">{stats.lowRisk}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg. CIBIL</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageCIBIL}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter by Risk Level:</span>
            <button
              onClick={() => setFilterScore('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterScore === 'all' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterScore('high')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterScore === 'high' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setFilterScore('medium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterScore === 'medium' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              Medium Risk
            </button>
            <button
              onClick={() => setFilterScore('low')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterScore === 'low' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Low Risk
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  CIBIL Score
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  FOIR
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApps.length > 0 ? (
                filteredApps.map((a) => (
                  <tr 
                    key={a.id} 
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {a.full_name?.charAt(0) || 'U'}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{a.full_name}</div>
                          <div className="text-sm text-gray-500">ID: {a.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={getCIBILColor(a.cibil_score)}>
                        {a.cibil_score || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{a.foir || 0}%</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(a.foir || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(a.risk_score)}`}>
                        {a.risk_score || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></span>
                        Risk Review
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                        onClick={(e) => handleReviewClick(e, a.id)}
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Review Application</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <ShieldExclamationIcon className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-lg font-medium text-gray-600 mb-1">No applications found</p>
                      <p className="text-sm text-gray-500">There are no applications currently in risk review.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}