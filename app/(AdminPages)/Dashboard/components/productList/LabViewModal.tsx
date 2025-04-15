import React from "react";
import { Lab } from "./LabTypes";
import { XCircle, Trash2 } from "lucide-react";

interface LabViewModalProps {
  lab: Lab | null;
  onClose: () => void;
  onDelete: (lab: Lab) => void;
}

const LabViewModal: React.FC<LabViewModalProps> = ({ lab, onClose, onDelete }) => {
  if (!lab) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{lab.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">{lab.description}</p>
          <p className="text-gray-600">Date: {new Date(lab.date).toLocaleDateString()}</p>
          <p className="text-gray-600">Time: {lab.time}</p>
          <p className="text-gray-600">Duration: {lab.duration} hours</p>
          <p className="text-gray-600">Location: {lab.location}</p>
          <p className="text-gray-600">Instructor: {lab.instructor}</p>
          <p className="text-gray-600">Max Capacity: {lab.max_capacity}</p>
          <p className="text-gray-600">Price: ${lab.price.toFixed(2)}</p>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => onDelete(lab)}
              className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              <Trash2 size={18} className="mr-2" />
              Delete Lab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabViewModal;