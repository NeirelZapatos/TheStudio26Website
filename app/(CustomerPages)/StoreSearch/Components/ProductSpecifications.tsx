interface ProductSpecsProps {
  product: Record<string, any>;
}

// function to capitalize the first letter of each word since the input in the field labels is mostly lowercase
function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const FIELD_LABELS: Record<string, string> = {
  //General
  weight: "Weight",
  color: "Color",
  metal_type: "Metal Type",
  metal_purity: "Metal Purity",
  metal_finish: "Metal Finish",
  plating: "Plating",
  gauge: "Gauge",

  //Ring specific
  ring_size: "Ring Size",
  setting_type: "Setting Type",

  //Stone specific
  cut_category: "Category",
  cabachon_shape: "Cabochon Shape",
  faceted_cut: "Cut Type",
  slab_cut: "Cut Type",
  beads_type: "Bead Type",
  hole_type: "Hole Type",
  organic_gem: "Stone Type",
  synthetic_gem: "Stone Type",
  semi_precious_beryl: "Stone Type",
  semi_precious_feldspar: "Stone Type",
  other_semi_precious: "Stone Type",
  stone_arrangement: "Stone Arrangement",
  carat_weight: "Carat Weight",
  stone_thickness: "Stone Thickness",
  stone_diameter: "Stone Diameter",
  shape_variation: "Shape Variation",
  mine_type: "Mine Type",
  ethical_sourcing: "Ethical Sourcing",
  location_status: "Origin",
  clarity: "Stone Clarity",
  primary_hue: "Primary Hue",
  luster: "Stone Luster",
  transparency: "Stone Transparency",
  treatment: "Stone Treatment",
  certification_available: "Certification Available",
  grading_authority: "Grading Authority",
  origin_verification: "Origin Verification Type",

  //Essentials specific
  essentials_type: "Essentials Type",

  customization_options: "Customization Options",
};

export default function ProductSpecifications({ product }: ProductSpecsProps) {
  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <div className="join join-vertical w-full">
        {/* Specifications Accordion */}
        <div className="collapse collapse-arrow join-item border border-gray-200">
          <input type="checkbox" name="product-accordion" defaultChecked />
          <div className="collapse-title font-medium text-gray-900 bg-gray-50 hover:bg-gray-100">
            Product Specifications
          </div>
          <div className="collapse-content bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 pt-2">
              {Object.entries(FIELD_LABELS).map(([key, label]) =>
                product[key] ? (
                  <div key={key} className="flex flex-col">
                    <dt className="text-sm font-medium text-gray-500">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {capitalizeWords(product[key])}
                    </dd>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>

        {/* Shipping Accordion */}
        <div className="collapse collapse-arrow join-item border border-gray-200">
          <input type="checkbox" name="product-accordion" />
          <div className="collapse-title font-medium text-gray-900 bg-gray-50 hover:bg-gray-100">
            Shipping Information
          </div>
          <div className="collapse-content bg-white">
            <p className="text-sm text-gray-700 mt-4">
              All orders are processed within 1-2 business days. Shipping
              options will be calculated during checkout.
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
              <li>Standard shipping: 5-7 business days</li>
              <li>Express shipping: 2-3 business days</li>
            </ul>
          </div>
        </div>

        {/* Returns Accordion */}
        <div className="collapse collapse-arrow join-item border border-gray-200">
          <input type="checkbox" name="product-accordion" />
          <div className="collapse-title font-medium text-gray-900 bg-gray-50 hover:bg-gray-100">
            Return & Refund Policy
          </div>
          <div className="collapse-content bg-white">
            <p className="text-sm text-gray-700 mt-4">
              We offer a 30-day return policy for new and unworn jewelry in
              original condition with tags attached for a refund to the original
              form of purchase.
            </p>
            <p className="text-sm text-gray-700 font-bold">Custom orders are final sale.</p>
            <p className="mt-2 text-sm text-gray-700">
              To initiate a return, please contact our customer service team at
              thestudio26@gmail.com.
            </p>
          </div>
        </div>

        {/* Questions Accordion */}
        <div className="collapse collapse-arrow join-item border border-gray-200">
          <input type="checkbox" name="product-accordion" />
          <div className="collapse-title font-medium text-gray-900 bg-gray-50 hover:bg-gray-100">
            Questions?
          </div>
          <div className="collapse-content bg-white">
            <p className="text-sm mt-4">Contact us at</p>
            <h3 className="text-sm">Email: thestudio26@gmail.com</h3>

            <h3 className="text-sm">Phone: (916) 350-0546</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
