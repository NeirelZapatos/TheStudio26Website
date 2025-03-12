interface ProductSpecsProps {
product: Record<string, any>;
}

const FIELD_LABELS: Record<string, string> = {
  color: "Color",
  size: "Size",
  material: "Material",
  jewelry_type: "Jewelry Type",
  metal_type: "Metal Type",
  metal_purity: "Metal Purity",
  metal_finish: "Metal Finish",
  plating: "Plating",
  ring_size: "Ring Size",
  gauge: "Gauge",
  carat_weight: "Carat Weight",
  setting_type: "Setting Type",
  stone_arrangement: "Stone Arrangement",
  customization_options: "Customization Options",
};

export default function ProductSpecs({ product }: ProductSpecsProps) {
  return (
    <div className="tabs tabs-bordered tabs-lg space-x-2 py-10">
      <input
        type="radio"
        name="my_tabs_2"
        className="tab"
        aria-label="Product Specifications"
        defaultChecked
      />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        {Object.entries(FIELD_LABELS).map(([key, label]) =>
          product[key] ? (
            <p key={key}>
              <strong>{label}:</strong> {product[key]}
            </p>
          ) : null
        )}
      </div>

      <input type="radio" name="my_tabs_2" className="tab" aria-label="Shipping Information" />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        Placeholder
      </div>

      <input type="radio" name="my_tabs_2" className="tab" aria-label="Return and Refund Policy" />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        Placeholder 2
      </div>
    </div>
  );
}
