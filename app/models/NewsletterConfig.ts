import mongoose, { Schema } from 'mongoose';

const NewsletterConfigSchema = new Schema({
  type: { type: String, default: 'monthly' },
  dayOfMonth: { type: Number, default: 1 }, // Day of month to send (1-31)
  hour: { type: Number, default: 9 }, // Hour of day (0-23)
  minute: { type: Number, default: 0 }, // Minute (0-59)
  active: { type: Boolean, default: true }, // Toggle newsletter on/off
  lastSent: { type: Date, default: null }, // Track when last sent
  updatedBy: { type: String }, // Admin who updated config
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.NewsletterConfig || 
  mongoose.model('NewsletterConfig', NewsletterConfigSchema);