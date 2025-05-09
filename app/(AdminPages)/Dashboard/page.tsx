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
import OpenLabSection from "./components/OpenLabSection";
import FinancialAnalytics from "./components/FinancialAnalytics/FinancialAnalytics";
import CoursesListSection from "./components/CoursesListSection";
import ItemsListSection from "./components/ItemsListSection";
import LabsListSection from "./components/LabsListSection";
import ManageOrders from "./components/ManageOrders/Components/ManageOrders";
import ClassCatalogManager from "./components/ClassCatalogManager";
import AddAdmin from "./components/AddAdmin";
import RentalEquipmentSection from "./components/RentalEquipmentSection";
import UpComingClasses from "./components/UpComingClasses"; // Added Upcoming Classes import
import ReturnsAndTax from "./components/ReturnsAndTax";

function DashboardPage() {
  const [activeSection, setActiveSection] = useState("home");
  const [showGettingPaid, setShowGettingPaid] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showCoursesAndItems, setShowCoursesAndItems] = useState(false);

  return (
    <div className="h-screen flex">
      {/* // * FIXED SIDEBAR * // */}
      <div className="fixed w-64 p-4 h-full">
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

      {/* MAIN CONTENT */}
      <main 
        className="bg-darkgray 
          ml-64 flex-1 overflow-y-auto flex flex-col p-8"
      >

        {/* CONTENT CONTAINER */}
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full mx-auto px-4 py-6">
            {activeSection === "home" && <HomeSection />}
            {activeSection === "financialAnalytics" && <FinancialAnalytics />}
            {activeSection === "calendar" && <BookingCalendarSection />}
            {activeSection === "item" && <ItemSection />}
            {activeSection === "class" && <ClassSection />}
            {activeSection === "openlab" && <OpenLabSection />}
            {activeSection === "customerManagement" && <CustomerManagementSection />}
            {activeSection === "newsletter" && <NewsletterSection />}
            {/* {activeSection === "financialAnalytics" && <FinancialAnalytics />} */}
            {/* {activeSection === "productList" && <ProductList />} */}
            {activeSection === "returnsAndTax" && <ReturnsAndTax />}
            {activeSection === "coursesList" && <CoursesListSection />}
            {activeSection === "itemsList" && <ItemsListSection />}
            {activeSection === "labsList" && <LabsListSection />}
            {activeSection === "manageOrders" && <ManageOrders />}
            {activeSection === "classCatalogManager" && <ClassCatalogManager />}
            {activeSection === "rentalEquipment" && <RentalEquipmentSection />}
        {activeSection === "upcomingClasses" && <UpComingClasses />}
            {/* New tab */}
            {activeSection === "addAdmin" && <AddAdmin />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;