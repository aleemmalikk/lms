"use client";

import { useEffect, useState } from "react";
import {
  IndianRupee, Percent, Clock, Building2, Tag,
  ArrowRight, ChevronDown, CheckCircle, Shield, Zap,
  Star, TrendingUp, GraduationCap, Search, Filter,
  Sparkles, Heart, Bell, User, Menu, X, Globe,
  Award, Lock, ThumbsUp, Phone, Mail, MapPin,
  ChevronRight, Users, Briefcase, Home, Car,
  Gem, Leaf, GraduationCap as GraduationIcon,
  Moon, Sun
} from "lucide-react";
import { isAuthenticated, getWithAuth, BASE_URL } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const loggedIn = isAuthenticated();
  const [loanProducts, setLoanProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchLoanProducts = async () => {
      try {
        setLoading(true);
        let data;
        if (loggedIn) {
          data = await getWithAuth("loan-products/");
        } else {
          const response = await fetch(`${BASE_URL}loan-products/`);
          if (!response.ok) throw new Error("Failed to fetch loan products");
          data = await response.json();
        }
        setLoanProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching loan products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLoanProducts();
  }, [loggedIn]);

  // Enhanced filter options with icons
  const filterOptions = [
    { id: "all", label: "All Loans", icon: <Briefcase size={16} /> },
    { id: "Personal Loan", label: "Personal", icon: <User size={16} /> },
    { id: "Business Loan", label: "Business", icon: <TrendingUp size={16} /> },
    { id: "Home Loan", label: "Home", icon: <Home size={16} /> },
    { id: "Education Loan", label: "Education", icon: <GraduationIcon size={16} /> },
    { id: "Vehicle Loan", label: "Vehicle", icon: <Car size={16} /> },
    { id: "Gold Loan", label: "Gold", icon: <Gem size={16} /> },
  ];

  // Search and filter logic
  const filtered = loanProducts.filter(loan => {
    const matchesFilter = filter === "All" || loan.loan_type === filter || loan.name?.includes(filter);
    const matchesSearch = searchQuery === "" ||
      loan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.loan_type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className=" bg-gray-50 dark:bg-gray-900 transition-colors duration-300">      
      {/* Hero Section */}
      <section className="relative flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-r from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900 bg-[length:200%_200%] animate-gradient">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500/10 to-transparent -top-48 -right-24 animate-float" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500/10 to-transparent -bottom-24 -left-24 animate-float-delayed" />

        <div className="relative z-10 max-w-3xl animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 text-sm font-semibold backdrop-blur-md mb-8">
            <Sparkles size={16} />
            <span>RBI Registered | 100% Secure</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
            Smart Loans for <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Smart People</span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-xl">
            Discover loans with zero hidden charges, instant approval,
            and flexible repayment options tailored to your needs.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-400/30 transition-all inline-flex items-center gap-2 group"
              onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Products <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="px-8 py-3 bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold rounded-full hover:border-blue-400 hover:bg-blue-500/10 transition-all">
              Watch Demo
            </button>
          </div>

          <div className="flex gap-8 mt-5 mb-5">
            {[
              { value: '₹500Cr+', label: 'Loans Disbursed' },
              { value: '50K+', label: 'Happy Customers' },
              { value: '4.8★', label: 'Customer Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Cards */}
        <div className="hidden lg:block absolute right-[5%] top-1/1 -translate-y-1/2 space-y-4 animate-float">
          {[
            { icon: <Zap size={24} />, title: 'Instant Approval', value: 'Under 10 minutes' },
            { icon: <Percent size={24} />, title: 'Interest Rates', value: 'Starting at 7.5%', offset: 'ml-8' },
            { icon: <IndianRupee size={24} />, title: 'Loan Amount', value: 'Up to ₹5 Crore' },
          ].map((card, i) => (
            <div key={i} className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-xl border border-blue-500/20 shadow-xl hover:border-blue-400 transition-all hover:-translate-x-2 ${card.offset || ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  {card.icon}
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">{card.title}</h4>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Search Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-16">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            className="w-full pl-14 pr-36 py-1 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
            placeholder="Search for loans by name, type, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-all inline-flex items-center gap-2">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap gap-3 justify-center">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 font-semibold text-sm transition-all hover:-translate-y-0.5 ${filter === option.id
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              onClick={() => {
                setFilter(option.id);
                setActiveCategory(option.id);
              }}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Featured Loan Products
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose from our wide range of loan products designed to meet your specific needs
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading amazing loans for you...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Oops! Something went wrong: {error}</p>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="text-center mb-8 text-gray-500 dark:text-gray-400">
                Found <strong>{filtered.length}</strong> results for "{searchQuery}"
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((loan, index) => (
                <ProductCard key={loan.id} loan={loan} index={index} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No loans found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We're committed to providing the best loan experience with transparency and speed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={28} />, title: 'Lightning Fast', desc: 'Get approval in minutes, not days' },
              { icon: <Shield size={28} />, title: '100% Secure', desc: 'Bank-grade security for your data' },
              { icon: <ThumbsUp size={28} />, title: 'No Hidden Fees', desc: 'Complete transparency in pricing' },
              { icon: <Award size={28} />, title: 'Best Rates', desc: 'Competitive interest rates guaranteed' },
              { icon: <Users size={28} />, title: 'Expert Support', desc: 'Dedicated relationship managers' },
              { icon: <Lock size={28} />, title: 'Privacy First', desc: 'Your data stays confidential' },
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect loan with us
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/apply" className="px-8 py-3 bg-white text-blue-700 font-bold rounded-full hover:shadow-xl hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
              Apply Now <ArrowRight size={18} />
            </Link>
            <button className="px-8 py-3 bg-transparent border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 hover:border-white transition-all inline-flex items-center gap-2">
              Talk to Expert <Phone size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent mb-4">
                FinLoan
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Your trusted partner for smart financial solutions. We're here to help you achieve your dreams.
              </p>
              <div className="flex gap-3">
                {[Globe, Mail, Phone, MapPin].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: 'Products', links: ['Personal Loan', 'Business Loan', 'Home Loan', 'Education Loan'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'] },
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 FinLoan. All rights reserved. | RBI Registered NBFC</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-gradient {
          animation: gradient 15s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite reverse;
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out;
        }
      `}</style>
    </div>
  );
}

// Enhanced Product Card Component
function ProductCard({ loan, index }) {
  // Color schemes for different loan types
  const colorSchemes = {
    'Personal Loan': { from: 'from-blue-900', to: 'to-blue-600', icon: <User size={24} /> },
    'Business Loan': { from: 'from-cyan-900', to: 'to-cyan-600', icon: <TrendingUp size={24} /> },
    'Home Loan': { from: 'from-green-900', to: 'to-green-600', icon: <Home size={24} /> },
    'Education Loan': { from: 'from-purple-900', to: 'to-purple-600', icon: <GraduationIcon size={24} /> },
    'Vehicle Loan': { from: 'from-orange-900', to: 'to-orange-600', icon: <Car size={24} /> },
    'Gold Loan': { from: 'from-amber-900', to: 'to-amber-600', icon: <Gem size={24} /> },
    'default': { from: 'from-blue-900', to: 'to-blue-600', icon: <Briefcase size={24} /> }
  };

  const scheme = colorSchemes[loan.loan_type] || colorSchemes.default;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:-translate-y-2 hover:scale-[1.02] hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 animate-fadeInUp"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`h-24 bg-gradient-to-r ${scheme.from} ${scheme.to} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
        <span className="absolute top-3 right-3 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/30">
          {loan.loan_type || 'Featured'}
        </span>
      </div>

      <div className="relative px-6 pb-6">
        <div className="absolute -top-6 left-6 w-14 h-14 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-lg">
          <div className={`text-${scheme.to.replace('to-', '')}`}>
            {scheme.icon}
          </div>
        </div>

        <div className="pt-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{loan.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
            {loan.description || 'Flexible loan option with competitive rates'}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-semibold text-gray-600 dark:text-gray-300">
              <Shield size={12} /> Zero Collateral
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-semibold text-gray-600 dark:text-gray-300">
              <Zap size={12} /> Instant Approval
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-semibold text-gray-600 dark:text-gray-300">
              <Clock size={12} /> Flexible Tenure
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200 dark:border-gray-700 mb-4">
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Amount Range</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                ₹{loan.min_amount?.toLocaleString() || '50K'} - ₹{loan.max_amount?.toLocaleString() || '50L'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Interest Rate</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {loan.min_interest_rate || '7.5'}% - {loan.max_interest_rate || '15'}%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Building2 size={14} />
              <span>{loan.branch || 'All Branches'}</span>
            </div>
            <Link href="/apply" className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-400/30 hover:translate-x-1 transition-all">
              Apply <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}