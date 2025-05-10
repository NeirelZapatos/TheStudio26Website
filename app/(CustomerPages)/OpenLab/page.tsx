"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
  const [activeTab, setActiveTab] = useState<"individual" | "monthly">(
    "individual"
  );

  return (
    <div>
      {/* Lab Sessions */}
      <div className="bg-[#f5f5f5]">
        <section className="text-center p-6 sm:p-10 bg-white-100">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1e1e1e] mb-3 sm:mb-4 mx-auto">
            Lab Sessions
          </h2>
          <p className="text-lg sm:text-xl font-bold text-[#000000] max-w-3xl mx-auto">
            Open Lab with Master Dan
          </p>
        </section>
      </div>

      {/* Tabs - make them full width on mobile */}
      <div className="flex justify-center mt-4 sm:mt-6 px-4 sm:px-0">
        <div className="w-full sm:w-auto flex">
          <button
            className={`flex-1 sm:flex-none px-4 py-3 sm:py-2 text-sm sm:text-base ${
              activeTab === "individual" ? "bg-black text-white" : "bg-gray-200"
            } rounded-l-lg`}
            onClick={() => setActiveTab("individual")}
          >
            Individual
          </button>
          <button
            className={`flex-1 sm:flex-none px-4 py-3 sm:py-2 text-sm sm:text-base ${
              activeTab === "monthly" ? "bg-black text-white" : "bg-gray-200"
            } rounded-r-lg`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Management Portal Link */}
      <div className="text-center mt-2 px-4">
        <Link href="/OpenLab/subscription/portal">
          <span className="text-blue-600 text-xs sm:text-sm hover:underline cursor-pointer">
            Already subscribed? Manage your subscription
          </span>
        </Link>
      </div>

      {/* Cards with Description */}
      <div className="max-w-6xl mx-auto px-4 mt-6 sm:mt-8 mb-8 sm:mb-12">
        {activeTab === "individual" ? (
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
            {/* Individual Card - full width on mobile */}
            <div className="w-full md:w-1/3">
              <div className="border border-gray-300 rounded-lg overflow-hidden w-full max-w-sm mx-auto p-4">
                <div className="w-full h-48 sm:h-60 bg-gray-100 flex items-center justify-center">
                  <img
                    src="https://static.wixstatic.com/media/704f16_7c79111720ea4feb8fcdc17cb2171143~mv2.png/v1/fill/w_363,h_363,fp_0.50_0.50,lg_1,q_85,enc_auto/704f16_7c79111720ea4feb8fcdc17cb2171143~mv2.png"
                    alt="Bench Time - Individual Session"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-1 text-left">
                  <h3 className="text-lg sm:text-xl text-gray-600">Bench Time - Single Session</h3>
                  <p className="text-black mt-2 font-bold text-lg sm:text-xl">$40</p>
                  <Link href="/OpenLab/Booking">
                    <button className="mt-4 w-full bg-black text-white py-3 sm:py-2 rounded hover:bg-gray-800 text-base sm:text-lg">
                      Book Now
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Description section - adjust padding and text size */}
            <div className="w-full md:w-2/3 bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h3 className="text-lg sm:text-xl font-bold mb-4">Individual Session Details</h3>

              <div className="space-y-3 sm:space-y-4">
                {/* Update checkmark items for better mobile spacing */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base">Use of open studio 26 jewelry bench, tools, and equipment</p>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base">4-hour bench time sessions</p>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base">6 available benches per session</p>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base">Work alongside Master Dan, other jewelers and students</p>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base">Assistance with learned techniques</p>
                </div>
              </div>

              <div className="mt-4 text-xs sm:text-sm text-gray-500 space-y-2">
                <p>• Available only to students who have taken classes at our school</p>
                <p>• Please bring your own materials, torch and butane</p>
                <p>• Materials like metal, stones, solder, flux and saw blades are available for additional fee</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
            {/* Monthly Subscription Card */}
            <div className="md:w-1/3">
              <div className="border border-gray-300 rounded-lg overflow-hidden w-full max-w-xs p-4 mx-auto">
                <div className="w-full h-60 bg-gray-100 flex items-center justify-center">
                  <img
                    src="https://static.wixstatic.com/media/704f16_7c79111720ea4feb8fcdc17cb2171143~mv2.png/v1/fill/w_363,h_363,fp_0.50_0.50,lg_1,q_85,enc_auto/704f16_7c79111720ea4feb8fcdc17cb2171143~mv2.png"
                    width={300}
                    height={300}
                    alt="Silver Lab Bundle"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-1 text-left">
                  <h3 className="text-lg text-gray-600">Silver Lab Bundle</h3>
                  <p className="text-black mt-2 font-bold">$100/month</p>
                  <Link href={`/OpenLab/subscription-checkout?id=67edc949208b99bf25cd4da0`}>
                    <button className="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-800">
                      Subscribe
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Monthly Description with checkmarks */}
            <div className="md:w-2/3 bg-[#faf5f2] p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">MONTHLY REOCCURING PAYMENT</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg">Membership savings: $15 for a 3-session bundle at $100</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg">Use of open studio 26 jewelry bench</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg">Optional use of provided torch and butane for a small fee</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg">Work alongside Master Dan, other jewelers and students</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg">4-hour bench time sessions</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg">6 available benches per session</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg">Assistance with learned techniques</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 mt-0.5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg">Independence in skill development</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}