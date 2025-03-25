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
  showCoursesAndItems: boolean;
  setShowCoursesAndItems: (show: boolean) => void;
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
  showCoursesAndItems,
  setShowCoursesAndItems,
}) => {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 overflow-y-auto flex flex-col">
      <h2 className="text-2xl font-bold mb-8"><Link href="/">Studio 26</Link></h2>
      <nav className="space-y-2 flex-grow">
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
                className={`block w-full text-left p-2 rounded-lg ${
                  activeSection === "connect" ? "bg-gray-700" : "hover:bg-gray-600"
                }`}
              >
                Connect & Setup
              </button>
              <button
                onClick={() => setActiveSection("financialAnalytics")}
                className={`block w-full text-left p-2 rounded-lg ${activeSection === "financialAnalytics"
                    ? "bg-gray-700"
                    : "hover:bg-gray-600"
                  }`}
              >
                Financial Analytics
              </button>
              <button
                onClick={() => setActiveSection("invoices")}
                className={`block w-full text-left p-2 rounded-lg ${activeSection === "invoices"
                    ? "bg-gray-700"
                    : "hover:bg-gray-600"
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
                className={`block w-full text-left p-2 rounded-lg ${
                  activeSection === "calendar" ? "bg-gray-700" : "hover:bg-gray-600"
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
                className={`block w-full text-left p-2 rounded-lg ${
                  activeSection === "class" ? "bg-gray-700" : "hover:bg-gray-600"
                }`}
              >
                Create a Class
              </button>
              {/* <button
                onClick={() => setActiveSection("productList")}
                className={`block w-full text-left p-2 rounded-lg ${activeSection === "productList"
                    ? "bg-gray-700"
                    : "hover:bg-gray-600"
                  }`}
              >
                Product List
              </button> */}
              <button
                onClick={() => setShowCoursesAndItems(!showCoursesAndItems)}
                className="block w-full text-left p-2 rounded-lg hover:bg-gray-600"
              >
                Product List
              </button>
              {showCoursesAndItems && (
                <div className="pl-4 space-y-1">
                  <button
                    onClick={() => setActiveSection("coursesList")}
                    className={`block w-full text-left p-2 rounded-lg ${
                      activeSection === "courseList"
                        ? "bg-gray-700"
                        : "hover:bg-gray-600"
                    }`}
                  >
                    Courses
                  </button>
                  <button
                    onClick={() => setActiveSection("itemsList")}
                    className={`block w-full text-left p-2 rounded-lg ${
                      activeSection === "itemList"
                        ? "bg-gray-700"
                        : "hover:bg-gray-600"
                    }`}
                  >
                    Items
                  </button>
                </div>
              )}
              <button
                onClick={() => setActiveSection("classCatalogManager")}
                className={`block w-full text-left p-2 rounded-lg ${activeSection === "classCatalogManager"
                    ? "bg-gray-700"
                    : "hover:bg-gray-600"
                  }`}
              >
                Class Catalog Manager
              </button>
            </div>
          )}
        </div>
        {/* ------------------------ Rental Equipment Section ------------------------ */}
        <button
          onClick={() => setActiveSection("rentalEquipment")}
          className={`block w-full text-left p-2 rounded-lg ${
            activeSection === "rentalEquipment" ? "bg-gray-700" : "hover:bg-gray-600"
          }`}
        >
          Rental Equipment
        </button>
        {/* ------------------------ Customer Management Section ------------------------ */}
        <button
          onClick={() => setActiveSection("customerManagement")}
          className={`block w-full text-left p-2 rounded-lg ${
            activeSection === "customerManagement" ? "bg-gray-700" : "hover:bg-gray-600"
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
        {/* ------------------------ Manage Orders Section ------------------------ */}
        <button
          onClick={() => setActiveSection("manageOrders")}
          className={`block w-full text-left p-2 rounded-lg ${
            activeSection === "ManageOrders" ? "bg-gray-700" : "hover:bg-gray-600"
          }`}
        >
          Manage Orders
        </button>

        <button
          onClick={() => setActiveSection("addAdmin")}
          className={`block w-full text-left p-2 rounded-lg ${activeSection === "AddAdmin" ? "bg-gray-700" : "hover:bg-gray-600"
            }`}
        >
          Admin Management
        </button>
      </nav>

      {/* New button at the bottom */}
      <Link href="/api/auth/signout" className="mt-auto block w-full text-left p-2 rounded-lg bg-gray-00 hover:bg-gray-600">
        Sign Out
      </Link>

    </aside>
  );
};

export default Sidebar;

// import React from "react";
// import Link from "next/link";

// interface SidebarProps {
//   activeSection: string;
//   setActiveSection: (section: string) => void;
//   showGettingPaid: boolean;
//   setShowGettingPaid: (show: boolean) => void;
//   showCalendar: boolean;
//   setShowCalendar: (show: boolean) => void;
//   showProducts: boolean;
//   setShowProducts: (show: boolean) => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({
//   activeSection,
//   setActiveSection,
//   showGettingPaid,
//   setShowGettingPaid,
//   showCalendar,
//   setShowCalendar,
//   showProducts,
//   setShowProducts,
// }) => {
//   return (
//     <aside className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 overflow-y-auto">
//       <h2 className="text-2xl font-bold mb-8">Studio 26</h2>
//       <nav className="space-y-2">
//         {/* ------------------------ Home Section ------------------------ */}
//         <button
//           onClick={() => setActiveSection("home")}
//           className={`block w-full text-left p-2 rounded-lg ${
//             activeSection === "home" ? "bg-gray-700" : "hover:bg-gray-600"
//           }`}
//         >
//           Home
//         </button>
//         {/* ------------------------ Getting Paid Section ------------------------ */}
//         <div>
//           <button
//             onClick={() => setShowGettingPaid(!showGettingPaid)}
//             className="block w-full text-left p-2 rounded-lg hover:bg-gray-600"
//           >
//             Getting Paid
//           </button>
//           {showGettingPaid && (
//             <div className="pl-4 space-y-1">
//               <button
//                 onClick={() => setActiveSection("connect")}
//                 className={`block w-full text-left p-2 rounded-lg ${
//                   activeSection === "connect"
//                     ? "bg-gray-700"
//                     : "hover:bg-gray-600"
//                 }`}
//               >
//                 Connect & Setup
//               </button>

//               <button
//                 onClick={() => setActiveSection("financialAnalytics")}
//                 className={`block w-full text-left p-2 rounded-lg ${
//                   activeSection === "financialAnalytics"
//                     ? "bg-gray-700"
//                     : "hover:bg-gray-600"
//                 }`}
//               >
//                 Financial Analytics
//               </button>

//               <button
//                 onClick={() => setActiveSection("invoices")}
//                 className={`block w-full text-left p-2 rounded-lg ${
//                   activeSection === "invoices"
//                     ? "bg-gray-700"
//                     : "hover:bg-gray-600"
//                 }`}
//               >
//                 Invoices
//               </button>
//               <button
//                 onClick={() => setActiveSection("pos")}
//                 className={`block w-full text-left p-2 rounded-lg ${
//                   activeSection === "pos" ? "bg-gray-700" : "hover:bg-gray-600"
//                 }`}
//               >
//                 Point of Sale
//               </button>
//             </div>
//           )}
//         </div>
//         {/* ------------------------ Booking Calendar Section ------------------------ */}
//         <div>
//           <button
//             onClick={() => setShowCalendar(!showCalendar)}
//             className="block w-full text-left p-2 rounded-lg hover:bg-gray-600"
//           >
//             Booking Calendar
//           </button>
//           {showCalendar && (
//             <div className="pl-4 space-y-1">
//               <button
//                 onClick={() => setActiveSection("calendar")}
//                 className={`block w-full text-left p-2 rounded-lg ${
//                   activeSection === "calendar"
//                     ? "bg-gray-700"
//                     : "hover:bg-gray-600"
//                 }`}
//               >
//                 Calendar
//               </button>
//               <button
//                 onClick={() => setActiveSection("work")}
//                 className={`block w-full text-left p-2 rounded-lg ${
//                   activeSection === "work" ? "bg-gray-700" : "hover:bg-gray-600"
//                 }`}
//               >
//                 Work Schedule
//               </button>
//             </div>
//           )}
//         </div>
//         {/* ------------------------ Product Section ------------------------ */}
//         <div>
//           <button
//             onClick={() => setShowProducts(!showProducts)}
//             className="block w-full text-left p-2 rounded-lg hover:bg-gray-600"
//           >
//             Products
//           </button>
//           {showProducts && (
//             <div className="pl-4 space-y-1">
//               <button
//                 onClick={() => setActiveSection("item")}
//                 className={`block w-full text-left p-2 rounded-lg ${
//                   activeSection === "item" ? "bg-gray-700" : "hover:bg-gray-600"
//                 }`}
//               >
//                 Create an Item
//               </button>
//               <button
//                 onClick={() => setActiveSection("class")}
//                 className={`block w-full text-left p-2 rounded-lg ${
//                   activeSection === "class"
//                     ? "bg-gray-700"
//                     : "hover:bg-gray-600"
//                 }`}
//               >
//                 Create a Class
//               </button>
//               <button
//                 onClick={() => setActiveSection("productList")}
//                 className={`block w-full text-left p-2 rounded-lg ${
//                   activeSection === "productList"
//                     ? "bg-gray-700"
//                     : "hover:bg-gray-600"
//                 }`}
//               >
//                 Product List
//               </button>
//               <button
//                 onClick={() => setActiveSection("classCatalogManager")}
//                 className={`block w-full text-left p-2 rounded-lg ${
//                   activeSection === "classCatalogManager"
//                     ? "bg-gray-700"
//                     : "hover:bg-gray-600"
//                 }`}
//               >
//                 Class Catalog Manager
//               </button>
//             </div>
//           )}
//         </div>
//         {/* ------------------------ Customer Management Section ------------------------ */}
//         <button
//           onClick={() => setActiveSection("customerManagement")}
//           className={`block w-full text-left p-2 rounded-lg ${
//             activeSection === "customerManagement"
//               ? "bg-gray-700"
//               : "hover:bg-gray-600"
//           }`}
//         >
//           Customer Management
//         </button>

//         <button
//           onClick={() => setActiveSection("newsletter")}
//           className={`block w-full text-left p-2 rounded-lg ${
//             activeSection === "newsletter" ? "bg-gray-700" : "hover:bg-gray-600"
//           }`}
//         >
//           Newsletter
//         </button>

//         {/* Added Manage Orders Button */}
//         <button
//           onClick={() => setActiveSection("manageOrders")}
//           className={`block w-full text-left p-2 rounded-lg ${activeSection === "ManageOrders" ? "bg-gray-700" : "hover:bg-gray-600"}`}
//         >
//           Manage Orders
//         </button>
//       </nav>
//     </aside>
//   );
// };

// export default Sidebar;
