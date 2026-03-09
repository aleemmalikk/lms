"use client";

import { useEffect, useState } from "react";
import { getWithAuth } from "../../lib/api";

export default function RiskReviewPage() {

  const [apps, setApps] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getWithAuth("loan-applications/");
    const filtered = res.filter(a => a.status === "risk_review");
    setApps(filtered);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-5">Risk Review Applications</h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th>Name</th>
            <th>CIBIL</th>
            <th>FOIR</th>
            <th>Risk Score</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {apps.map((a) => (
            <tr key={a.id} className="border-b">
              <td>{a.full_name}</td>
              <td>{a.cibil_score}</td>
              <td>{a.foir}%</td>
              <td>{a.risk_score}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}