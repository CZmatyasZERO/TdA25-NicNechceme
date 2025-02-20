import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import fs from "fs"
import path from "path"

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Prevent multiple connections from being opened in development (hot reloads)
let cached: MongooseCache = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

let mongoServer: MongoMemoryServer | null = null

async function connectToDatabase() {
  // If connection already exists, return it
  if (cached.conn) {
    return cached.conn
  }

  // Ensure the ./data directory exists
  const dataDir = path.resolve("./data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
  }

  // Configure MongoMemoryServer with persistence
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbPath: dataDir, // Persist data in ./data
        storageEngine: "wiredTiger", // Use WiredTiger storage engine
      },
    })
    const uri = mongoServer.getUri()

    cached.promise = mongoose.connect(uri, { bufferCommands: false }).then((mongoose) => mongoose)
  }

  // Store the connection in the cache
  cached.conn = await cached.promise
  return cached.conn
}

// Export the connection function
export { connectToDatabase }
