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

import ItemSection from "./components/ItemSection";
import ClassSection from "./components/ClassSection";
import ProductAndClassSection from "./components/ItemSection";


import FinancialAnalytics from "./components/FinancialAnalytics"; // Import the financial analytics section

const DashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [showGettingPaid, setShowGettingPaid] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProductCreator, setShowProductCreator] = useState(false);

  return (
    <div className="h-screen flex">
      <div className="fixed w-64 bg-gray-800 p-4 h-full">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          showGettingPaid={showGettingPaid}
          setShowGettingPaid={setShowGettingPaid}
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          showProductCreator={showProductCreator}
          setShowProductCreator={setShowProductCreator}
        />
      </div>
      <main className="ml-64 flex-1 overflow-y-auto bg-gray-100 p-8">
        <Header />
        {activeSection === "home" && <HomeSection />}
        {activeSection === "connect" && <ConnectSetupSection />}
        {activeSection === "invoices" && <InvoicesSection />}
        {activeSection === "pos" && <PointOfSaleSection />}
        {activeSection === "calendar" && <BookingCalendarSection />}
        {activeSection === "work" && <WorkScheduleSection />}
        {activeSection == "item" && <ItemSection /> }
        {activeSection == "class" && <ClassSection /> }
        {activeSection === "customerManagement" && <CustomerManagementSection />}
        {activeSection == "productAndClass" && <ProductAndClassSection />}
        {activeSection === "financialAnalytics" && <FinancialAnalytics />} {/* Display Financial Analytics */}
    
      </main>
    </div>
  );
};

export default DashboardPage;