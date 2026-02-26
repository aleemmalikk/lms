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
} from "recharts";
import {
  Users,
  IndianRupee,
  Calendar,
  Star,
  Percent,
} from "lucide-react";

/* -------------------- DATA -------------------- */

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

/* -------------------- COMPONENT -------------------- */

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-500">
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
      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard icon={<Users />} title="Number of Customers" value="500" />
        <StatCard icon={<IndianRupee />} title="Total Loan Amount" value="633.39M" />
        <StatCard icon={<Calendar />} title="Average Tenure (Months)" value="31.01" />
        <StatCard icon={<Star />} title="Average Feedback Score" value="2.99" />
        <StatCard icon={<Percent />} title="Average Interest Rate" value="13.04" />
      </div>

      {/* ROW 1 */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        {/* Donut */}
        <Card title="Number of Customers by Repayment Status">
          <PieChart width={300} height={250}>
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
        </Card>

        {/* Region Bar */}
        <Card title="Total Loan Amount by Region">
          <BarChart width={350} height={250} data={regionData}>
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#22C55E" />
          </BarChart>
        </Card>

        {/* Branch Bar */}
        <Card title="Customers by Branch & Repayment">
          <BarChart width={350} height={250} data={branchData}>
            <XAxis dataKey="branch" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ontime" fill="#1E40AF" />
            <Bar dataKey="late" fill="#A78BFA" />
            <Bar dataKey="defaulted" fill="#86EFAC" />
          </BarChart>
        </Card>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-2 gap-4">

        {/* Treemap */}
        <Card title="Top 10 Loans by Customer and Tenure">
          <Treemap
            width={500}
            height={250}
            data={treemapData}
            dataKey="size"
            stroke="#fff"
            fill="#3B82F6"
          >
            <Tooltip />
          </Treemap>
        </Card>

        {/* Scatter */}
        <Card title="Feedback Score vs Loan Amount">
          <ScatterChart width={500} height={250}>
            <CartesianGrid />
            <XAxis dataKey="x" name="Feedback Score" />
            <YAxis dataKey="y" name="Loan Amount" />
            <Tooltip />
            <Scatter data={scatterData} fill="#F59E0B" />
          </ScatterChart>
        </Card>

      </div>
    </div>
  );
}

/* -------------------- SMALL REUSABLE COMPONENTS -------------------- */

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
    <div className="bg-white shadow-md rounded-xl p-4 border">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}





 