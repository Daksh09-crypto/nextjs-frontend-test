import { MongoClient } from "mongodb";
//console.log(process.env.MONGODB_URI);
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add MONGODB_URI to your .env.local");
}

const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // Prevent multiple connections during hot reload
  if (!global._mongoClientPromise) {
 // console.log(process.env.MONGODB_URI);
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }

  clientPromise = global._mongoClientPromise;
} else {
  // Production
 // console.log(process.env.MONGODB_URI);
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;