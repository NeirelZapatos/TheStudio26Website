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
import CoursesListSection from "./components/CoursesListSection";
import ItemsListSection from "./components/ItemsListSection";
import ManageOrders from "./components/ManageOrders/Components/ManageOrders";
import ClassCatalogManager from "./components/ClassCatalogManager";
import AddAdmin from "./components/AddAdmin";
import RentalEquipmentSection from "./components/RentalEquipmentSection";

function DashboardPage() {
  const [activeSection, setActiveSection] = useState("home");
  const [showGettingPaid, setShowGettingPaid] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showCoursesAndItems, setShowCoursesAndItems] = useState(false);

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
          showCoursesAndItems={showCoursesAndItems}
          setShowCoursesAndItems={setShowCoursesAndItems}
        />
      </div>
      <main className="ml-64 flex-1 overflow-y-auto bg-gray-100 p-8">
        <Header />
        {activeSection === "home" && <HomeSection />}
        {activeSection === "financialAnalytics" && <FinancialAnalytics />}
        {activeSection === "calendar" && <BookingCalendarSection />}
        {activeSection === "item" && <ItemSection />}
        {activeSection === "class" && <ClassSection />}
        {activeSection === "customerManagement" && (
          <CustomerManagementSection />
        )}
        {activeSection === "newsletter" && <NewsletterSection />}
        {activeSection === "financialAnalytics" && <FinancialAnalytics />}
        {activeSection === "coursesList" && <CoursesListSection />}
        {activeSection === "itemsList" && <ItemsListSection />}
        {activeSection === "manageOrders" && <ManageOrders />}
        {activeSection === "classCatalogManager" && <ClassCatalogManager />}
        {activeSection === "rentalEquipment" && <RentalEquipmentSection />}{" "}
        {/* New tab */}
        {activeSection === "addAdmin" && <AddAdmin />}
      </main>
    </div>
  );
}

export default DashboardPage;
