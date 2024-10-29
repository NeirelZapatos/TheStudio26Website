"use client";

import React, { useState } from "react";

const DashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [showGettingPaid, setShowGettingPaid] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div className="h-screen flex">
      {/* Sidebar Menu*/}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-8">Studio 26</h2>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveSection("home")}
            className={`block w-full text-left p-2 rounded-lg ${
              activeSection === "home" ? "bg-gray-700" : "hover:bg-gray-600"
            }`}
          >
            Home
          </button>
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
                    activeSection === "connect"
                      ? "bg-gray-700"
                      : "hover:bg-gray-600"
                  }`}
                >
                  Connect & Setup
                </button>
                <button
                  onClick={() => setActiveSection("invoices")}
                  className={`block w-full text-left p-2 rounded-lg ${
                    activeSection === "invoices"
                      ? "bg-gray-700"
                      : "hover:bg-gray-600"
                  }`}
                >
                  Invoices
                </button>
                <button
                  onClick={() => setActiveSection("pos")}
                  className={`block w-full text-left p-2 rounded-lg ${
                    activeSection === "pos"
                      ? "bg-gray-700"
                      : "hover:bg-gray-600"
                  }`}
                >
                  Point of Sale
                </button>
              </div>
            )}
          </div>

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
                    activeSection === "calendar"
                      ? "bg-gray-700"
                      : "hover:bg-gray-600"
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setActiveSection("work")}
                  className={`block w-full text-left p-2 rounded-lg ${
                    activeSection === "work"
                      ? "bg-gray-700"
                      : "hover:bg-gray-600"
                  }`}
                >
                  Work Schedule
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      <main className="flex-1 bg-gray-100 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Welcome back, Ruben</h1>
        </header>

        {activeSection === "home" && (
          <div>
            <section className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Analytics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="font-medium">Site Sessions</p>
                  <p className="text-3xl">-</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="font-medium">Total Sales</p>
                  <p className="text-3xl">-</p>
                </div>
              </div>
            </section>

            <section className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>
              <p>No recent activity to show</p>
              <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg">
                Continue Setup
              </button>
            </section>
          </div>
        )}

        {activeSection === "connect" && (
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Connect & Setup</h2>
            <p>Connect & Setup content goes here...</p>
          </section>
        )}

        {activeSection === "invoices" && (
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Invoices</h2>
            <p>Invoices content goes here...</p>
          </section>
        )}

        {activeSection === "pos" && (
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Point of Sale</h2>
            <p>Point of Sale content goes here...</p>
          </section>
        )}

        {activeSection === "calendar" && (
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Booking Calendar</h2>
            <p>Calendar content goes here...</p>
          </section>
        )}

        {activeSection === "work" && (
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Work Schedule</h2>
            <p>Work Schedule content goes here...</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;