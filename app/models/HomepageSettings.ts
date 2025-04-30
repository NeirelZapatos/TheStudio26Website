import mongoose, { Document, Schema } from 'mongoose';

export interface ImageEntry {
  url: string;
  key: string;
}

export interface HomepageSettingsDocument extends Document {
  aboutTitle: string;
  aboutText: string;
  jewelryTitle: string;
  jewelryDescription: string;
  buttonUrl: string;
  buttonLabel: string;
  callToActionText: string;
  projectsSectionTitle: string;
  images: ImageEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<ImageEntry>({
  url: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  }
});

const HomepageSettingsSchema = new Schema<HomepageSettingsDocument>({
  aboutTitle: {
    type: String,
    required: true
  },
  aboutText: {
    type: String,
    required: true
  },
  jewelryTitle: {
    type: String,
    required: true
  },
  jewelryDescription: {
    type: String,
    required: true
  },
  buttonUrl: {
    type: String,
    required: true
  },
  buttonLabel: {
    type: String,
    required: true
  },
  callToActionText: {
    type: String,
    required: true
  },
  projectsSectionTitle: {
    type: String,
    required: true
  },
  images: [ImageSchema]
}, { timestamps: true });

const HomepageSettings = mongoose.models.HomepageSettings as mongoose.Model<HomepageSettingsDocument> || 
  mongoose.model<HomepageSettingsDocument>('HomepageSettings', HomepageSettingsSchema);

export default HomepageSettings;