import mongoose from "mongoose";

// When we are creating the database connectivity, yes we will have to execute it with each request, but there can be a possibility of the connectivity 
// already existing, we need to watch out for that as well. (Suppose the next request came 2 seconds after the first connection)

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already Connected to database");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '')

        connection.isConnected = db.connections[0].readyState;

        console.log("DB Connected Successfully");

    } catch (error) {
        console.log("Database connection failed: ", error);
        process.exit();
    }
}

export default dbConnect;