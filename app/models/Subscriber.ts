import { unsubscribe } from 'diagnostics_channel';
import mongoose, { Document, Schema, SchemaType } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ISubscriber extends Document {
    email: string;
    unsubscribeToken: string;
    active: boolean;
    createdAt: Date;
}

const subscriberSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
    },
    unsubscribeToken: {
        type: String,
        unique: true,
        default: () => uuidv4(),
    },
    active: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', subscriberSchema);

