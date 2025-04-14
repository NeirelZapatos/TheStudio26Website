import { Item } from './ItemTypes';
import { useState } from "react";
import { XCircle, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import ViewImageCarousel from "./ViewImageCarousel";
import axios from "axios";

interface ItemViewModalProps {
  item: Item | null;
  onClose: () => void;
  onDelete: (item: Item) => void;
}

const ItemViewModal: React.FC<ItemViewModalProps> = ({ 
  item, 
  onClose, 
  onDelete 
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    basic: true,
    jewelry: false,
    stone: false,
    essentials: false,
    additional: false
  });
  
  if (!item) return null;

  // Prepare images array for carousel
  const images = item.images || [];
  const allImages = [...images];
  if (item.image_url && !images.includes(item.image_url)) {
    allImages.unshift(item.image_url);
  }
  
  // Handle image index change
  const handleImageIndexChange = (index: number) => {
    setSelectedImageIndex(index);
  };

  // Handle delete item
  const handleDeleteItem = () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      onDelete(item);
    }
  };
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Handle save as template
  const handleSaveAsTemplate = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Create a template object with the exact structure expected by MongoDB
      const templateData = {
        name: item.name || '',
        price: item.price || 0,
        description: item.description || '',
        category: item.category || '',
        quantity_in_stock: item.quantity_in_stock || '0',
        
        // Include other fields that might be needed
        image_url: item.image_url || '',
        images: item.images || [],
        color: item.color || '',
        material: item.material || '',
        size: item.size || '',
        
        // Include all category-specific fields
        ...Object.keys(item).reduce((acc, key) => {
          if (item[key as keyof Item] !== undefined && 
              key !== '_id' && // Don't include MongoDB ID
              !['name', 'price', 'description', 'category', 'quantity_in_stock'].includes(key)) {
            acc[key] = item[key as keyof Item];
          }
          return acc;
        }, {} as Record<string, any>)
      };
      
      // Send the template data directly to the API endpoint
      await axios.post('/api/item-templates', templateData);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving template:', error);
      setSaveError(`Failed to save as template: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Render a property row
  const renderProperty = (label: string, value: any) => {
    if (value === undefined || value === null || value === '') return null;
    
    return (
      <div className="py-2 border-b border-gray-100 flex flex-wrap">
        <span className="w-1/3 font-medium text-gray-700">{label}:</span>
        <span className="w-2/3 text-gray-600">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
      </div>
    );
  };

  // Get all properties for a category
  const getCategoryProperties = (category: string) => {
    switch(category.toLowerCase()) {
      case 'jewelry':
        return [
          'jewelry_type', 'metal_type', 'metal_purity', 'metal_finish', 'plating',
          'ring_size', 'gauge', 'carat_weight', 'setting_type', 'stone_arrangement',
          'customization_options'
        ];
      case 'stone':
        return [
          'stone_stock_type', 'stone_thickness', 'stone_diameter', 'shape_variation',
          'geographic_origin', 'mine_type', 'ethical_sourcing', 'clarity',
          'primary_hue', 'color_saturation_and_tone', 'luster', 'transparency',
          'treatment', 'certification_available', 'grading_authority', 'origin_verification',
          'cut_category', 'precious_stone', 'semi_precious_stone', 'organic_gem',
          'synthetic_gem', 'cabachon_shape', 'faceted_cut', 'slab_cut',
          'beads_type', 'hole_type', 'semi_precious_beryl', 'semi_precious_feldspar',
          'other_semi_precious'
        ];
      case 'essentials':
        return [
          'tool_type', 'essentials_type', 'material_component', 'brand',
          'weight', 'material_composition', 'kit_type', 'kit_contents',
          'supply_type', 'supply_brand', 'supply_material', 'silver_type'
        ];
      default:
        return [];
    }
  };

  // Additional common properties
  const commonProperties = [
    'itemType', 'purchaseType', 'brand', 'weight', 'location_status',
    'stock_availability'
  ];

  // Get relevant category properties
  const categoryProps = getCategoryProperties(item.category || '');
  
  // Create labeled properties for the current item
  const basicProperties = [
    { label: 'Name', key: 'name' },
    { label: 'Price', key: 'price', formatter: (val: any) => `$${typeof val === 'number' ? val.toFixed(2) : val}` },
    { label: 'Category', key: 'category' },
    { label: 'Description', key: 'description' },
    { label: 'Quantity in Stock', key: 'quantity_in_stock' },
    { label: 'Color', key: 'color' },
    { label: 'Material', key: 'material' },
    { label: 'Size', key: 'size' }
  ];

  // Get humanized property label
  const getPropertyLabel = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Item Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Item details and image carousel */}
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
              
              {/* Action buttons - Horizontally equal */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={isSaving}
                  className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
                >
                  <Save size={18} className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save as Template'}
                </button>
                
                <button
                  onClick={handleDeleteItem}
                  className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete Item
                </button>
              </div>
            </div>
            
            {/* Item details with collapsible sections */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Basic Properties Section */}
              <div className="border rounded-lg mb-4 overflow-hidden">
                <button 
                  className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                  onClick={() => toggleSection('basic')}
                >
                  <h3 className="font-semibold text-lg">Basic Information</h3>
                  {expandedSections.basic ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedSections.basic && (
                  <div className="p-4">
                    {basicProperties.map(prop => {
                      const value = item[prop.key as keyof Item];
                      if (value === undefined || value === null || value === '') return null;
                      
                      return (
                        <div key={prop.key} className="py-2 border-b border-gray-100 flex flex-wrap">
                          <span className="w-1/3 font-medium text-gray-700">{prop.label}:</span>
                          <span className="w-2/3 text-gray-600">
                            {prop.formatter ? prop.formatter(value) : value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Category Specific Section */}
              {categoryProps.length > 0 && (
                <div className="border rounded-lg mb-4 overflow-hidden">
                  <button 
                    className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                    onClick={() => toggleSection(item.category?.toLowerCase() || '')}
                  >
                    <h3 className="font-semibold text-lg">{item.category} Specific Details</h3>
                    {expandedSections[item.category?.toLowerCase() || ''] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {expandedSections[item.category?.toLowerCase() || ''] && (
                    <div className="p-4">
                      {categoryProps.map(key => {
                        const value = item[key as keyof Item];
                        return renderProperty(getPropertyLabel(key), value);
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemViewModal;