import React from "react"; // Import React

/**
 * RevenueOptions Component:
 * Allows users to select a time frame for filtering revenue data.
 * Props:
 * - timeFrame: The currently selected time frame.
 * - setTimeFrame: Function to update the selected time frame.
 */
interface RevenueOptionsProps {
  timeFrame: string;
  setTimeFrame: (frame: string) => void;
}

const timeFrames = ["Daily", "Monthly", "Quarterly", "Yearly"];

const RevenueOptions: React.FC<RevenueOptionsProps> = ({ timeFrame, setTimeFrame }) => {
  return (
    <div className="flex gap-2">
      {timeFrames.map((frame) => (
        <button
          key={frame}
          onClick={() => setTimeFrame(frame)}
          className={`p-2 rounded-lg ${
            timeFrame === frame ? "bg-blue-400 text-white" : "bg-gray-200 text-gray-900"
          }`}
        >
          {frame}
        </button>
      ))}
    </div>
  );
};

export default RevenueOptions;