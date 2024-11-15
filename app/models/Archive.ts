import mongoose, { Document, Schema } from "mongoose";

interface IArchive extends Document {
  originalId: string; // Reference to the original item's ID (could be item or course ID)
  purchaseType: "Item" | "Course"; // Type of the archived document
  archivedAt: Date; // Timestamp when the item was archived
  data: any; // Store the archived data (this will be either an Item or Course object)
}

// Define the Archive schema
const archiveSchema: Schema = new mongoose.Schema(
  {
    originalId: { type: Schema.Types.ObjectId, required: true },
    purchaseType: { type: String, required: true, enum: ["Item", "Course"] },
    archivedAt: { type: Date, default: Date.now },
    data: { type: Schema.Types.Mixed, required: true }, // Storing the entire Item or Course object
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields to the document
  }
);

const Archive = mongoose.models.Archive || mongoose.model<IArchive>("Archive", archiveSchema);

export default Archive;
