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
}

const ItemTemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    quantityInStock: { type: String, required: true },
    jewelry_type: { type: String, required: true },
    category: { type: String, required: true },
    size: { type: String },
    image_url: { type: String },
    images: { type: [String] },
    color: { type: String },
    metal_type: { type: String },
    metal_purity: { type: String },
    metal_finish: { type: String },
    plating: { type: String },
    ring_size: { type: String },
    carat_weight: { type: String },
    setting_type: { type: String },
    stone_arrangement: { type: String },
    customization_options: { type: String },
  },
);

const ItemTemplate = mongoose.models.ItemTemplate || mongoose.model<IItemTemplate>('ItemTemplate', ItemTemplateSchema);
export default ItemTemplate;