import React, { useState, useEffect } from "react";
import axios from "axios";

// Types for Upcoming Classes
export interface UpcomingClass {
  _id: string;
  name: string;
  date: string;
  instructor?: string;
  location: string;
  participants?: any[];
  price?: number;
  description?: string;
  duration?: number;
  image_url?: string;
}

// Props for the UpcomingClasses component (currently empty)
interface UpcomingClassesProps {}

// Search bar component for filtering classes
const ClassSearchBar: React.FC<{ searchQuery: string; setSearchQuery: (query: string) => void }> = ({ searchQuery, setSearchQuery }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedQuery = e.target.value.replace(/\s+/g, " ");
    setSearchQuery(sanitizedQuery);
  };

  return (
    <div className="relative mb-4">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
      <input
        type="text"
        placeholder="Search classes by name, time, instructor, or location..."
        value={searchQuery}
        onChange={handleInputChange}
        className="w-full pl-10 pr-4 py-2 border rounded-lg"
        autoComplete="off"
      />
    </div>
  );
};

const UpcomingClasses: React.FC<UpcomingClassesProps> = () => {
  // State declarations
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedClass, setSelectedClass] = useState<UpcomingClass | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  // Default start date is today (YYYY-MM-DD)
  const [filterStartDate, setFilterStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterEndDate, setFilterEndDate] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 20;
  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const displayedClasses = filteredClasses.slice(indexOfFirstClass, indexOfLastClass);

  // Helper function to format duration (in minutes) to "X hour(s) Y min(s)"
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let result = "";
    if (hours > 0) {
      result += `${hours} hour${hours > 1 ? "s" : ""}`;
      if (mins > 0) {
        result += ` ${mins} min${mins > 1 ? "s" : ""}`;
      }
    } else {
      result = `${mins} min${mins !== 1 ? "s" : ""}`;
    }
    return result;
  };

  // Helper function to format phone numbers
  const formatPhone = (phone: string | number): string => {
    const phoneStr = String(phone);
    const digits = phoneStr.replace(/\D/g, "");
    if (digits.length === 10) {
      return `(${digits.substr(0, 3)}) ${digits.substr(3, 3)}-${digits.substr(6, 4)}`;
    } else if (digits.length === 11) {
      return `+${digits[0]} (${digits.substr(1, 3)}) ${digits.substr(4, 3)}-${digits.substr(7, 4)}`;
    } else {
      return phoneStr;
    }
  };

  // Fetch courses and customer data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesRes, customersRes] = await Promise.all([
          axios.get("/api/courses"),
          axios.get("/api/customers")
        ]);
        const allClasses = coursesRes.data;
        const allCustomers = customersRes.data;

        // Sort classes by date (ascending)
        allClasses.sort(
          (a: UpcomingClass, b: UpcomingClass) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Enrich each class with its participants
        const enrichedClasses = allClasses.map((cls: UpcomingClass) => {
          const participants = allCustomers.filter((customer: any) =>
            customer.courses?.includes(cls._id)
          );
          return { ...cls, participants };
        });

        setClasses(enrichedClasses);
        setFilteredClasses(enrichedClasses);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter classes based on search query and date range
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = classes.filter((cls) => {
      const textMatch =
        lowerQuery === "" ||
        cls.name.toLowerCase().includes(lowerQuery) ||
        cls.instructor?.toLowerCase().includes(lowerQuery) ||
        cls.location.toLowerCase().includes(lowerQuery) ||
        new Date(cls.date).toLocaleString().toLowerCase().includes(lowerQuery);

      let dateMatch = true;
      const classDate = new Date(cls.date);
      if (filterStartDate) {
        const start = new Date(filterStartDate);
        if (classDate < start) dateMatch = false;
      }
      if (filterEndDate) {
        const end = new Date(filterEndDate);
        if (classDate > end) dateMatch = false;
      }
      return textMatch && dateMatch;
    });
    setFilteredClasses(filtered);
  }, [searchQuery, classes, filterStartDate, filterEndDate]);

  return (
    <div className="container mx-auto py-8">
      <section className="mb-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Upcoming Classes</h2>
        </div>
        {/* Date Range Filter */}
        <div className="flex items-end space-x-4 mb-4">
          <div>
            <label className="block text-gray-700 font-bold mb-1">Start Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">End Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="border rounded p-2"
            />
          </div>
          <div className="mb-1">
            <button
              onClick={() => {
                setFilterStartDate("");
                setFilterEndDate("");
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Clear Dates
            </button>
          </div>
        </div>
        {/* Search Bar */}
        <ClassSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {/* Class List */}
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">
            Failed to load upcoming classes. Please try again later.
          </div>
        ) : displayedClasses.length === 0 ? (
          <div>No upcoming classes scheduled.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {displayedClasses.map((cls) => (
              <div
                key={cls._id}
                className="bg-white shadow-md rounded-md p-4 hover:shadow-lg transition-shadow cursor-pointer mb-6"
                onClick={() => setSelectedClass(selectedClass?._id === cls._id ? null : cls)}
              >
                <div className="flex">
                  {cls.image_url && (
                    <div className="w-48 h-48 flex-shrink-0 rounded overflow-hidden shadow-sm">
                      <img
                        src={cls.image_url}
                        alt={cls.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 ml-6">
                    <h3 className="text-2xl font-semibold mb-2">{cls.name}</h3>
                    <p className="text-gray-600">
                      <span className="font-bold">Date:</span>{" "}
                      {new Date(cls.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-bold">Time:</span>{" "}
                      {new Date(cls.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {cls.instructor && (
                      <p className="text-gray-600">
                        <span className="font-bold">Instructor:</span> {cls.instructor}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <span className="font-bold">Location:</span> {cls.location}
                    </p>
                    {cls.price && (
                      <p className="text-gray-600">
                        <span className="font-bold">Price:</span> ${cls.price}
                      </p>
                    )}
                    {cls.duration && (
                      <p className="text-gray-600">
                        <span className="font-bold">Duration:</span> {formatDuration(cls.duration)}
                      </p>
                    )}
                    {cls.description && (
                      <p className="mt-2 text-gray-700 leading-relaxed">{cls.description}</p>
                    )}
                  </div>
                </div>
                {/* Participants Section */}
                {selectedClass?._id === cls._id && (
                  <div className="mt-6 pt-4 border-t border-gray-300">
                    <h4 className="text-lg font-semibold mb-2">Participants</h4>
                    {Array.isArray(cls.participants) && cls.participants.length === 0 ? (
                      <p className="text-gray-600">No participants registered.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {(cls.participants ?? []).map((participant: any) => (
                          <div key={participant._id} className="max-w-sm bg-white rounded-md p-4">
                            <h2 className="text-lg font-semibold mb-2">
                              {participant.first_name} {participant.last_name}
                            </h2>
                            <div className="flex items-center text-gray-600 mb-1">
                              <span className="material-icons mr-2">email</span>
                              <span>{participant.email}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="material-icons mr-2">phone</span>
                              <span>
                                {participant.phone_number
                                  ? formatPhone(participant.phone_number)
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {Math.ceil(filteredClasses.length / classesPerPage)}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => {
                const totalPages = Math.ceil(filteredClasses.length / classesPerPage);
                return Math.min(prev + 1, totalPages);
              })
            }
            disabled={currentPage === Math.ceil(filteredClasses.length / classesPerPage)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
};

export default UpcomingClasses;