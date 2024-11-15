import mongoose from "mongoose";

const connection: { isConnected?: number } = {};

async function dbConnect() {
    if (connection.isConnected) {
        console.log("\nAlready connected to the database.");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI as string);
        connection.isConnected = db.connections[0].readyState;
        console.log("\nConnected to the database successfully.", connection.isConnected);
    } catch (err) {
        console.error("Error connecting to the database:", err);
    }
}

export default dbConnect;