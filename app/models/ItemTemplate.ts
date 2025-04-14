import mongoose, { Schema, Document } from 'mongoose';

export interface IItemTemplate extends Document {
  name: string;
  description: string;
  price: string;
  quantityInStock: string;
  jewelryType: string;
  category: string;
  size?: string;
  image_url?: string;
  images?: string[];
  color?: string;
  metalType?: string;
  metalPurity?: string;
  metalFinish?: string;
  plating?: string;
  ringSize?: string;
  caratWeight?: string;
  settingType?: string;
  stoneArrangement?: string;
  customizationOptions?: string;
  weight?: string;
  stoneStockType?: string;
  stoneThickness?: string;
  stoneDiameter?: string;
  stoneSize?: string;
  shapeVariation?: string;
  geographicOrigin?: string;
  mineType?: string;
  ethicalSourcing?: string;
  locationStatus?: string;
  stockAvailability?: string;
  clarity?: string;
  primaryHue?: string;
  colorSaturationAndTone?: string;
  luster?: string;
  transparency?: string;
  treatment?: string;
  certificationAvailable?: string;
  gradingAuthority?: string;
  originVerification?: string;
  cutCategory?: string;
  preciousStone?: string;
  semiPreciousStone?: string;
  organicGem?: string;
  syntheticGem?: string;
  cabachonShape?: string;
  facetedCut?: string;
  slabCut?: string;
  beadsType?: string;
  holeType?: string;
  semiPreciousBeryl?: string;
  semiPreciousFeldspar?: string;
  otherSemiPrecious?: string;
}

const ItemTemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          const numericValue = parseFloat(value);
          return !isNaN(numericValue) && numericValue >= 0 && /^\d+(\.\d{1,2})?$/.test(value);
        },
        message: "Price must be a positive number with up to 2 decimal places.",
      },
    },
    quantity_in_stock: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          const numericValue = parseInt(value, 10);
          return !isNaN(numericValue) && numericValue >= 0;
        },
        message: 'Quantity in stock must be a non-negative integer.',
      }
    },
    category: { type: String, required: true },
    image_url: { type: String },
    images: { type: [String] },
    weight: { type: String },

    // Jewelry
    jewelry_type: { type: String },
    color: { type: String },
    inlayed_stone: { type: String },
    metal_type: { type: String },
    metal_purity: { type: String },
    metal_finish: { type: String },
    plating: { type: String },
    ring_size: { type: String },
    carat_weight: { type: String },
    setting_type: { type: String },
    size: { type: String },

    // Stones
    stone_arrangement: { type: String },
    customization_options: { type: String },
    stone_stock_type: { type: String },
    stone_thickness: { type: String },
    stone_diameter: { type: String },
    stone_size: { type: String },
    shape_variation: { type: String },
    geographic_origin: { type: String },
    mine_type: { type: String },
    ethical_sourcing: { type: String },
    location_status: { type: String },
    stock_availability: { type: String },
    clarity: { type: String },
    primary_hue: { type: String },
    color_saturation_and_tone: { type: String },
    luster: { type: String },
    transparency: { type: String },
    treatment: { type: String },
    certification_available: { type: String },
    grading_authority: { type: String },
    origin_verification: { type: String },
    cut_category: { type: String },
    precious_stone: { type: String },
    semi_precious_stone: { type: String },
    organic_gem: { type: String },
    synthetic_gem: { type: String },
    cabachon_shape: { type: String },
    faceted_cut: { type: String },
    slab_cut: { type: String },
    beads_type: { type: String },
    hole_type: { type: String },
    semi_precious_beryl: { type: String },
    semi_precious_feldspar: { type: String },
    other_semi_precious: { type: String },

    // Tools and Supplies
    tool_type: { type: String },
    essentials_type: { type: String },
    brand: { type: String },
    material_component: { type: String },
    material_composition: { type: String },
    kit_type: { type: String },
    kit_contents: { type: String },
    supply_type: { type: String },
    supply_brand: { type: String },
    supply_material: { type: String },
  },
);

// Pre-save hook to format the price to 2 decimal places
ItemTemplateSchema.pre<IItemTemplate>('save', function (next) {
  if (this.price) {
    const numericValue = parseFloat(this.price);
    if (!isNaN(numericValue) && numericValue >= 0) {
      this.price = numericValue.toFixed(2); // Format to 2 decimal places
    }
  }
  next();
});

const ItemTemplate = mongoose.models.ItemTemplate || mongoose.model<IItemTemplate>('ItemTemplate', ItemTemplateSchema);
export default ItemTemplate;