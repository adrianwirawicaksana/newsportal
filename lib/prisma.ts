import { promises as dns, setServers } from "node:dns";
import { MongoClient } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoUri?: string;
};

setServers(["8.8.8.8", "1.1.1.1"]);

function extractMongoHost(uri: string) {
  try {
    const withoutProtocol = uri
      .replace(/^mongodb\+srv:\/\//, "")
      .replace(/^mongodb:\/\//, "");
    return (
      withoutProtocol
        .split("/")[0]
        .split("?")[0]
        .split("#")[0]
        .split("@")
        .pop() ?? ""
    );
  } catch {
    return "";
  }
}

export async function connectToMongo() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const host = extractMongoHost(uri);

  if (host) {
    try {
      await dns.resolveSrv(`_mongodb._tcp.${host}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`MongoDB DNS lookup failed for ${host}: ${message}`);
    }
  }

  if (!globalForMongo.mongoClient || globalForMongo.mongoUri !== uri) {
    globalForMongo.mongoClient = new MongoClient(uri);
    globalForMongo.mongoUri = uri;
  }

  try {
    await globalForMongo.mongoClient.connect();
    await globalForMongo.mongoClient.db("admin").command({ ping: 1 });
    return globalForMongo.mongoClient;
  } catch (error) {
    globalForMongo.mongoClient = undefined;
    throw error;
  }
}
