import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
