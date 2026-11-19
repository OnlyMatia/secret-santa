import { MongoClient } from "mongodb";

function resolveMongoUri() {
  const direct = process.env.MONGODB_URI?.trim();
  if (direct) {
    if (!direct.includes("?")) {
      return `${direct}/?retryWrites=true&w=majority`;
    }
    return direct;
  }

  const user = process.env.MONGODB_USERNAME?.trim();
  const pass = process.env.MONGODB_PASSWORD?.trim();
  const cluster =
    process.env.MONGODB_CLUSTER?.trim() ||
    process.env.MONGODB_HOST?.trim();

  if (user && pass && cluster) {
    const host = cluster.replace(/^mongodb\+srv:\/\//, "").replace(/\/$/, "");
    const encodedUser = encodeURIComponent(user);
    const encodedPass = encodeURIComponent(pass);
    return `mongodb+srv://${encodedUser}:${encodedPass}@${host}/?retryWrites=true&w=majority`;
  }

  return null;
}

const uri = resolveMongoUri();
const dbName = process.env.MONGODB_DB?.trim() || "secret_santa";

if (!uri) {
  console.warn(
    "MongoDB nije konfiguriran — postavi MONGODB_URI ili MONGODB_USERNAME/PASSWORD/CLUSTER.",
  );
}

let client;
let clientPromise;

function getClientPromise() {
  if (!uri) {
    return Promise.reject(new Error("MongoDB nije konfiguriran"));
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb() {
  const c = await getClientPromise();
  return c.db(dbName);
}