// app/upcoming/page.jsx
'use client';

import React from 'react';

const upcomingData = [
  {
    id: 1,
    title: 'New Dashboard UI',
    description: 'Completely redesigned dashboard with better analytics.',
    date: 'Feb 10, 2026',
  },
  {
    id: 2,
    title: 'Wallet Auto-Settlement',
    description: 'Automatic settlement of commissions to wallet.',
    date: 'Feb 18, 2026',
  },
  {
    id: 3,
    title: 'Referral Program',
    description: 'Invite users and earn extra commission.',
    date: 'Mar 01, 2026',
  },
];

function PageUpcoming() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <h1 className="text-2xl font-bold mb-6">🚀 Upcoming Updates</h1>

      {/* Upcoming Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingData.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold mb-2">
              {item.title}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {item.description}
            </p>
            <span className="text-xs text-gray-500">
              📅 Expected: {item.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageUpcoming;
