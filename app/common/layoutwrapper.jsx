"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "./navbar";
import SidebarWrapper from "./sidebar-wrapper";
import { isAuthenticated, getUserRole } from "../lib/api";
import ServicesBar from "./services-bar";



export default function Provider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [showSuperAdminPopup, setShowSuperAdminPopup] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [userRole, setUserRole] = useState(null);



  const publicRoutes = [
    "/login",
    "/lignup",
    "/otp",
    "/login/forgetpassword",
    "/login",
    "/signup",
    "/otp",
    "/login/signuprequest",
    "/setpin"
  ];

  const roleBasedRoutes = {
    admin: "/admin",
    dealer: "/dealer",
    master: "/master",
    retailer: "/",
    superadmin: "https://wikin-admin.vercel.app/"
  };

  const allowedRoutePatterns = {
    admin: ['/admin', '/wallet', '/profile', '/refer', '/contact', '/services'],
    dealer: ['/dealer', '/wallet', '/profile', '/refer', '/contact', '/services'],
    master: ['/master', '/wallet', '/profile', '/refer', '/contact', '/services'],
    retailer: ['/', '/wallet', '/profile', '/refer', '/contact', '/services', '/'],
    superadmin: []
  };

  const hideLayout = publicRoutes.includes(pathname);

  const handleSuperAdminRedirect = () => {
    console.log('👑 Redirecting superadmin to admin panel');
    const adminUrl = "https://wikin-admin.vercel.app/";
    window.open(adminUrl, '_blank');
    setShowSuperAdminPopup(false);

    localStorage.clear();
    router.replace("/login");
  };

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (authChecked) return;

      setIsCheckingAuth(true);
      console.log('🛡️ Starting auth check for path:', pathname);

      await new Promise(resolve => setTimeout(resolve, 500));

      const authenticated = isAuthenticated();
      const role = getUserRole();
      setUserRole(role?.toLowerCase());


      console.log('🛡️ Auth Check Result:', {
        pathname,
        authenticated,
        userRole,
        isPublicRoute: publicRoutes.includes(pathname)
      });

      if (!authenticated && !publicRoutes.includes(pathname)) {
        console.log('🔐 Redirecting to login: Not authenticated');
        setAuthChecked(true);
        router.replace("/login");
        return;
      }

      if (authenticated && publicRoutes.includes(pathname)) {
        console.log('🏠 Redirecting to dashboard: Already authenticated');

        if (userRole?.toLowerCase() === 'superadmin') {
          console.log('👑 Superadmin detected, showing popup');
          setShowSuperAdminPopup(true);
          return;
        }

        const targetRoute = roleBasedRoutes[userRole?.toLowerCase()] || "/";
        setAuthChecked(true);
        router.replace(targetRoute);
        return;
      }

      console.log('✅ Auth check completed successfully');
      setAuthChecked(true);
      setIsCheckingAuth(false);
    };

    if (!authChecked) {
      checkAuthAndRedirect();
    }
  }, [pathname, router, authChecked]);

  useEffect(() => {
    setAuthChecked(false);
  }, [pathname]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(prev => !prev);
    } else {
      setIsSidebarExpanded(prev => !prev);
    }
  };


  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const serviceBarRoutes = [
    "/",
    "/recharge",
    "/dth-recharge",
    "/dmt",
    "/services",
  ];


  const shouldShowServiceBar =
    userRole === "retailer" &&
    serviceBarRoutes.some(route => pathname.startsWith(route));

  return (
    <div className="min-h-screen bg-white">
      {showSuperAdminPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">👑</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Super Admin Access
              </h3>

              <p className="text-gray-600 mb-6">
                Super Admin accounts should use the dedicated admin panel.
                We'll redirect you to the admin panel now.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSuperAdminPopup(false);
                    localStorage.clear();
                    router.replace("/login");
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back to Login
                </button>
                <button
                  onClick={handleSuperAdminRedirect}
                  className="flex-1 py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <span>Open Superadmin</span>
                  <span>↗️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!hideLayout ? (
        <div className="flex">
          {/* SIDEBAR */}
          <div
            className={`
    fixed inset-y-0 left-0 z-30
    transition-all duration-300
    ${isMobileSidebarOpen ? "block" : "hidden"}
    md:block
    ${isSidebarExpanded ? "md:w-64" : "md:w-16"}
  `}
          >
            <SidebarWrapper
              isMobileOpen={isMobileSidebarOpen}
              isCollapsed={!isSidebarExpanded}
              onToggle={() => setIsSidebarExpanded(prev => !prev)}
              onClose={closeMobileSidebar}
            />
          </div>

          {/* MAIN AREA */}
          <div
            className={`flex-1 transition-all duration-300
    ${isSidebarExpanded ? "md:ml-64" : "md:ml-16"}
  `}
          >
            {/* NAVBAR + SERVICE BAR */}
            <div
              className={`fixed top-0 right-0 z-40 transition-all duration-300
      ${isSidebarExpanded ? "md:left-64" : "md:left-16"}
    `}
            >
              <Navbar
                onMenuToggle={toggleSidebar}
                isSidebarOpen={isSidebarExpanded}
              />

              {userRole === "retailer" &&
                serviceBarRoutes.some(route => pathname.startsWith(route)) && (
                  <ServicesBar isSidebarExpanded={isSidebarExpanded} />
                )}


            </div>

            {/* PAGE CONTENT */}
            <main
              className={`p-2 md:p-6 transition-all duration-300 ${shouldShowServiceBar ? "mt-[120px]" : "mt-[40px]"
                }`}
            >

              {children}
            </main>
          </div>


          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-transparent z-20 md:hidden"
              onClick={closeMobileSidebar}
            />
          )}
        </div>
      ) : (
        <div>
          {children}
        </div>
      )}
    </div>
  );
}