"use client";

export default function LoanEligibilityPage() {
  const eligibilityData = [
    {
      id: 1,
      user_id: 101,
      eligible_amount: 500000,
      risk_score: 72,
      foir: 45,
      decision: "Approved",
      created_at: "2026-03-11",
    },
    {
      id: 2,
      user_id: 102,
      eligible_amount: 300000,
      risk_score: 60,
      foir: 55,
      decision: "Rejected",
      created_at: "2026-03-10",
    },
    {
      id: 3,
      user_id: 103,
      eligible_amount: 750000,
      risk_score: 80,
      foir: 40,
      decision: "Approved",
      created_at: "2026-03-09",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Loan Eligibility Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Overview of calculated loan eligibility records
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Applications</p>
          <h2 className="text-2xl font-bold mt-2">{eligibilityData.length}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Approved Loans</p>
          <h2 className="text-2xl font-bold mt-2 text-green-600">
            {eligibilityData.filter((i) => i.decision === "Approved").length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Rejected Loans</p>
          <h2 className="text-2xl font-bold mt-2 text-red-600">
            {eligibilityData.filter((i) => i.decision === "Rejected").length}
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-700">
            Loan Eligibility Records
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">User ID</th>
                <th className="px-4 py-3 text-left">Eligible Amount</th>
                <th className="px-4 py-3 text-left">Risk Score</th>
                <th className="px-4 py-3 text-left">FOIR</th>
                <th className="px-4 py-3 text-left">Decision</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>

            <tbody>

              {eligibilityData.map((item) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition"
                >

                  <td className="px-4 py-3 font-medium text-gray-700">
                    #{item.user_id}
                  </td>

                  <td className="px-4 py-3 font-semibold text-blue-600">
                    ₹{item.eligible_amount.toLocaleString()}
                  </td>

                  {/* Risk Score */}
                  <td className="px-4 py-3 w-48">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${item.risk_score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {item.risk_score}
                      </span>
                    </div>
                  </td>

                  {/* FOIR */}
                  <td className="px-4 py-3">
                    <span className="text-gray-700">{item.foir}%</span>
                  </td>

                  {/* Decision */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        item.decision === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.decision}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {item.created_at}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      </div>
    </div>
  );
}