"use client";

import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, parseISO, isSameDay } from "date-fns";
import axios from "axios";
import LabViewModal from "./productList/LabViewModal";
import { Lab } from "./productList/LabTypes";

const LabsListSection: React.FC = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/lab");
        setLabs(response.data);
      } catch (err) {
        setError(true);
        console.error("Error fetching labs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);

  const getLabsForSelectedDate = () => {
    const selectedDateUTC = format(selectedDate, "yyyy-MM-dd");
    return labs.filter((lab) => {
      const labDateUTC = format(parseISO(lab.date), "yyyy-MM-dd");
      return labDateUTC === selectedDateUTC;
    });
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const hasLab = labs.some((lab) => isSameDay(parseISO(lab.date), date));
      if (hasLab) {
        return <div className="bg-green-300 rounded-full w-2 h-2 mx-auto mt-1"></div>;
      }
    }
    return null;
  };

  const handleLabClick = (lab: Lab) => {
    setSelectedLab(lab);
  };

  const handleCloseModal = () => {
    setSelectedLab(null);
  };

  const handleDeleteLab = async (lab: Lab) => {
    try {
      await axios.delete(`/api/lab/${lab._id}`);
      setLabs((prev) => prev.filter((l) => l._id !== lab._id));
      setSelectedLab(null);
    } catch (err) {
      console.error("Error deleting lab:", err);
      alert("Failed to delete lab. Please try again.");
    }
  };

  const handleDateChange = (value: Date | Date[] | null | [Date | null, Date | null]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      setSelectedDate(value[0] || new Date());
    } else {
      setSelectedDate(value);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-error text-xl mb-4">Error loading labs</div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <div className="lg:col-span-1 bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Scheduled Labs</h2>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={tileContent}
          className="w-full"
        />
      </div>

      {/* Labs on Selected Date */}
      <div className="lg:col-span-2 bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Labs on {format(selectedDate, "MMMM d, yyyy")}</h2>
        <ul className="space-y-4">
          {getLabsForSelectedDate().length > 0 ? (
            getLabsForSelectedDate().map((lab) => (
              <li
                key={lab._id}
                className="p-4 border rounded-lg hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                onClick={() => handleLabClick(lab)}
              >
                <div className="flex items-center">
                  {lab.image_url && (
                    <div className="mr-4 w-16 h-16 flex-shrink-0">
                      <img
                        src={lab.image_url}
                        alt={lab.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-lab.jpg";
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-lg">{lab.name}</h3>
                    <p className="text-gray-600">{new Date(lab.date).toLocaleDateString()}</p>
                    <p className="text-gray-600">${lab.price.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the lab click
                    handleDeleteLab(lab);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No labs scheduled for this date.</p>
          )}
        </ul>
      </div>

      {/* Lab View Modal */}
      {selectedLab && (
        <LabViewModal
          lab={selectedLab}
          onClose={handleCloseModal}
          onDelete={handleDeleteLab}
        />
      )}
    </div>
  );
};

export default LabsListSection;