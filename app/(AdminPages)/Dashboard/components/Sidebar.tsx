import React from "react";
import Link from "next/link";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  showGettingPaid: boolean;
  setShowGettingPaid: (show: boolean) => void;
  showProducts: boolean;
  setShowProducts: (show: boolean) => void;
  showCoursesAndItems: boolean;
  setShowCoursesAndItems: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  showGettingPaid,
  setShowGettingPaid,
  showProducts,
  setShowProducts,
  showCoursesAndItems,
  setShowCoursesAndItems,
}) => {
  return (
    <aside className="bg-lightgray fixed top-0 left-0 h-full w-86 text-white p-4 overflow-y-auto flex flex-col">
      <h2 className="text-3xl font-bold mb-8 flex justify-center pt-6">
        <Link href="/" className="flex items-center">The Studio 26</Link>
      </h2>
      <nav className="space-y-2 flex-grow">
        {/* ------------------------ Home Section ------------------------ */}
        <button
          onClick={() => setActiveSection("home")}
          className={`flex items-center w-full text-left p-3 rounded-lg ${activeSection === "home" ? "bg-gray-700" : "hover:bg-gray-600"
            }`}
        >
          <i className="fa-solid fa-home text-gray-300 w-6"></i>
          <span className="ml-2 font-semibold">Home</span>
        </button>
        {/* ------------------------ Financial Analytics Section ------------------------ */}
        <div>
          <button
            onClick={() => setShowGettingPaid(!showGettingPaid)}
            className="flex items-center w-full text-left p-3 rounded-lg hover:bg-gray-600"
          >
            <i className="fa-solid fa-dollar-sign text-gray-300 w-6"></i>
            <span className="ml-2 font-semibold">Getting Paid</span>
            <i className={`fa-solid fa-chevron-${showGettingPaid ? 'down' : 'right'} ml-auto text-gray-400`}></i>
          </button>
          {showGettingPaid && (
            <div className="pl-8 space-y-1 mt-1">
              <button
                onClick={() => setActiveSection("financialAnalytics")}
                className={`flex items-center w-full text-left p-2 rounded-lg ${activeSection === "financialAnalytics"
                  ? "bg-gray-700"
                  : "hover:bg-gray-600"
                  }`}
              >
                <i className="fa-solid fa-chart-line text-gray-300 w-5"></i>
                <span className="ml-2 font-semibold">Financial Analytics</span>
              </button>
              <button
                onClick={() => setActiveSection("finances")}
                className={`flex items-center w-full text-left p-2 rounded-lg ${activeSection === "finances"
                  ? "bg-gray-700"
                  : "hover:bg-gray-600"
                  }`}
              >
                <i className="fa-solid fa-wallet text-gray-300 w-5"></i>
                <span className="ml-2 font-semibold">Finances</span>
              </button>
            </div>
          )}
        </div>
        {/* ------------------------ Booking Calendar Section ------------------------ */}
        <button
          onClick={() => setActiveSection("calendar")}
          className={`flex items-center w-full text-left p-3 rounded-lg ${activeSection === "calendar" ? "bg-gray-700" : "hover:bg-gray-600"
            }`}
        >
          <i className="fa-solid fa-calendar-alt text-gray-300 w-6"></i>
          <span className="ml-2 font-semibold">Booking Calendar</span>
        </button>
          {/* ------------------------ Upcoming Classes Section ------------------------ */}
          <button
            onClick={() => setActiveSection("upcomingClasses")}
            className={`flex items-center w-full text-left p-3 rounded-lg ${
              activeSection === "upcomingClasses" ? "bg-gray-700" : "hover:bg-gray-600"
            }`}
          >
            <i className="fa-solid fa-book text-gray-300 w-6"></i>
            <span className="ml-2 font-semibold">Upcoming Classes</span>
          </button>
        {/* ------------------------ Product Section ------------------------ */}
        <div>
          <button
            onClick={() => setShowProducts(!showProducts)}
            className="flex flex-items w-full text-left p-3 rounded-lg hover:bg-gray-600"
          >
            <i className="fa-solid fa-box text-gray-300 w-6"></i>
            <span className="ml-2 font-semibold">Products</span>
            <i className={`fa-solid fa-chevron-${showProducts ? 'down' : 'right'} ml-auto text-gray-400`}></i>
          </button>
          {showProducts && (
            <div className="pl-8 space-y-1 mt-1">
              <button
                onClick={() => setActiveSection("item")}
                className={`flex items-center w-full text-left p-2 rounded-lg ${activeSection === "item" ? "bg-gray-700" : "hover:bg-gray-600"
                  }`}
              >
                <i className="fa-solid fa-plus text-gray-300 w-5"></i>
                <span className="ml-2 font-semibold">Create an Item</span>
              </button>
              <button
                onClick={() => setActiveSection("class")}
                className={`flex items-center w-full text-left p-2 rounded-lg ${activeSection === "class"
                  ? "bg-gray-700"
                  : "hover:bg-gray-600"
                  }`}
              >
                <i className="fa-solid fa-plus text-gray-300 w-5"></i>
                <span className="ml-2 font-semibold">Create a Class</span>
              </button>
              <button
                onClick={() => setActiveSection("openlab")}
                className={`flex items-center w-full text-left p-2 rounded-lg ${activeSection === "openlab"
                  ? "bg-gray-700"
                  : "hover:bg-gray-600"
                  }`}
              >
                <i className="fa-solid fa-plus text-gray-300 w-5"></i>
                <span className="ml-2 font-semibold">Create OpenLab</span>
              </button>

              <button
                onClick={() => setShowCoursesAndItems(!showCoursesAndItems)}
                className="flex items-center w-full text-left p-3 rounded-lg hover:bg-gray-600"
              >
                <i className="fa-solid fa-list text-gray-300 w-5"></i>
                <span className="ml-2 font-semibold">Product Lists</span>
                <i className={`fa-solid fa-chevron-${showCoursesAndItems ? 'down' : 'right'} ml-auto text-gray-400`}></i>
              </button>
              {showCoursesAndItems && (
                <div className="pl-8 space-y-1 mt-1">
                  <button
                    onClick={() => setActiveSection("coursesList")}
                    className={`flex items-center w-full text-left p-2 rounded-lg ${activeSection === "coursesList"
                      ? "bg-gray-700"
                      : "hover:bg-gray-600"
                      }`}
                  >
                    <i className="fa-solid fa-book text-gray-300 w-5"></i>
                    <span className="ml-2 font-semibold">Courses</span>
                  </button>
                  <button
                    onClick={() => setActiveSection("itemsList")}
                    className={`flex items-center w-full text-left p-2 rounded-lg ${activeSection === "itemsList"
                      ? "bg-gray-700"
                      : "hover:bg-gray-600"
                      }`}
                  >
                    <i className="fa-solid fa-tag text-gray-300 w-5"></i>
                    <span className="ml-2 font-semibold">Items</span>
                  </button>
                  <button
                    onClick={() => setActiveSection("labsList")}
                    className={`flex items-center w-full text-left p-2 rounded-lg ${activeSection === "labsList" ? "bg-gray-700" : "hover:bg-gray-600"
                      }`}
                  >
                    <i className="fa-solid fa-flask text-gray-300 w-5"></i>
                    <span className="ml-2 font-semibold">Open Lab</span>
                  </button>
                </div>
              )}
              <button
                onClick={() => setActiveSection("classCatalogManager")}
                className={`flex items-center w-full text-left p-2 rounded-lg ${activeSection === "classCatalogManager"
                  ? "bg-gray-700"
                  : "hover:bg-gray-600"
                  }`}
              >
                <i className="fa-solid fa-school text-gray-300 w-5"></i>
                <span className="ml-2 font-semibold">Course Catalog</span>
              </button>
            </div>
          )}
        </div>
        {/* ------------------------ Rental Equipment Section ------------------------ */}
        <button
          onClick={() => setActiveSection("rentalEquipment")}
          className={`flex items-center w-full text-left p-3 rounded-lg ${activeSection === "rentalEquipment"
            ? "bg-gray-700"
            : "hover:bg-gray-600"
            }`}
        >
          <i className="fa-solid fa-tools text-gray-300 w-6"></i>
          <span className="ml-2 font-semibold">Rental Equipment</span>
        </button>
        {/* ------------------------ Customer Management Section ------------------------ */}
        <button
          onClick={() => setActiveSection("customerManagement")}
          className={`flex items-center w-full text-left p-3 rounded-lg ${activeSection === "customerManagement"
            ? "bg-gray-700"
            : "hover:bg-gray-600"
            }`}
        >
          <i className="fa-solid fa-users text-gray-300 w-6"></i>
          <span className="ml-2 font-semibold">Customer Management</span>
        </button>
        {/* ------------------------ Newsletter Section ------------------------ */}
        <button
          onClick={() => setActiveSection("newsletter")}
          className={`flex items-center w-full text-left p-3 rounded-lg ${activeSection === "newsletter" ? "bg-gray-700" : "hover:bg-gray-600"
            }`}
        >
          <i className="fa-solid fa-envelope text-gray-300 w-6"></i>
          <span className="ml-2 font-semibold">Newsletter</span>

        </button>
        {/* ------------------------ Manage Orders Section ------------------------ */}
        <button
          onClick={() => setActiveSection("manageOrders")}
          className={`flex items-center w-full text-left p-3 rounded-lg ${activeSection === "manageOrders"
            ? "bg-gray-700"
            : "hover:bg-gray-600"
            }`}
        >
          <i className="fa-solid fa-shopping-cart text-gray-300 w-6"></i>
          <span className="ml-2 font-semibold">Manage Orders</span>
        </button>

        <button
          onClick={() => setActiveSection("addAdmin")}
          className={`flex items-center w-full text-left p-3 rounded-lg ${activeSection === "AddAdmin" ? "bg-gray-700" : "hover:bg-gray-600"
            }`}
        >
          <i className="fa-solid fa-user-shield text-gray-300 w-6"></i>
          <span className="ml-2 font-semibold">Admin Management</span>
        </button>
      </nav>

      {/* New button at the bottom */}
      <Link
        href="/api/auth/signout"
        className="mt-auto flex items-center w-full text-left p-3 rounded-lg bg-gray-00 hover:bg-gray-600"
      >
        <i className="fa-solid fa-sign-out-alt text-gray-300 w-6"></i>
        <span className="ml-2 font-semibold">Sign Out</span>
      </Link>
    </aside>
  );
};

export default Sidebar;