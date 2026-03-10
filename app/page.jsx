"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  Treemap,
  ScatterChart,
  Scatter,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import {
  Users,
  IndianRupee,
  Calendar,
  Star,
  Percent,
} from "lucide-react";

import { isAuthenticated } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const repaymentData = [
  { name: "On Time", value: 369 },
  { name: "Late", value: 86 },
  { name: "Defaulted", value: 45 },
];

const regionData = [
  { region: "South", value: 141 },
  { region: "North", value: 137 },
  { region: "Central", value: 130 },
  { region: "East", value: 116 },
  { region: "West", value: 108 },
];

const branchData = [
  { branch: "B001", ontime: 7, late: 3, defaulted: 1 },
  { branch: "B002", ontime: 6, late: 2, defaulted: 1 },
  { branch: "B003", ontime: 8, late: 4, defaulted: 2 },
  { branch: "B004", ontime: 5, late: 3, defaulted: 1 },
];

const treemapData = [
  { name: "CUST_0458", size: 2499000 },
  { name: "CUST_0130", size: 2493000 },
  { name: "CUST_0433", size: 2487000 },
  { name: "CUST_0177", size: 2480000 },
  { name: "CUST_0125", size: 2472000 },
  { name: "CUST_0146", size: 2471000 },
];

const scatterData = Array.from({ length: 80 }).map(() => ({
  x: Math.floor(Math.random() * 5) + 1,
  y: Math.floor(Math.random() * 3000000),
}));

const COLORS = ["#1E40AF", "#A78BFA", "#86EFAC"];

export default function Dashboard() {
  const router = useRouter();
  const loggedIn = isAuthenticated();

  // Optional: Redirect to login if not authenticated
  // useEffect(() => {
  //   if (!loggedIn) {
  //     router.push('/login');
  //   }
  // }, [loggedIn, router]);

  return (
    <div
      className={`min-h-screen transition-all
      ${loggedIn ? "p-4 md:p-6 mt-[80px]" : "p-4 md:p-10"}`}
    >
      {/* Show different content based on login status */}
      {!loggedIn ? (
        // Full screen content for non-logged in users
        <div className="max-w-7xl mx-auto">
          {/* Public Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-orange-500 mb-4">
              NBFC Lending Analytics Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              View our comprehensive lending analytics and insights
            </p>
          </div>

          {/* STAT CARDS - Public View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard icon={<Users />} title="Number of Customers" value="500" />
            <StatCard icon={<IndianRupee />} title="Total Loan Amount" value="633.39M" />
            <StatCard icon={<Calendar />} title="Average Tenure (Months)" value="31.01" />
            <StatCard icon={<Star />} title="Average Feedback Score" value="2.99" />
            <StatCard icon={<Percent />} title="Average Interest Rate" value="13.04" />
          </div>

          {/* CHART ROW 1 - Public View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card title="Number of Customers by Repayment Status">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={repaymentData}
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {repaymentData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Total Loan Amount by Region">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData}>
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#22C55E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Customers by Branch & Repayment">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchData}>
                    <XAxis dataKey="branch" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ontime" fill="#1E40AF" />
                    <Bar dataKey="late" fill="#A78BFA" />
                    <Bar dataKey="defaulted" fill="#86EFAC" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* CHART ROW 2 - Public View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="Top 10 Loans by Customer and Tenure">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    stroke="#fff"
                    fill="#3B82F6"
                  >
                    <Tooltip />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Feedback Score vs Loan Amount">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis dataKey="x" name="Feedback Score" />
                    <YAxis dataKey="y" name="Loan Amount" />
                    <Tooltip />
                    <Scatter data={scatterData} fill="#F59E0B" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Public Footer Message */}
          <div className="mt-10 text-center text-gray-500 border-t pt-6">
            <p>Login to access detailed analytics and personalized insights</p>
          </div>
        </div>
      ) : (
        // Logged-in view (existing layout)
        <>
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-xl md:text-3xl font-bold text-orange-500">
              NBFC Lending Analytics - Customer Analytics
            </h1>

            <div>
              <label className="mr-2 font-medium">Branch ID</label>
              <select className="border px-3 py-1 rounded bg-white">
                <option>All</option>
                <option>B001</option>
                <option>B002</option>
              </select>
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard icon={<Users />} title="Number of Customers" value="500" />
            <StatCard icon={<IndianRupee />} title="Total Loan Amount" value="633.39M" />
            <StatCard icon={<Calendar />} title="Average Tenure (Months)" value="31.01" />
            <StatCard icon={<Star />} title="Average Feedback Score" value="2.99" />
            <StatCard icon={<Percent />} title="Average Interest Rate" value="13.04" />
          </div>

          {/* CHART ROW 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card title="Number of Customers by Repayment Status">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={repaymentData}
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {repaymentData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Total Loan Amount by Region">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData}>
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#22C55E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Customers by Branch & Repayment">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchData}>
                    <XAxis dataKey="branch" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ontime" fill="#1E40AF" />
                    <Bar dataKey="late" fill="#A78BFA" />
                    <Bar dataKey="defaulted" fill="#86EFAC" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* CHART ROW 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="Top 10 Loans by Customer and Tenure">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    stroke="#fff"
                    fill="#3B82F6"
                  >
                    <Tooltip />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Feedback Score vs Loan Amount">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis dataKey="x" name="Feedback Score" />
                    <YAxis dataKey="y" name="Loan Amount" />
                    <Tooltip />
                    <Scatter data={scatterData} fill="#F59E0B" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 border flex items-center gap-4">
      <div className="text-orange-500">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 border w-full">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}