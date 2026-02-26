"use client";
import { Suspense } from "react";
import Sidebar from "./sidebar";

export default function SidebarWrapper({ isMobileOpen,   isCollapsed, onToggle, onClose }) {
  return (
    <Suspense fallback={
      <div className="w-64 h-screen bg-white dark:bg-gray-900 animate-pulse">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    }>
      <Sidebar isMobileOpen={isMobileOpen} onClose={onClose}   isCollapsed={isCollapsed}
  onToggle={onToggle} />
    </Suspense>
  );
}