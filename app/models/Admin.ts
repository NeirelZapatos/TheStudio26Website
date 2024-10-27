import mongoose, { Document, Schema } from "mongoose"

export interface IAdmin extends Document {
    email: string;
    hashedPassword: string;
}

const adminSchema:Schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    hashed_password: {
        type: String,
        required: true
    },
});

const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;