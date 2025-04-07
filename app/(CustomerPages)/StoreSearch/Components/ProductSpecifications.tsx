interface ProductSpecsProps {
  product: Record<string, any>;
}

export default function ProductSpecifications({ product }: ProductSpecsProps) {
  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <div className="join join-vertical w-full">
        {/* Specifications Accordion */}
        <div className="collapse collapse-arrow join-item border border-gray-200">
          <input type="radio" name="product-accordion" defaultChecked/>
          <div className="collapse-title font-medium text-gray-900 bg-gray-50 hover:bg-gray-100">
            Product Specifications
          </div>
          <div className="collapse-content bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 pt-2">
              {Object.entries({
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
                customization_options: "Customization Options"
              }).map(([key, label]) =>
                product[key] ? (
                  <div key={key} className="flex flex-col">
                    <dt className="text-sm font-medium text-gray-500">{label}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product[key]}</dd>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
        
        {/* Shipping Accordion */}
        <div className="collapse collapse-arrow join-item border border-gray-200">
          <input type="radio" name="product-accordion" />
          <div className="collapse-title font-medium text-gray-900 bg-gray-50 hover:bg-gray-100">
            Shipping Information
          </div>
          <div className="collapse-content bg-white">
            <p className="text-sm text-gray-700 pt-2">
              placeholder text
            </p>
          </div>
        </div>
        
        {/* Returns Accordion */}
        <div className="collapse collapse-arrow join-item border border-gray-200">
          <input type="radio" name="product-accordion" />
          <div className="collapse-title font-medium text-gray-900 bg-gray-50 hover:bg-gray-100">
            Return & Refund Policy
          </div>
          <div className="collapse-content bg-white">
            <p className="text-sm text-gray-700 pt-2">
              placeholder text
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}