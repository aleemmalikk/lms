import React from "react";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-blue-600">Fintech Portal</h1>

        <div className="space-x-6 font-medium">
          <button className="hover:text-blue-600">Home</button>
          <button className="hover:text-blue-600">Services</button>
          <button className="hover:text-blue-600">About</button>
          <button className="hover:text-blue-600">Contact</button>
        </div>

        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
          Login
        </button>
      </nav>


      {/* Hero Section */}
      <section className="grid md:grid-cols-2 items-center px-10 py-20 gap-10">

        <div>
          <h1 className="text-5xl font-bold text-gray-800 leading-tight">
            Digital Fintech <span className="text-blue-600">Service Platform</span>
          </h1>

          <p className="mt-6 text-gray-600 text-lg">
            Manage wallet, transactions, services, and fund requests easily.
            Fast, secure and reliable platform for retailers, dealers and admins.
          </p>

          <div className="mt-8 flex gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Get Started
            </button>

            <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50">
              Learn More
            </button>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1563013544-824ae1b704d3"
          alt="fintech"
          className="rounded-xl shadow-lg"
        />

      </section>


      {/* Features */}
      <section className="px-10 py-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">
          Platform Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-gray-50 p-8 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-600">Wallet System</h3>
            <p className="text-gray-600 mt-3">
              Secure wallet management with instant balance updates and transaction history.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-600">Fund Requests</h3>
            <p className="text-gray-600 mt-3">
              Easily request funds and manage approvals with full tracking system.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-600">Service Payments</h3>
            <p className="text-gray-600 mt-3">
              Pay for digital services instantly with automated transaction processing.
            </p>
          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="bg-blue-600 text-white text-center py-16 px-6">
        <h2 className="text-3xl font-bold">
          Start Your Fintech Journey Today
        </h2>

        <p className="mt-4 text-blue-100">
          Join our secure digital platform and manage your services easily.
        </p>

        <button className="mt-6 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200">
          Create Account
        </button>
      </section>


    </div>
  );
}

export default HomePage;