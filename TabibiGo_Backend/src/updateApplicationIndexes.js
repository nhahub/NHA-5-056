
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/database");

const ProviderApplication = require("./models/ProviderApplication");

const updateIndexes = async () => {
  try {
    await connectDB();

    const collection = ProviderApplication.collection;

    // Get existing indexes
    const indexes = await collection.indexes();

    console.log("Current ProviderApplication Indexes:");

    console.log(indexes);

    // Find the old unique index
    const oldIndex = indexes.find(
      (index) =>
        index.name === "providerId_1" &&
        index.unique === true
    );

    // Remove only the old unique index
    if (oldIndex) {
      await collection.dropIndex("providerId_1");

      console.log("Old Unique Index Removed Successfully!");
    } else {
      console.log("Old Unique Index Not Found.");
    }

    // Create the new compound index
    await collection.createIndex(
      {
        providerId: 1,
        createdAt: -1
      },
      {
        name: "providerId_1_createdAt_-1"
      }
    );

    console.log("New Compound Index Created Successfully!");

    // Verify indexes
    const updatedIndexes = await collection.indexes();

    console.log("\nUpdated Indexes:");

    updatedIndexes.forEach((index) => {
      console.log({
        name: index.name,
        fields: index.key,
        unique: index.unique || false
      });
    });

    console.log("\nIndex Update Completed!");

  } catch (error) {
    console.error("Index Update Failed:", error.message);

  } finally {
    await mongoose.disconnect();
  }
};

updateIndexes();
