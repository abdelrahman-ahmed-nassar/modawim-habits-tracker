/**
 * Shared utility functions for data services
 */

/**
 * Helper to convert Mongoose documents to plain objects
 */
export const toPlain = <T>(doc: any): T => {
  if (!doc) return doc;
  return doc.toObject ? (doc.toObject() as T) : (doc as T);
};

/**
 * Initialize data (noop for MongoDB, kept for compatibility)
 */
export const initializeData = async (): Promise<void> => {
  // MongoDB collections are created automatically on first insert.
};

