import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DBNAME || undefined,
    });

    const coll = mongoose.connection.collection("usertrackings");
    const docs = await coll.find({}).sort({ createdAt: -1 }).limit(1).toArray();

    if (!docs || docs.length === 0) {
      console.log("No userTracking documents found");
    } else {
      console.log("Latest userTracking:", JSON.stringify(docs[0], null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("DB query failed:", err.message);
    process.exit(1);
  }
};

run();
