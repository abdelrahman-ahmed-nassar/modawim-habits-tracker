/**
 * Migration Script: Migrate `id` field to `_id` for all documents
 *
 * This script:
 * 1. Finds all documents with an `id` field
 * 2. Copies the `id` value to `_id`
 * 3. Removes the old `id` field
 *
 * Run with: npx ts-node src/migrations/migrateIdTo_id.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/modawim";

interface MigrationResult {
  collection: string;
  documentsProcessed: number;
  documentsUpdated: number;
  errors: string[];
}

async function migrateCollection(
  db: mongoose.Connection,
  collectionName: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    collection: collectionName,
    documentsProcessed: 0,
    documentsUpdated: 0,
    errors: [],
  };

  try {
    const collection = db.collection(collectionName);

    // Find all documents that have an `id` field but the _id is an ObjectId
    const documents = await collection
      .find({
        id: { $exists: true },
      })
      .toArray();

    result.documentsProcessed = documents.length;
    console.log(
      `  Found ${documents.length} documents with 'id' field in ${collectionName}`
    );

    for (const doc of documents) {
      try {
        // Check if _id is an ObjectId (needs migration) or already a string UUID
        const currentId = doc._id;
        const uuidId = doc.id;

        if (!uuidId) {
          result.errors.push(
            `Document ${currentId} has no 'id' field value, skipping`
          );
          continue;
        }

        // Check if _id is already a string (UUID) - already migrated
        if (typeof currentId === "string" && currentId === uuidId) {
          console.log(`    Document ${currentId} already migrated, skipping`);
          continue;
        }

        // Create a new document with _id set to the UUID
        const { _id: _oldId, id: _oldUuid, ...restDoc } = doc;
        const newDoc = { ...restDoc, _id: uuidId };

        // Delete the old document
        await collection.deleteOne({ _id: currentId });

        // Insert the new document with UUID as _id
        await collection.insertOne(newDoc);

        result.documentsUpdated++;
        console.log(`    Migrated document: ${currentId} -> ${uuidId}`);
      } catch (docError: any) {
        result.errors.push(
          `Error migrating document ${doc._id}: ${docError.message}`
        );
      }
    }
  } catch (error: any) {
    result.errors.push(`Error processing collection: ${error.message}`);
  }

  return result;
}

async function migrateEmbeddedDocuments(
  db: mongoose.Connection
): Promise<MigrationResult> {
  const result: MigrationResult = {
    collection: "users (embedded: counters, notesTemplates)",
    documentsProcessed: 0,
    documentsUpdated: 0,
    errors: [],
  };

  try {
    const collection = db.collection("users");

    // Find all users
    const users = await collection.find({}).toArray();
    result.documentsProcessed = users.length;

    for (const user of users) {
      let needsUpdate = false;
      const updates: any = {};

      // Migrate counters (embedded documents)
      if (user.counters && Array.isArray(user.counters)) {
        const migratedCounters = user.counters.map((counter: any) => {
          if (counter.id && !counter._id) {
            needsUpdate = true;
            const { id, ...rest } = counter;
            return { _id: id, ...rest };
          }
          return counter;
        });

        if (needsUpdate) {
          updates.counters = migratedCounters;
        }
      }

      // Migrate notesTemplates (embedded documents)
      if (user.notesTemplates && Array.isArray(user.notesTemplates)) {
        const migratedTemplates = user.notesTemplates.map((template: any) => {
          if (template.id && !template._id) {
            needsUpdate = true;
            const { id, ...rest } = template;
            return { _id: id, ...rest };
          }
          return template;
        });

        if (needsUpdate || updates.counters) {
          updates.notesTemplates = migratedTemplates;
        }
      }

      if (needsUpdate) {
        await collection.updateOne({ _id: user._id }, { $set: updates });
        result.documentsUpdated++;
        console.log(`    Migrated embedded documents for user: ${user._id}`);
      }
    }
  } catch (error: any) {
    result.errors.push(`Error processing embedded documents: ${error.message}`);
  }

  return result;
}

async function dropIdIndexes(
  db: mongoose.Connection,
  collections: string[]
): Promise<void> {
  console.log("Dropping 'id_1' indexes...\n");

  for (const collectionName of collections) {
    try {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();
      const hasIdIndex = indexes.some((idx: any) => idx.name === "id_1");

      if (hasIdIndex) {
        await collection.dropIndex("id_1");
        console.log(`  Dropped 'id_1' index from ${collectionName}`);
      } else {
        console.log(`  No 'id_1' index found in ${collectionName}`);
      }
    } catch (error: any) {
      console.log(
        `  Could not drop index from ${collectionName}: ${error.message}`
      );
    }
  }
  console.log("");
}

async function runMigration(): Promise<void> {
  console.log("=== Migration: id -> _id ===\n");
  console.log(`Connecting to MongoDB: ${MONGO_URI}\n`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB\n");

    const db = mongoose.connection;
    const collections = ["users", "habits", "notes"];
    const results: MigrationResult[] = [];

    // First, drop the unique index on 'id' field to allow migration
    await dropIdIndexes(db, collections);

    // Migrate main collections
    for (const collectionName of collections) {
      console.log(`\nProcessing collection: ${collectionName}`);
      const result = await migrateCollection(db, collectionName);
      results.push(result);
    }

    // Migrate embedded documents in users
    console.log(`\nProcessing embedded documents in users`);
    const embeddedResult = await migrateEmbeddedDocuments(db);
    results.push(embeddedResult);

    // Print summary
    console.log("\n=== Migration Summary ===\n");
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const result of results) {
      console.log(`${result.collection}:`);
      console.log(`  Processed: ${result.documentsProcessed}`);
      console.log(`  Updated: ${result.documentsUpdated}`);
      console.log(`  Errors: ${result.errors.length}`);

      if (result.errors.length > 0) {
        result.errors.forEach((err) => console.log(`    - ${err}`));
      }

      totalProcessed += result.documentsProcessed;
      totalUpdated += result.documentsUpdated;
      totalErrors += result.errors.length;
    }

    console.log("\n---");
    console.log(`Total documents processed: ${totalProcessed}`);
    console.log(`Total documents updated: ${totalUpdated}`);
    console.log(`Total errors: ${totalErrors}`);
    console.log("\n=== Migration Complete ===\n");
  } catch (error: any) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
runMigration();
