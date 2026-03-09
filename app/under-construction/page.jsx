"use client";

import Link from "next/link";
import { FaTools } from "react-icons/fa";
import { useSearchParams } from "next/navigation";

export default function UnderConstruction() {

  const params = useSearchParams();
  const type = params.get("type");

  const titles = {
    consent: "Consent Preference",
    about: "About LMS",
    contact: "Contact Us",
    policy: "Policy Terms"
  };

  return (
    <div className="lex items-center justify-center bg-white px-4">

      <div className="text-center pt-20">

        <div className="flex justify-center mb-6">
          <FaTools className="text-blue-600 text-6xl animate-bounce" />
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          {titles[type] || "Page"} Under Construction
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          We're working hard to bring this feature to you soon.
          Please check back later.
        </p>

        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg
          hover:bg-blue-700 transition font-medium"
        >
          Go Back Home
        </Link>

      </div>

    </div>
  );
}