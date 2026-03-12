"use client";

import { useEffect, useState } from "react";
import { getWithAuth, getUserRole, postWithAuth } from "../lib/api";
import {
  FaPhone,
  FaSms,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendar,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlus,
  FaHistory
} from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function CollectionDashboard() {
  const [userRole, setUserRole] = useState(null);
  const [overdueAccounts, setOverdueAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    
    // Redirect if not admin
    if (role !== "admin" && role !== "superadmin") {
      router.push("/");
      return;
    }
    
    fetchOverdueAccounts();
  }, []);

  const fetchOverdueAccounts = async () => {
    try {
      // Replace with actual API
      // const data = await getWithAuth("collection/overdue-accounts/");
      // setOverdueAccounts(data);
      
      // Mock data
      setOverdueAccounts(mockOverdueAccounts);
    } catch (error) {
      console.error("Error fetching overdue accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (activityData) => {
    try {
      await postWithAuth(`collection/${selectedAccount.id}/add-activity/`, activityData);
      setShowActivityModal(false);
      fetchOverdueAccounts();
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  const getBucketColor = (days) => {
    if (days <= 30) return "bg-yellow-100 text-yellow-700";
    if (days <= 60) return "bg-orange-100 text-orange-700";
    if (days <= 90) return "bg-red-100 text-red-700";
    return "bg-red-200 text-red-800";
  };

  if (userRole !== "admin" && userRole !== "superadmin") {
    return null;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Collection Dashboard</h1>

      {/* Bucket Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <BucketCard
          title="1-30 Days"
          count={15}
          amount="₹12,50,000"
          color="bg-yellow-500"
        />
        <BucketCard
          title="30-60 Days"
          count={8}
          amount="₹7,25,000"
          color="bg-orange-500"
        />
        <BucketCard
          title="60-90 Days"
          count={4}
          amount="₹3,80,000"
          color="bg-red-500"
        />
        <BucketCard
          title="90+ Days (NPA)"
          count={2}
          amount="₹1,95,000"
          color="bg-red-700"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>All Buckets</option>
            <option>1-30 Days</option>
            <option>30-60 Days</option>
            <option>60-90 Days</option>
            <option>90+ Days</option>
          </select>
          
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>All Branches</option>
            <option>Branch A</option>
            <option>Branch B</option>
          </select>
          
          <input
            type="text"
            placeholder="Search by name, loan ID..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Overdue Accounts List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">Overdue Accounts</h2>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            overdueAccounts.map((account) => (
              <CollectionRow
                key={account.id}
                account={account}
                onSelect={() => {
                  setSelectedAccount(account);
                  setShowActivityModal(true);
                }}
                bucketColor={getBucketColor(account.daysOverdue)}
              />
            ))
          )}
        </div>
      </div>

      {/* Activity Modal */}
      {showActivityModal && selectedAccount && (
        <ActivityModal
          account={selectedAccount}
          onClose={() => setShowActivityModal(false)}
          onSave={handleAddActivity}
        />
      )}
    </div>
  );
}

function BucketCard({ title, count, amount, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        <div className={`${color} text-white p-2 rounded-lg`}>
          <FaExclamationTriangle size={14} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{count}</p>
      <p className="text-sm text-gray-600 mt-1">{amount}</p>
    </div>
  );
}

function CollectionRow({ account, onSelect, bucketColor }) {
  return (
    <div
      className="p-4 hover:bg-gray-50 cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">{account.customerName}</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full ${bucketColor}`}>
              {account.daysOverdue} days
            </span>
          </div>
          <p className="text-sm text-gray-500">Loan ID: {account.loanId}</p>
          <p className="text-sm text-gray-500">Phone: {account.phone}</p>
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium">Outstanding: ₹{account.outstanding}</p>
          <p className="text-sm text-gray-500">EMI: ₹{account.emiAmount}</p>
          <p className="text-sm text-gray-500">Due: {account.dueDate}</p>
        </div>

        <div className="flex-1">
          <p className="text-sm text-gray-500">Last Activity:</p>
          <p className="text-sm font-medium">{account.lastActivity}</p>
          <p className="text-xs text-gray-400">{account.lastActivityDate}</p>
        </div>

        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            <FaPhone />
          </button>
          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
            <FaSms />
          </button>
          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
            <FaEnvelope />
          </button>
          <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
            <FaHistory />
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityModal({ account, onClose, onSave }) {
  const [activity, setActivity] = useState({
    type: "call",
    notes: "",
    followUpDate: "",
    contactPerson: account.customerName,
    contactNumber: account.phone
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(activity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Collection Activity</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium">{account.customerName}</p>
          <p className="text-sm text-gray-600">Loan: {account.loanId}</p>
          <p className="text-sm text-gray-600">Outstanding: ₹{account.outstanding}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type
            </label>
            <select
              value={activity.type}
              onChange={(e) => setActivity({...activity, type: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="call">Phone Call</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="field_visit">Field Visit</option>
              <option value="notice">Legal Notice</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={activity.notes}
              onChange={(e) => setActivity({...activity, notes: e.target.value})}
              rows="3"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter activity details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Date
            </label>
            <input
              type="date"
              value={activity.followUpDate}
              onChange={(e) => setActivity({...activity, followUpDate: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Save Activity
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Mock data
const mockOverdueAccounts = [
  {
    id: 1,
    customerName: "Rahul Sharma",
    loanId: "LN001",
    phone: "9876543210",
    outstanding: "1,50,000",
    emiAmount: "12,500",
    dueDate: "2024-02-15",
    daysOverdue: 25,
    lastActivity: "Called - No response",
    lastActivityDate: "2024-03-09"
  },
  {
    id: 2,
    customerName: "Priya Patel",
    loanId: "LN002",
    phone: "9876543211",
    outstanding: "2,25,000",
    emiAmount: "18,750",
    dueDate: "2024-01-20",
    daysOverdue: 45,
    lastActivity: "SMS sent",
    lastActivityDate: "2024-03-08"
  },
  {
    id: 3,
    customerName: "Amit Kumar",
    loanId: "LN003",
    phone: "9876543212",
    outstanding: "3,50,000",
    emiAmount: "29,167",
    dueDate: "2023-12-10",
    daysOverdue: 75,
    lastActivity: "Field visit scheduled",
    lastActivityDate: "2024-03-07"
  }
];