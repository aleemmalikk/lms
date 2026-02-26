"use client";
import React from "react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-5xl w-full flex flex-col">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">
          Contact Us
        </h2>
        <p className="text-gray-500 mb-8">
          We're here to help! Fill form or reach us through other methods.
        </p>

        {/* Main Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Form */}
          <div className="border border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Contact Form
            </h3>
            <form className="space-y-3">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <textarea
                placeholder="Your Message"
                rows="4"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md text-sm transition"
              >
                Submit Message
              </button>
            </form>
          </div>

          {/* Other Contact Methods */}
          <div className="border border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Other Contact Methods
            </h3>
            <div className="space-y-4 text-gray-700 text-sm">
              <div>
                <p className="font-semibold">Customer Support Email:</p>
                <p className="text-blue-600">malik@bharatgrow.com</p>
              </div>
              <div>
                <p className="font-semibold">Phone Number:</p>
                <p>+91 800-123-4667</p>
              </div>
              <div>
                <p className="font-semibold">Corporate Office:</p>
                <p>123 Financial Tower, Noida, India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
