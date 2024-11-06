// Dashboard/page.tsx

"use client";

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HomeSection from "./components/HomeSection";
import ConnectSetupSection from "./components/ConnectSetupSection";
import InvoicesSection from "./components/InvoicesSection";
import PointOfSaleSection from "./components/PointOfSaleSection";
import BookingCalendarSection from "./components/BookingCalendarSection";
import WorkScheduleSection from "./components/WorkScheduleSection";
import CustomerManagementSection from "./components/CustomerManagementSection";

const DashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [showGettingPaid, setShowGettingPaid] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div className="h-screen flex">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        showGettingPaid={showGettingPaid}
        setShowGettingPaid={setShowGettingPaid}
        showCalendar={showCalendar}
        setShowCalendar={setShowCalendar}
      />
      <main className="flex-1 bg-gray-100 p-8">
        <Header />
        {activeSection === "home" && <HomeSection />}
        {activeSection === "connect" && <ConnectSetupSection />}
        {activeSection === "invoices" && <InvoicesSection />}
        {activeSection === "pos" && <PointOfSaleSection />}
        {activeSection === "calendar" && <BookingCalendarSection />}
        {activeSection === "work" && <WorkScheduleSection />}
        {activeSection === "customerManagement" && <CustomerManagementSection />}
      </main>
    </div>
  );
};

export default DashboardPage;