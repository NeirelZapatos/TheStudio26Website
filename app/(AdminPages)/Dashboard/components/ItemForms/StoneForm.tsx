"use client";

import { useState, useEffect } from "react";
import ImageCarousel from "@/app/Components/ImageCarousel";
import useImageUpload from "@/app/hooks/useImageUpload";

interface StoneFormProps {
  onClose: () => void;
}

export default function StoneForm({ onClose }: StoneFormProps) {
  const [message, setMessage] = useState<string>("");

  // --------------- Image Carousel and Uploading--------------- //
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const {
    files,
    setFiles,
    previewUrls,
    setPreviewUrls,
    handleFileChange,
    uploadImages,
    cleanupPreviewUrls,
  } = useImageUpload();

  // --------------- Required Fields --------------- //
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [quantityInStock, setQuantityInStock] = useState<string>("");

  // --------------- Basic Product Fields --------------- //
  const [stoneStockType, setStoneStockType] = useState(""); // e.g., Old stock, new stock, etc.
  const [stoneWeight, setStoneWeight] = useState(""); // Weight value
  const [stoneSize, setStoneSize] = useState(""); // e.g., "Height x Width x Length"
  const [stoneThickness, setStoneThickness] = useState("");
  const [stoneDiameter, setStoneDiameter] = useState("");
  const [shapeVariation, setShapeVariation] = useState("");

  // --------------- Location (Origin & Mining Details) --------------- //
  const [geographicalOrigin, setGeographicalOrigin] = useState("");
  const [mineType, setMineType] = useState("");
  const [ethicalSourcing, setEthicalSourcing] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [stockAvailability, setStockAvailability] = useState("");

  // --------------- Quality Attributes  ---------------  //
  const [clarity, setClarity] = useState("");
  const [primaryHue, setPrimaryHue] = useState("");
  const [colorSaturation, setColorSaturation] = useState("");
  const [luster, setLuster] = useState("");
  const [transparency, setTransparency] = useState("");

  //  --------------- Stone Treatments & Enhancements  --------------- //
  const [treatment, setTreatment] = useState("");

  // --------------- Stone Certification & Grading  --------------- //
  const [certificationAvailable, setCertificationAvailable] = useState("");
  const [gradingAuthority, setGradingAuthority] = useState("");
  const [originVerification, setOriginVerification] = useState("");

  // --------------- Shape & Cut  --------------- //
  const [cutCategory, setCutCategory] = useState("");
  const [cabochonShape, setCabochonShape] = useState("");
  const [facetedCut, setFacetedCut] = useState("");
  const [slabCut, setSlabCut] = useState("");
  const [beadsType, setBeadsType] = useState("");
  const [holeType, setHoleType] = useState("");

  // --------------- Gemstone Type & Variations --------------- //
  const [preciousStone, setPreciousStone] = useState("");
  const [semiPreciousQuartz, setSemiPreciousQuartz] = useState("");
  const [semiPreciousBeryl, setSemiPreciousBeryl] = useState("");
  const [semiPreciousFeldspar, setSemiPreciousFeldspar] = useState("");
  const [otherSemiPrecious, setOtherSemiPrecious] = useState("");
  const [organicGem, setOrganicGem] = useState("");
  const [syntheticGem, setSyntheticGem] = useState("");

  // --------------- Options for selects --------------- //
  const stoneStockTypes = ["Old stock", "New stock", "Vintage", "Antique", "Estate", "Limited edition", "Rare find", "Collector's item", "Discontinued"];
  const shapeVariationsOptions = ["Asymmetrical", "Calibrated sizes", "Freeform", "Irregular"];
  const mineTypesOptions = ["Open-pit", "Underground", "Artisanal", "River/mined", "Marine extraction"];
  const ethicalSourcingOptions = ["Conflict-free", "Fair trade", "Ethically sourced", "Recycled"];
  const locationStatusOptions = ["Domestic", "Imported", "Out-of-state", "Region-specific"];
  const stockAvailabilityOptions = ["In stock", "Out of stock", "Pre-order", "Limited stock", "Made-to-order", "One-of-a-kind"];

  const clarityOptions = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3", "Cloudy", "Heavily Included", "Near-Opaque"];
  const primaryHueOptions = ["White", "Blue", "Green", "Red", "Yellow", "Pink", "Brown", "Black", "Gray", "Colorless"];
  const colorSaturationOptions = ["Vivid", "Intense", "Deep", "Medium", "Pastel", "Pale"];
  const lusterOptions = ["High Shine", "Vitreous (Glassy)", "Dull", "Satin", "Pearly", "Silky", "Waxy", "Resinous", "Metallic", "Adamantine"];
  const transparencyOptions = ["Transparent", "Semi-Transparent", "Translucent", "Semi-Opaque", "Opaque"];
  const treatmentOptions = ["Natural/Untreated", "Heat-Treated", "Dye-Enhanced", "Resin-Filled", "Irradiated", "Oiled/Wax Treated", "Coated", "Fracture-Filled"];

  const certificationAvailableOptions = ["Yes", "No"];
  const gradingAuthorityOptions = ["GIA", "IGI", "AGS", "EGL"];
  const originVerificationOptions = ["Mine of Origin Report", "Ethical Sourcing Certificate"];

  const cutCategories = ["Cabochons", "Faceted Stones", "Slabs & Rough Cuts", "Beads & Drilled Stones"];
  const cabochonShapes = ["Round", "Oval", "Square", "Pear", "Teardrop", "Freeform", "Marquise", "Rectangle", "Heart", "Trillion", "Hexagon"];
  const facetedCuts = ["Round Brilliant", "Oval", "Step Cut", "Princess Cut", "Cushion Cut", "Radiant Cut", "Baguette", "Rose Cut", "Asscher Cut", "Old Mine Cut", "Unique Fancy Cuts"];
  const slabCuts = ["Uncut", "Sliced", "Polished", "Raw", "Geode Slabs", "Drusy", "Layered Slabs"];
  const beadsTypesOptions = ["Round beads", "Faceted beads", "Teardrop beads", "Tumbled beads", "Nugget beads"];
  const holeTypesOptions = ["Center-drilled", "Side-drilled", "Top-drilled", "Undrilled"];

  const preciousStoneOptions = ["Diamond", "Sapphire", "Ruby", "Emerald"];
  const semiPreciousQuartzOptions = ["Amethyst", "Citrine", "Rose Quartz", "Smoky Quartz", "Rutilated Quartz"];
  const semiPreciousBerylOptions = ["Aquamarine", "Morganite", "Heliodor"];
  const semiPreciousFeldsparOptions = ["Labradorite", "Moonstone", "Sunstone"];
  const otherSemiPreciousOptions = ["Peridot", "Garnet", "Tourmaline", "Topaz", "Spinel", "Zircon", "Tanzanite"];
  const organicGemOptions = ["Amber", "Coral", "Jet", "Pearl"];
  const syntheticGemOptions = ["Lab-Grown Diamonds", "Moissanite", "Cubic Zirconia", "Synthetic Sapphire", "Synthetic Ruby", "Synthetic Emerald", "Opalite"];

  // --------------- Template Search State --------------- //
  const [showTemplateSearch, setShowTemplateSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplateList, setFilteredTemplateList] = useState<any[]>([]);

  const requiredFields = [
    name,
    description,
    price,
    quantityInStock,
  ];

  const areRequiredFieldsFilled = () => {
    return requiredFields.every((field) => field && field.trim() !== "");
  };

  // --------------- Template Logic --------------- //
  // Fetch templates on component mount
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/item-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      const stonesTemplates = data.data.filter((template: any) => template.category === "Stones");

      setTemplates(stonesTemplates);
      setFilteredTemplateList(stonesTemplates); // Initialize filtered list with all templates
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter templates based on search text
  useEffect(() => {
    const filtered = templates.filter((template) =>
      template.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredTemplateList(filtered);
  }, [searchText, templates]);

  // Load template into form fields
  const loadTemplate = async (index: string) => {
    if (index !== "") {
      const template = filteredTemplateList[parseInt(index)];

      // !  DEBUG template and previewUrls
      console.log("Template:", template);
      console.log("Preview URLs before update:", previewUrls);

      setName(template.name);
      setDescription(template.description);
      setPrice(template.price);
      setQuantityInStock(template.quantity_in_stock);
      setStoneStockType(template.stone_stock_type || "");
      setStoneWeight(template.weight || "");
      setStoneSize(template.stone_size || "");
      setStoneDiameter(template.stone_diameter || "");
      setStoneThickness(template.stone_thickness || "");
      setShapeVariation(template.shape_variation || "");
      setGeographicalOrigin(template.geographic_origin || "");
      setMineType(template.mine_type || "");
      setEthicalSourcing(template.ethical_sourcing || "");
      setLocationStatus(template.location_status || "");
      setStockAvailability(template.stock_availability || "");
      setClarity(template.clarity || "");
      setPrimaryHue(template.primary_hue || "");
      setColorSaturation(template.color_saturation_and_tone || "");
      setLuster(template.luster || "");
      setTransparency(template.transparency || "");
      setTreatment(template.treatment || "");
      setCertificationAvailable(template.cerification_available || "");
      setGradingAuthority(template.grading_authority || "");
      setOriginVerification(template.origin_verification || "");
      setCutCategory(template.cut_category || "");
      setCabochonShape(template.cabachon_shape || "");
      setFacetedCut(template.faceted_cut || "");
      setSlabCut(template.slab_cut || "");
      setBeadsType(template.beads_type || "");
      setHoleType(template.hole_type || "");
      setPreciousStone(template.precious_stone || "");
      setSemiPreciousQuartz(template.semi_precious_stone || "");
      setSemiPreciousBeryl(template.semi_precious_beryl || "");
      setSemiPreciousFeldspar(template.semi_precious_feldspar || "");
      setOtherSemiPrecious(template.other_semi_precious || "");
      setOrganicGem(template.organic_gem || "");
      setSyntheticGem(template.synthetic_gem || "");
      setPreviewUrls(template.images || [template.image_url || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]);

      // ! Log the previewUrls after update
      // console.log("Preview URLs after update:", template.images || [template.image_url || "https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]);

      setCurrentCarouselIndex(0);
      setShowTemplateSearch(false); // Close the template search panel
      setSearchText(""); // Clear the search text
    }
  };

  const handleSaveAsTemplate = async () => {
    let uploadedImageUrls = await uploadImages("stones");

    const existingUrls = previewUrls.filter((url) => !url.startsWith("blob:") && !url.includes("ProductPlaceholder"));

    const allImageUrls = [...existingUrls, ...uploadedImageUrls];

    const imagesArray = allImageUrls.length > 0 ? allImageUrls : ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"];

    // Prepare the template data from the form fields
    const templateData = {
      images: imagesArray,
      image_url: imagesArray[0],
      name,
      description,
      price,
      stoneStockType,
      quantity_in_stock: quantityInStock,
      weight: stoneWeight,
      stone_size: stoneSize,
      stone_thickness: stoneThickness,
      stone_diameter: stoneDiameter,
      stone_stock_type: stoneStockType,
      shape_variation: shapeVariation,
      geographic_origin: geographicalOrigin,
      mine_type: mineType,
      ethical_sourcing: ethicalSourcing,
      location_status: locationStatus,
      stock_availability: stockAvailability,
      clarity: clarity,
      primary_hue: primaryHue,
      color_saturation_and_tone: colorSaturation,
      luster: luster,
      transparency: transparency,
      treatment: treatment,
      certification_available: certificationAvailable,
      grading_authority: gradingAuthority,
      origin_verification: originVerification,
      cut_category: cutCategory,
      cabachon_shape: cabochonShape,
      faceted_cut: facetedCut,
      slab_cut: slabCut,
      beads_type: beadsType,
      hole_type: holeType,
      preciousStone,
      semiPreciousQuartz,
      semi_precious_beryl: semiPreciousBeryl,
      semi_precious_feldspar: semiPreciousFeldspar,
      other_semi_precious: otherSemiPrecious,
      organic_gem: organicGem,
      synthetic_gem: syntheticGem,
      category: "Stones"
    };

    try {
      // Send a POST request to save the template
      const response = await fetch('/api/item-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save template');
      }

      const data = await response.json();
      console.log('Template saved successfully:', data);

      // Display a success message
      setMessage('Template saved successfully!');

      await fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      setMessage(error.message || 'Failed to save template');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const latestIndex = handleFileChange(e); // Get the index of the latest uploaded image
    if (latestIndex !== -1) {
      setCurrentCarouselIndex(latestIndex); // Update the carousel index
    }
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = [...files];
    const newPreviewUrls = [...previewUrls];

    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);

    if (newPreviewUrls.length === 0) {
      newPreviewUrls.push("https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png");
    }

    setFiles(newFiles);
    setPreviewUrls(newPreviewUrls);

    // move the carousel index back if the last image is removed
    if (currentCarouselIndex >= newPreviewUrls.length) {
      setCurrentCarouselIndex(newPreviewUrls.length - 1);
    }
  };

  const handleAddS3Image = (imageUrl: string) => {
    setPreviewUrls((prevUrls) => {
      const filteredPreviewUrls = prevUrls.filter(url => !url.includes("ProductPlaceholder"));
      return [...filteredPreviewUrls, imageUrl];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !quantityInStock) {
      setMessage("Please fill in all required fields.");
      return;
    }

    let uploadedImageUrls = await uploadImages("stones");

    const existingUrls = previewUrls.filter((url) => !url.startsWith("blob:") && !url.includes("ProductPlaceholder"));

    const allImageUrls = [...existingUrls, ...uploadedImageUrls];

    const imagesArray = allImageUrls.length > 0 ? allImageUrls : ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"];

    const stoneData = {
      images: imagesArray,
      image_url: imagesArray[0],
      name,
      description,
      price: parseFloat(price),
      stoneStockType,
      quantity_in_stock: parseInt(quantityInStock),
      weight: stoneWeight,
      stone_size: stoneSize,
      stone_thickness: stoneThickness,
      stone_diameter: stoneDiameter,
      shape_variation: shapeVariation,
      geographical_origin: geographicalOrigin,
      mine_type: mineType,
      ethical_sourcing: ethicalSourcing,
      location_status: locationStatus,
      stock_availability: stockAvailability,
      clarity: clarity,
      primary_hue: primaryHue,
      color_saturation: colorSaturation,
      luster: luster,
      transparency: transparency,
      treatment: treatment,
      certification_available: certificationAvailable,
      grading_authority: gradingAuthority,
      origin_verification: originVerification,
      cut_category: cutCategory,
      cabachon_shape: cabochonShape,
      faceted_cut: facetedCut,
      slab_cut: slabCut,
      beads_type: beadsType,
      hole_type: holeType,
      preciousStone,
      semiPreciousQuartz,
      semi_precious_beryl: semiPreciousBeryl,
      semi_precious_feldspar: semiPreciousFeldspar,
      other_semi_precious: otherSemiPrecious,
      organic_gem: organicGem,
      synthetic_gem: syntheticGem,
      category: "Stones"
    };

    // ! DEBUG LINE
    console.log("Submitted Stone Data:", stoneData);

    setMessage("Stone item successfully submitted!");

    try {
      // Send a POST request to the backend API
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stoneData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "failed to submit the jewelry item");
      }

      const data = await response.json();
      console.log("API Response:", data);

      setMessage("Stone item successfully submitted!");

      // Reset all fields
      setName("");
      setDescription("");
      setStoneStockType("");
      setQuantityInStock("");
      setStoneWeight("");
      setStoneSize("");
      setStoneThickness("");
      setStoneDiameter("");
      setShapeVariation("");
      setGeographicalOrigin("");
      setMineType("");
      setEthicalSourcing("");
      setLocationStatus("");
      setStockAvailability("");
      setClarity("");
      setPrimaryHue("");
      setColorSaturation("");
      setLuster("");
      setTransparency("");
      setTreatment("");
      setCertificationAvailable("");
      setGradingAuthority("");
      setOriginVerification("");
      setCutCategory("");
      setCabochonShape("");
      setFacetedCut("");
      setSlabCut("");
      setBeadsType("");
      setHoleType("");
      setPreciousStone("");
      setSemiPreciousQuartz("");
      setSemiPreciousBeryl("");
      setSemiPreciousFeldspar("");
      setOtherSemiPrecious("");
      setOrganicGem("");
      setSyntheticGem("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error submitting stone item:", err.message);
        setMessage(err.message);
      } else {
        console.error("An unknown error occured:", err);
        setMessage("An unknown error occured.");
      }
    }
  };

  return (
    <div className="bg-white p-6 border rounded shadow-lg overflow-auto max-h-screen">

      {/* Close Button */}
      <div className="flex justify-end mt-4">
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={onClose}>
          Change Item Type
        </button>
      </div>

      <h3 className="text-2xl font-semibold mb-4 text-center">Stone Specifications</h3>
      <form onSubmit={handleSubmit}>

        {/* Template Search Toggle */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setShowTemplateSearch(!showTemplateSearch)}
          >
            {showTemplateSearch ? "Hide Templates" : "Browse Templates"}
          </button>
        </div>

        {/* Template Search Panel */}
        {showTemplateSearch && (
          <div className="mb-6 p-4 border rounded bg-white shadow-sm">
            <input
              type="text"
              placeholder="Search Templates"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input input-bordered input-sm w-full mb-2"
            />
            {filteredTemplateList.length > 0 ? (
              <ul
                className="border border-gray-200 rounded-md shadow-md overflow-y-auto"
                style={{
                  maxHeight: filteredTemplateList.length > 4 ? "160px" : "auto",
                }}
              >
                {filteredTemplateList.map((template, index) => (
                  <li
                    key={index}
                    onClick={() => loadTemplate(index.toString())}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {template.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No templates found</p>
            )}
          </div>
        )}

        {/* Image Upload Section */}
        <div className="mb-6 flex flex-col items-center space-y-4">
          <label className="label">
            <span className="label-text font-semibold">Product Image</span>
          </label>
          <ImageCarousel
            images={
              previewUrls.length > 0 ? previewUrls : ["https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png"]
            }
            currentIndex={currentCarouselIndex}
            onIndexChange={setCurrentCarouselIndex}
            onRemoveImage={handleRemoveImage}
            onAddS3Image={handleAddS3Image}
          />
          {/* File Input for Multiple Images */}
          <div>
            <input
              type="file"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-sm"
              multiple // Allow multiple file selection
            />
          </div>
        </div>

        {/* General Attributes */}
        <h4 className="text-xl font-semibold mb-2">General Attributes</h4>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Product Name</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Product Description</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div>
          <label className="label">
            <span className="label-text font-semibold">Price</span>
          </label>
          <input
            type="number"
            step="0.01"
            className="input input-bordered w-full"
            value={price}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || (/^\d*\.?\d{0,2}$/.test(value) && parseFloat(value) >= 0)) {
                setPrice(value);
              }
            }}
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text font-semibold">Stock Availability</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={stockAvailability}
            onChange={(e) => {
              setStockAvailability(e.target.value)
              if (e.target.value === "One-of-a-kind") {
                setQuantityInStock("1");
              } else if (e.target.value === "Out of stock") {
                setQuantityInStock("0");
              }
            }}
            required
          >
            <option value="" disabled>Select Stock Availability</option>
            {stockAvailabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {(stockAvailability === "In stock" || stockAvailability == "Pre-order" || stockAvailability === "Limited stock") && (
          <div>
            <label className="label font-semibold">Quantity in Stock</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={quantityInStock}
              onChange={(e) => {
                const value = e.target.value;
                const numericValue = parseInt(value, 10);

                if (!isNaN(numericValue)) {
                  const absoluteValue = Math.abs(numericValue); // Convert to positive
                  setQuantityInStock(absoluteValue.toString());
                } else {
                  setQuantityInStock(value);
                }
              }}
              required
            />
          </div>
        )}

        <div>
          <label className="label">
            <span className="label-text font-semibold">Stone Stock Type</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={stoneStockType}
            onChange={(e) => setStoneStockType(e.target.value)}
            required
          >
            <option value="" disabled>Select Stone Stock Type</option>
            {stoneStockTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Weight</span>
            </label>
            <input
              type="string"
              className="input input-bordered w-full"
              value={stoneWeight}
              onChange={(e) => setStoneWeight(e.target.value)}
              placeholder="Enter weight"
              required
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text font-semibold">Size (Dimensions)</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={stoneSize}
              onChange={(e) => setStoneSize(e.target.value)}
              placeholder="e.g., H x W x L"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Stone Thickness</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={stoneThickness}
              onChange={(e) => setStoneThickness(e.target.value)}
              placeholder="Enter thickness"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text font-semibold">Stone Diameter</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={stoneDiameter}
              onChange={(e) => setStoneDiameter(e.target.value)}
              placeholder="Enter diameter (for round stones)"
            />
          </div>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Shape Variations</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={shapeVariation}
            onChange={(e) => setShapeVariation(e.target.value)}
          >
            <option value="" disabled>Select Shape Variation</option>
            {shapeVariationsOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Location (Origin & Mining Details) */}
        <h4 className="text-xl font-semibold mt-6 mb-2">Location (Origin & Mining Details)</h4>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Geographical Origin</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={geographicalOrigin}
            onChange={(e) => setGeographicalOrigin(e.target.value)}
            placeholder="Country, region, mine name, locality"
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Mine Type</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={mineType}
            onChange={(e) => setMineType(e.target.value)}
          >
            <option value="" disabled>Select Mine Type</option>
            {mineTypesOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Ethical Sourcing</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={ethicalSourcing}
              onChange={(e) => setEthicalSourcing(e.target.value)}
            >
              <option value="" disabled>Select Ethical Sourcing</option>
              {ethicalSourcingOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text font-semibold">Location Status</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={locationStatus}
              onChange={(e) => setLocationStatus(e.target.value)}
            >
              <option value="" disabled>Select Location Status</option>
              {locationStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Quality Attributes */}
        <h4 className="text-xl font-semibold mt-6 mb-2">Quality Attributes</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Clarity</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={clarity}
              onChange={(e) => setClarity(e.target.value)}
            >
              <option value="" disabled>Select Clarity</option>
              {clarityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text font-semibold">Primary Hue</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={primaryHue}
              onChange={(e) => setPrimaryHue(e.target.value)}
            >
              <option value="" disabled>Select Primary Hue</option>
              {primaryHueOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Color Saturation & Tone</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={colorSaturation}
              onChange={(e) => setColorSaturation(e.target.value)}
            >
              <option value="" disabled>Select Color Saturation & Tone</option>
              {colorSaturationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text font-semibold">Luster</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={luster}
              onChange={(e) => setLuster(e.target.value)}
            >
              <option value="" disabled>Select Luster</option>
              {lusterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Transparency</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={transparency}
            onChange={(e) => setTransparency(e.target.value)}
          >
            <option value="" disabled>Select Transparency</option>
            {transparencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Stone Treatments & Enhancements */}
        <h4 className="text-xl font-semibold mt-6 mb-2">Stone Treatments & Enhancements</h4>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Treatment</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
          >
            <option value="" disabled>Select Treatment</option>
            {treatmentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Stone Certification & Grading */}
        <h4 className="text-xl font-semibold mt-6 mb-2">Stone Certification & Grading</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Certification Available</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={certificationAvailable}
              onChange={(e) => setCertificationAvailable(e.target.value)}
            >
              <option value="" disabled>Select</option>
              {certificationAvailableOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text font-semibold">Grading Authority</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={gradingAuthority}
              onChange={(e) => setGradingAuthority(e.target.value)}
            >
              <option value="" disabled>Select</option>
              {gradingAuthorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text font-semibold">Origin Verification</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={originVerification}
              onChange={(e) => setOriginVerification(e.target.value)}
            >
              <option value="" disabled>Select</option>
              {originVerificationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Shape & Cut */}
        <h4 className="text-xl font-semibold mt-6 mb-2">Shape & Cut</h4>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Cut Category</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={cutCategory}
            onChange={(e) => setCutCategory(e.target.value)}
          >
            <option value="" disabled>Select Cut Category</option>
            {cutCategories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {cutCategory === "Cabochons" && (
          <div>
            <label className="label">
              <span className="label-text font-semibold">Cabochon Shape</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={cabochonShape}
              onChange={(e) => setCabochonShape(e.target.value)}
            >
              <option value="" disabled>Select Cabochon Shape</option>
              {cabochonShapes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
        {cutCategory === "Faceted Stones" && (
          <div>
            <label className="label">
              <span className="label-text font-semibold">Faceted Cut</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={facetedCut}
              onChange={(e) => setFacetedCut(e.target.value)}
            >
              <option value="" disabled>Select Faceted Cut</option>
              {facetedCuts.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
        {cutCategory === "Slabs & Rough Cuts" && (
          <div>
            <label className="label">
              <span className="label-text font-semibold">Slab Cut</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={slabCut}
              onChange={(e) => setSlabCut(e.target.value)}
            >
              <option value="" disabled>Select Slab Cut</option>
              {slabCuts.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
        {cutCategory === "Beads & Drilled Stones" && (
          <>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Beads Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={beadsType}
                onChange={(e) => setBeadsType(e.target.value)}
              >
                <option value="" disabled>Select Beads Type</option>
                {beadsTypesOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-semibold">Hole Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={holeType}
                onChange={(e) => setHoleType(e.target.value)}
              >
                <option value="" disabled>Select Hole Type</option>
                {holeTypesOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Gemstone Type & Variations */}
        <h4 className="text-xl font-semibold mt-6 mb-2">Gemstone Type & Variations</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Precious Stone</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={preciousStone}
              onChange={(e) => setPreciousStone(e.target.value)}
            >
              <option value="" disabled>Select Precious Stone</option>
              {preciousStoneOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text font-semibold">Semi-Precious (Quartz)</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={semiPreciousQuartz}
              onChange={(e) => setSemiPreciousQuartz(e.target.value)}
            >
              <option value="" disabled>Select Semi-Precious Quartz</option>
              {semiPreciousQuartzOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Semi-Precious (Beryl)</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={semiPreciousBeryl}
              onChange={(e) => setSemiPreciousBeryl(e.target.value)}
            >
              <option value="" disabled>Select Semi-Precious Beryl</option>
              {semiPreciousBerylOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text font-semibold">Semi-Precious (Feldspar)</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={semiPreciousFeldspar}
              onChange={(e) => setSemiPreciousFeldspar(e.target.value)}
            >
              <option value="" disabled>Select Semi-Precious Feldspar</option>
              {semiPreciousFeldsparOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Other Semi-Precious</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={otherSemiPrecious}
            onChange={(e) => setOtherSemiPrecious(e.target.value)}
          >
            <option value="" disabled>Select Other Semi-Precious</option>
            {otherSemiPreciousOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Organic Gem</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={organicGem}
              onChange={(e) => setOrganicGem(e.target.value)}
            >
              <option value="" disabled>Select Organic Gem</option>
              {organicGemOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text font-semibold">Synthetic Gem</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={syntheticGem}
              onChange={(e) => setSyntheticGem(e.target.value)}
            >
              <option value="" disabled>Select Synthetic Gem</option>
              {syntheticGemOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            type="button"
            onClick={handleSaveAsTemplate}
            disabled={!areRequiredFieldsFilled()} // Disable if required fields are not filled
            className={`${areRequiredFieldsFilled()
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
              } text-white px-4 py-2 rounded`}
          >
            Save as Template
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className={`${areRequiredFieldsFilled()
              ? "bg-blue-500 rounded hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
              } text-white px-4 py-2 rounded`}
            disabled={!areRequiredFieldsFilled()}
          >
            Submit Stone Item
          </button>
        </div>

        {/* Success / Error Message */}
        {message && (
          <p className={`text-center mt-4 font-semibold ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </form>

      {/* Close Button */}
      <div className="flex justify-end mt-4">
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}