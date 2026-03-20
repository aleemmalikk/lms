"use client";

import React from "react";

export default function ProfileCompletionPopup({
  open,
  profileData,
  setProfileData,
  onUpdate,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center">
          Complete Your Profile ⚡
        </h2>

        <input
          placeholder="PAN Number"
          value={profileData.pan_number || ""}
          onChange={(e) =>
            setProfileData({
              ...profileData,
              pan_number: e.target.value,
            })
          }
          className="w-full border p-3 rounded-xl mb-3"
        />

        <input
          placeholder="Monthly Income"
          value={profileData.monthly_income || ""}
          onChange={(e) =>
            setProfileData({
              ...profileData,
              monthly_income: e.target.value,
            })
          }
          className="w-full border p-3 rounded-xl mb-3"
        />

        <input
          placeholder="CIBIL Score"
          value={profileData.cibil_score || ""}
          onChange={(e) =>
            setProfileData({
              ...profileData,
              cibil_score: e.target.value,
            })
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <button
          onClick={onUpdate}
          className="w-full bg-indigo-600 text-white py-2 rounded-xl"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
}