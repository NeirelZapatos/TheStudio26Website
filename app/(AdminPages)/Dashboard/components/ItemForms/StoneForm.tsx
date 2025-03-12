"use client";

import { useState } from "react";
import Image from "next/image";

interface StoneFormProps {
  onClose: () => void;
}

export default function StoneForm({ onClose }: StoneFormProps) {
  // General Attributes
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [stoneStockType, setStoneStockType] = useState(""); // e.g., Old stock, new stock, etc.
  const [stoneWeight, setStoneWeight] = useState(""); // Weight value
  const [stoneSize, setStoneSize] = useState(""); // e.g., "Height x Width x Length"
  const [stoneThickness, setStoneThickness] = useState("");
  const [stoneDiameter, setStoneDiameter] = useState("");
  const [shapeVariation, setShapeVariation] = useState("");

  // Location (Origin & Mining Details)
  const [geographicalOrigin, setGeographicalOrigin] = useState("");
  const [mineType, setMineType] = useState("");
  const [ethicalSourcing, setEthicalSourcing] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [stockAvailability, setStockAvailability] = useState("");

  // Quality Attributes
  const [clarity, setClarity] = useState("");
  const [primaryHue, setPrimaryHue] = useState("");
  const [colorSaturation, setColorSaturation] = useState("");
  const [luster, setLuster] = useState("");
  const [transparency, setTransparency] = useState("");

  // Stone Treatments & Enhancements
  const [treatment, setTreatment] = useState("");

  // Stone Certification & Grading
  const [certificationAvailable, setCertificationAvailable] = useState("");
  const [gradingAuthority, setGradingAuthority] = useState("");
  const [originVerification, setOriginVerification] = useState("");

  // Shape & Cut
  const [cutCategory, setCutCategory] = useState("");
  const [cabochonShape, setCabochonShape] = useState("");
  const [facetedCut, setFacetedCut] = useState("");
  const [slabCut, setSlabCut] = useState("");
  const [beadsType, setBeadsType] = useState("");
  const [holeType, setHoleType] = useState("");

  // Gemstone Type & Variations
  const [preciousStone, setPreciousStone] = useState("");
  const [semiPreciousQuartz, setSemiPreciousQuartz] = useState("");
  const [semiPreciousBeryl, setSemiPreciousBeryl] = useState("");
  const [semiPreciousFeldspar, setSemiPreciousFeldspar] = useState("");
  const [otherSemiPrecious, setOtherSemiPrecious] = useState("");
  const [organicGem, setOrganicGem] = useState("");
  const [syntheticGem, setSyntheticGem] = useState("");

  const [message, setMessage] = useState("");

  // Image Upload State
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("https://tests26bucket.s3.us-east-2.amazonaws.com/ProductPlaceholder.png");

  // Options arrays
  const stoneStockTypes = [
    "Old stock",
    "New stock",
    "Vintage",
    "Antique",
    "Estate",
    "Limited edition",
    "Rare find",
    "Collector’s item",
    "Discontinued",
  ];
  const shapeVariationsOptions = [
    "Asymmetrical",
    "Calibrated sizes",
    "Freeform",
    "Irregular",
  ];

  const mineTypesOptions = [
    "Open-pit",
    "Underground",
    "Artisanal",
    "River/mined",
    "Marine extraction",
  ];
  const ethicalSourcingOptions = [
    "Conflict-free",
    "Fair trade",
    "Ethically sourced",
    "Recycled",
  ];
  const locationStatusOptions = [
    "Domestic",
    "Imported",
    "Out-of-state",
    "Region-specific",
  ];
  const stockAvailabilityOptions = [
    "In stock",
    "Out of stock",
    "Pre-order",
    "Limited stock",
    "Made-to-order",
    "One-of-a-kind",
  ];

  const clarityOptions = [
    "FL",
    "IF",
    "VVS1",
    "VVS2",
    "VS1",
    "VS2",
    "SI1",
    "SI2",
    "I1",
    "I2",
    "I3",
    "Cloudy",
    "Heavily Included",
    "Near-Opaque",
  ];
  const primaryHueOptions = [
    "White",
    "Blue",
    "Green",
    "Red",
    "Yellow",
    "Pink",
    "Brown",
    "Black",
    "Gray",
    "Colorless",
  ];
  const colorSaturationOptions = [
    "Vivid",
    "Intense",
    "Deep",
    "Medium",
    "Pastel",
    "Pale",
  ];
  const lusterOptions = [
    "High Shine",
    "Vitreous (Glassy)",
    "Dull",
    "Satin",
    "Pearly",
    "Silky",
    "Waxy",
    "Resinous",
    "Metallic",
    "Adamantine",
  ];
  const transparencyOptions = [
    "Transparent",
    "Semi-Transparent",
    "Translucent",
    "Semi-Opaque",
    "Opaque",
  ];

  const treatmentOptions = [
    "Natural/Untreated",
    "Heat-Treated",
    "Dye-Enhanced",
    "Resin-Filled",
    "Irradiated",
    "Oiled/Wax Treated",
    "Coated",
    "Fracture-Filled",
  ];

  const certificationAvailableOptions = ["Yes", "No"];
  const gradingAuthorityOptions = ["GIA", "IGI", "AGS", "EGL"];
  const originVerificationOptions = [
    "Mine of Origin Report",
    "Ethical Sourcing Certificate",
  ];

  const cutCategories = [
    "Cabochons",
    "Faceted Stones",
    "Slabs & Rough Cuts",
    "Beads & Drilled Stones",
  ];
  const cabochonShapes = [
    "Round",
    "Oval",
    "Square",
    "Pear",
    "Teardrop",
    "Freeform",
    "Marquise",
    "Rectangle",
    "Heart",
    "Trillion",
    "Hexagon",
  ];
  const facetedCuts = [
    "Round Brilliant",
    "Oval",
    "Step Cut",
    "Princess Cut",
    "Cushion Cut",
    "Radiant Cut",
    "Baguette",
    "Rose Cut",
    "Asscher Cut",
    "Old Mine Cut",
    "Unique Fancy Cuts",
  ];
  const slabCuts = [
    "Uncut",
    "Sliced",
    "Polished",
    "Raw",
    "Geode Slabs",
    "Drusy",
    "Layered Slabs",
  ];
  const beadsTypesOptions = [
    "Round beads",
    "Faceted beads",
    "Teardrop beads",
    "Tumbled beads",
    "Nugget beads",
  ];
  const holeTypesOptions = [
    "Center-drilled",
    "Side-drilled",
    "Top-drilled",
    "Undrilled",
  ];

  const preciousStoneOptions = ["Diamond", "Sapphire", "Ruby", "Emerald"];
  const semiPreciousQuartzOptions = [
    "Amethyst",
    "Citrine",
    "Rose Quartz",
    "Smoky Quartz",
    "Rutilated Quartz",
  ];
  const semiPreciousBerylOptions = [
    "Aquamarine",
    "Morganite",
    "Heliodor",
  ];
  const semiPreciousFeldsparOptions = [
    "Labradorite",
    "Moonstone",
    "Sunstone",
  ];
  const otherSemiPreciousOptions = [
    "Peridot",
    "Garnet",
    "Tourmaline",
    "Topaz",
    "Spinel",
    "Zircon",
    "Tanzanite",
  ];
  const organicGemOptions = ["Amber", "Coral", "Jet", "Pearl"];
  const syntheticGemOptions = [
    "Lab-Grown Diamonds",
    "Moissanite",
    "Cubic Zirconia",
    "Synthetic Sapphire",
    "Synthetic Ruby",
    "Synthetic Emerald",
    "Opalite",
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name.replace(/\s+/g, "-"));
    }
  };

  const uploadImage = async () => {
    if (!file || !fileName.trim()) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    const response = await fetch("/api/imageupload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    setImageUrl(data.url);
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (!productName || !stoneStockType || !stoneWeight || !stoneSize) {
      setMessage("Please fill in all required fields.");
      return;
    }

    let uploadedImageUrl = imageUrl;

    if (file) {
      try {
        uploadedImageUrl = await uploadImage();
      } catch (error) {
        setMessage("Failed to upload image.");
        console.error(error);
        return;
      }
    }

    const stoneData = {
      productName,
      productDescription,
      stoneStockType,
      stoneWeight: parseFloat(stoneWeight),
      stoneSize,
      stoneThickness,
      stoneDiameter,
      shapeVariation,
      geographicalOrigin,
      mineType,
      ethicalSourcing,
      locationStatus,
      stockAvailability,
      clarity,
      primaryHue,
      colorSaturation,
      luster,
      transparency,
      treatment,
      certificationAvailable,
      gradingAuthority,
      originVerification,
      cutCategory,
      cabochonShape,
      facetedCut,
      slabCut,
      beadsType,
      holeType,
      preciousStone,
      semiPreciousQuartz,
      semiPreciousBeryl,
      semiPreciousFeldspar,
      otherSemiPrecious,
      organicGem,
      syntheticGem,
    };

    console.log("Submitted Stone Data:", stoneData);
    setMessage("Stone item successfully submitted!");

    // Reset all fields
    setProductName("");
    setProductDescription("");
    setStoneStockType("");
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
  };

  return (
    <div className="bg-white p-6 border rounded shadow-lg overflow-auto max-h-screen">
      <h3 className="text-2xl font-semibold mb-4 text-center">Stone Specifications</h3>
      <form onSubmit={handleSubmit}>

        {/* Image Upload Section */}
        <div className="mb-6 flex flex-col items-center space-y-4">
          <label className="label">
            <span className="label-text font-semibold">Product Image</span>
          </label>
          <div className="w-48 h-48 relative">
            <Image
              src={imageUrl}
              alt="Product Image"
              layout="fill"
              objectFit="cover"
              className="rounded"
            />
          </div>
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              className="file-input file-input-bordered file-input-sm"
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
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Product Description</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          ></textarea>
        </div>
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
            <option value="">Select Stone Stock Type</option>
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
              type="number"
              step="0.01"
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
            <option value="">Select Shape Variation</option>
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
            <option value="">Select Mine Type</option>
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
              <option value="">Select Ethical Sourcing</option>
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
              <option value="">Select Location Status</option>
              {locationStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">
            <span className="label-text font-semibold">Stock Availability</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={stockAvailability}
            onChange={(e) => setStockAvailability(e.target.value)}
          >
            <option value="">Select Stock Availability</option>
            {stockAvailabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
              <option value="">Select Clarity</option>
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
              <option value="">Select Primary Hue</option>
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
              <option value="">Select Color Saturation & Tone</option>
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
              <option value="">Select Luster</option>
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
            <option value="">Select Transparency</option>
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
            <option value="">Select Treatment</option>
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
              <option value="">Select</option>
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
              <option value="">Select</option>
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
              <option value="">Select</option>
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
            <option value="">Select Cut Category</option>
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
              <option value="">Select Cabochon Shape</option>
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
              <option value="">Select Faceted Cut</option>
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
              <option value="">Select Slab Cut</option>
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
                <option value="">Select Beads Type</option>
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
                <option value="">Select Hole Type</option>
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
              <option value="">Select Precious Stone</option>
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
              <option value="">Select Semi-Precious Quartz</option>
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
              <option value="">Select Semi-Precious Beryl</option>
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
              <option value="">Select Semi-Precious Feldspar</option>
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
            <option value="">Select Other Semi-Precious</option>
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
              <option value="">Select Organic Gem</option>
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
              <option value="">Select Synthetic Gem</option>
              {syntheticGemOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
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