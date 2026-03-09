"use client";

export default function LoansCard() {
  return (
    <div className="w-full max-w-4xl m-0 p-0">

      <div className="bg-white rounded-md shadow-md overflow-hidden m-0 p-0">

        <div className="bg-gradient-to-r from-blue-700 to-indigo-500 px-6 py-3 m-0">
          <h2 className="text-white text-2xl font-semibold m-0">
            Loans
          </h2>
        </div>

        <div className="px-6 py-4 text-gray-500 text-xl m-0">
          There are no active loans to display
        </div>

      </div>

    </div>
  );
}