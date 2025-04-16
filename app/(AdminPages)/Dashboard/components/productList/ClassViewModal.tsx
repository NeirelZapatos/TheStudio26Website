import { Class } from "./ClassTypes";
import { useState } from "react";
import { XCircle, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import ViewImageCarousel from "./ViewImageCarousel";
import axios from "axios";

interface ClassViewModalProps {
  classItem: Class | null;
  onClose: () => void;
  onDelete: (classItem: Class) => void;
}

const ClassViewModal: React.FC<ClassViewModalProps> = ({
  classItem,
  onClose,
  onDelete,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    basic: true,
    additional: false,
  });

  if (!classItem) return null;

  // Prepare images array for carousel
  const images = classItem.images || [];
  const allImages = [...images];
  if (classItem.image_url && !images.includes(classItem.image_url)) {
    allImages.unshift(classItem.image_url);
  }

  // Handle image index change
  const handleImageIndexChange = (index: number) => {
    setSelectedImageIndex(index);
  };

  // Handle delete class
  const handleDeleteClass = () => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      onDelete(classItem);
    }
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle save as template
  const handleSaveAsTemplate = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const templateData = {
        name: classItem.name,
        description: classItem.description,
        class_category: classItem.class_category,
        price: classItem.price,
        date: classItem.date,
        time: classItem.time,
        instructor: classItem.instructor,
        duration: classItem.duration,
        location: classItem.location,
        images: classItem.images || [],
        image_url: classItem.image_url,
        prerequisite: classItem.prerequisite,
        prerequisiteClass: classItem.prerequisiteClass,
        max_capacity: classItem.max_capacity,
      };

      await axios.post("/api/course-templates", templateData);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error saving template:", error);
      setSaveError(
        `Failed to save as template: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Render a property row
  const renderProperty = (label: string, value: any) => {
    if (value === undefined || value === null || value === "") return null;

    return (
      <div className="py-2 border-b border-gray-100 flex flex-wrap">
        <span className="w-1/3 font-medium text-gray-700">{label}:</span>
        <span className="w-2/3 text-gray-600">
          {typeof value === "object" ? JSON.stringify(value) : value}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Class Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Class details and image carousel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image carousel */}
            <div>
              {allImages.length > 0 ? (
                <ViewImageCarousel
                  images={allImages}
                  currentIndex={selectedImageIndex}
                  onIndexChange={handleImageIndexChange}
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">No images available</p>
                </div>
              )}

              {/* Success/Error messages */}
              {saveSuccess && (
                <div className="mt-4 bg-green-100 text-green-700 p-3 rounded">
                  Successfully saved as template
                </div>
              )}

              {saveError && (
                <div className="mt-4 bg-red-100 text-red-700 p-3 rounded">
                  {saveError}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={isSaving}
                  className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
                >
                  <Save size={18} className="mr-2" />
                  {isSaving ? "Saving..." : "Save as Template"}
                </button>

                <button
                  onClick={handleDeleteClass}
                  className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete Class
                </button>
              </div>
            </div>

            {/* Class details with collapsible sections */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Basic Information Section */}
              <div className="border rounded-lg mb-4 overflow-hidden">
                <button
                  className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                  onClick={() => toggleSection("basic")}
                >
                  <h3 className="font-semibold text-lg">Basic Information</h3>
                  {expandedSections.basic ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>

                {expandedSections.basic && (
                  <div className="p-4">
                    {renderProperty("Name", classItem.name)}
                    {renderProperty("Description", classItem.description)}
                    {renderProperty("Category", classItem.class_category)}
                    {renderProperty("Price", `$${classItem.price.toFixed(2)}`)}
                    {renderProperty("Date", classItem.date)}
                    {renderProperty("Time", classItem.time)}
                    {renderProperty("Instructor", classItem.instructor)}
                    {renderProperty("Duration (minutes)", classItem.duration)}
                    {renderProperty("Location", classItem.location)}
                  </div>
                )}
              </div>

              {/* Additional Information Section */}
              <div className="border rounded-lg mb-4 overflow-hidden">
                <button
                  className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                  onClick={() => toggleSection("additional")}
                >
                  <h3 className="font-semibold text-lg">Additional Information</h3>
                  {expandedSections.additional ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>

                {expandedSections.additional && (
                  <div className="p-4">
                    {renderProperty("Prerequisite", classItem.prerequisite ? "Yes" : "No")}
                    {classItem.prerequisite &&
                      renderProperty("Prerequisite Class", classItem.prerequisiteClass)}
                    {renderProperty("Max Capacity", classItem.max_capacity)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassViewModal;