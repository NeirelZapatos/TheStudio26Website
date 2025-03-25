"use client";

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HomeSection from "./components/HomeSection";
import BookingCalendarSection from "./components/BookingCalendarSection";
import CustomerManagementSection from "./components/CustomerManagement/CustomerManagementSection";
import NewsletterSection from "./components/NewsletterSection";
import ItemSection from "./components/ItemSection";
import ClassSection from "./components/ClassSection";
import FinancialAnalytics from "./components/FinancialAnalytics/FinancialAnalytics";
import FinancesSection from "./components/FinancesSection";
import ProductList from "./components/ProductList";
import ManageOrders from "./components/ManageOrders/Components/ManageOrders";
import ClassCatalogManager from "./components/ClassCatalogManager";

function DashboardPage() {
  const [activeSection, setActiveSection] = useState("home");
  const [showGettingPaid, setShowGettingPaid] = useState(false);
  const [showProducts, setShowProducts] = useState(false);

  return (
    <div className="h-screen flex">
      <div className="fixed w-64 bg-gray-800 p-4 h-full">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          showGettingPaid={showGettingPaid}
          setShowGettingPaid={setShowGettingPaid}
          showProducts={showProducts}
          setShowProducts={setShowProducts}
        />
      </div>
      <main className="ml-64 flex-1 overflow-y-auto bg-gray-100 p-8">
        <Header />
        {activeSection === "home" && <HomeSection />}
        {activeSection === "financialAnalytics" && <FinancialAnalytics />}
        {activeSection === "finances" && <FinancesSection />}
        {activeSection === "calendar" && <BookingCalendarSection />}
        {activeSection === "item" && <ItemSection />}
        {activeSection === "class" && <ClassSection />}
        {activeSection === "customerManagement" && <CustomerManagementSection />}
        {activeSection === "newsletter" && <NewsletterSection />}
        {activeSection === "productList" && <ProductList />}
        {activeSection === "manageOrders" && <ManageOrders />}
        {activeSection === "classCatalogManager" && <ClassCatalogManager />}
      </main>
    </div>
  );
}

export default DashboardPage;
