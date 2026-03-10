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
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import {
  Users,
  IndianRupee,
  Percent,
  UserCheck,
  Calendar,
} from "lucide-react";

/* -------------------- DATA -------------------- */

const loanTypeData = [
  { name: "Personal Loan", value: 220 },
  { name: "Business Loan", value: 150 },
  { name: "Home Loan", value: 80 },
  { name: "Vehicle Loan", value: 50 },
];

const loanStatusData = [
  { name: "Approved", value: 300 },
  { name: "Pending", value: 120 },
  { name: "Rejected", value: 80 },
];

const loanDisbursementByDay = [
  { day: "Mon", loans: 20 },
  { day: "Tue", loans: 35 },
  { day: "Wed", loans: 28 },
  { day: "Thu", loans: 40 },
  { day: "Fri", loans: 52 },
  { day: "Sat", loans: 30 },
];

const loanAmountDistribution = [
  { range: "0-1L", count: 120 },
  { range: "1L-5L", count: 210 },
  { range: "5L-10L", count: 110 },
  { range: "10L+", count: 60 },
];

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#A78BFA"];

/* -------------------- COMPONENT -------------------- */

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          Loan Analytics Dashboard
        </h1>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={<Users />} title="Total Customers" value="500" />
        <StatCard icon={<UserCheck />} title="Approved Loans" value="300" />
        <StatCard icon={<IndianRupee />} title="Total Loan Amount" value="₹4.8Cr" />
        <StatCard icon={<Percent />} title="Average Interest Rate" value="12.4%" />
        <StatCard icon={<Calendar />} title="Avg Tenure" value="28 Months" />
      </div>

      {/* ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Loan Type */}
        <Card title="Loans by Type">
          <div className="w-full h-[250px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={loanTypeData} dataKey="value" outerRadius={90}>
                  {loanTypeData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Loan Status */}
        <Card title="Loan Application Status">
          <div className="w-full h-[250px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={loanStatusData} dataKey="value" outerRadius={90}>
                  {loanStatusData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Loan Amount Distribution */}
        <Card title="Loan Amount Distribution">
          <div className="w-full h-[250px]">
            <ResponsiveContainer>
              <BarChart data={loanAmountDistribution}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#22C55E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Loan Disbursement */}
        <Card title="Loans Disbursed This Week">
          <div className="w-full h-[250px]">
            <ResponsiveContainer>
              <LineChart data={loanDisbursementByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="loans" stroke="#3B82F6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Loan Types Bar */}
        <Card title="Loan Types Overview">
          <div className="w-full h-[250px]">
            <ResponsiveContainer>
              <BarChart data={loanTypeData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
}

/* -------------------- SMALL COMPONENTS -------------------- */

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 border flex items-center gap-4">
      <div className="text-blue-500">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 border">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

