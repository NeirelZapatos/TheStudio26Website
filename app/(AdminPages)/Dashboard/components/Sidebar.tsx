import React from "react";
import Link from "next/link";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  showGettingPaid: boolean;
  setShowGettingPaid: (show: boolean) => void;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  showProducts: boolean;
  setShowProducts: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  showGettingPaid,
  setShowGettingPaid,
  showCalendar,
  setShowCalendar,
  showProducts,
  setShowProducts,
}) => {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-8">Studio 26</h2>
      <nav className="space-y-2">
        {/* ------------------------ Home Section ------------------------ */}
        <button
          onClick={() => setActiveSection("home")}
          className={`block w-full text-left p-2 rounded-lg ${activeSection === "home" ? "bg-gray-700" : "hover:bg-gray-600"
            }`}
        >
          Home
        </button>
        {/* ------------------------ Getting Paid Section ------------------------ */}
        <div>
          <button
            onClick={() => setShowGettingPaid(!showGettingPaid)}
            className="block w-full text-left p-2 rounded-lg hover:bg-gray-600"
          >
            Getting Paid
          </button>
          {showGettingPaid && (
            <div className="pl-4 space-y-1">
              <button
                onClick={() => setActiveSection("connect")}
                className={`block w-full text-left p-2 rounded-lg ${activeSection === "connect" ? "bg-gray-700" : "hover:bg-gray-600"
                  }`}
              >
                Connect & Setup
              </button>
              
              <button
                onClick={() => setActiveSection("financialAnalytics")}
                className={`block w-full text-left p-2 rounded-lg ${
                  activeSection === "financialAnalytics" ? "bg-gray-700" : "hover:bg-gray-600"
                }`}
              >
                Financial Analytics
              </button>

              <button
                onClick={() => setActiveSection("invoices")}
                className={`block w-full text-left p-2 rounded-lg ${activeSection === "invoices" ? "bg-gray-700" : "hover:bg-gray-600"
                  }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setActiveSection("pos")}
                className={`block w-full text-left p-2 rounded-lg ${activeSection === "pos" ? "bg-gray-700" : "hover:bg-gray-600"
                  }`}
              >
                Point of Sale
              </button>
            </div>
          )}
        </div>
        {/* ------------------------ Booking Calendar Section ------------------------ */}
        <div>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="block w-full text-left p-2 rounded-lg hover:bg-gray-600"
          >
            Booking Calendar
          </button>
          {showCalendar && (
            <div className="pl-4 space-y-1">
              <button
                onClick={() => setActiveSection("calendar")}
                className={`block w-full text-left p-2 rounded-lg ${activeSection === "calendar" ? "bg-gray-700" : "hover:bg-gray-600"
                  }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setActiveSection("work")}
                className={`block w-full text-left p-2 rounded-lg ${activeSection === "work" ? "bg-gray-700" : "hover:bg-gray-600"
                  }`}
              >
                Work Schedule
              </button>
            </div>
          )}
        </div>
        {/* ------------------------ Product Section ------------------------ */}
        <div>
          <button
            onClick={() => setShowProducts(!showProducts)}
            className="block w-full text-left p-2 rounded-lg hover:bg-gray-600"
          >
            Products
          </button>
          {showProducts && (
            <div className="pl-4 space-y-1">
              <button
                onClick={() => setActiveSection("item")}
                className={`block w-full text-left p-2 rounded-lg ${activeSection === "item" ? "bg-gray-700" : "hover:bg-gray-600"
                  }`}
              >
                Create an Item
              </button>
              <button
                onClick={() => setActiveSection("class")}
                className={`block w-full text-left p-2 rounded-lg ${activeSection === "class" ? "bg-gray-700" : "hover:bg-gray-600"
                  }`}
              >
                Create a Class
              </button>
              <button
                onClick={() => setActiveSection("productList")}
                className={`block w-full text-left p-2 rounded-lg ${activeSection === "productList" ? "bg-gray-700" : "hover:bg-gray-600"
                  }`}
              >
                Product List
              </button>
            </div>
          )}
        </div>
        {/* ------------------------ Customer Management Section ------------------------ */}
        <button
          onClick={() => setActiveSection("customerManagement")}
          className={`block w-full text-left p-2 rounded-lg ${activeSection === "customerManagement" ? "bg-gray-700" : "hover:bg-gray-600"
            }`}
        >
          Customer Management
        </button>
        
        <button
          onClick={() => setActiveSection("newsletter")}
          className={`block w-full text-left p-2 rounded-lg ${activeSection === "newsletter" ? "bg-gray-700" : "hover:bg-gray-600"
            }`}
        >
          Newsletter
        </button>

                {/* Added Manage Orders Button */}
                <button
          onClick={() => setActiveSection("manageOrders")}
          className={`block w-full text-left p-2 rounded-lg ${activeSection === "ManageOrders" ? "bg-gray-700" : "hover:bg-gray-600"}`}
        >
          Manage Orders
        </button>

      </nav>
    </aside>
  );
};

export default Sidebar;