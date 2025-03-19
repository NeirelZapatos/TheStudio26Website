import mongoose, { Schema, Document } from 'mongoose';

export interface IItemTemplate extends Document {
  name: string;
  description: string;
  price: string;
  quantityInStock: string;
  jewelryType: string;
  image_url?: string;
  images?: string[];
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
    jewelryType: { type: String, required: true },
    image_url: { type: String },
    images: { type: [String] },
    metalType: { type: String },
    metalPurity: { type: String },
    metalFinish: { type: String },
    plating: { type: String },
    ringSize: { type: String },
    caratWeight: { type: String },
    settingType: { type: String },
    stoneArrangement: { type: String },
    customizationOptions: { type: String },
  },
  { timestamps: true }
);

const ItemTemplate = mongoose.models.ItemTemplate || mongoose.model<IItemTemplate>('ItemTemplate', ItemTemplateSchema);
export default ItemTemplate;