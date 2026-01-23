import dotenv from "dotenv";
dotenv.config();

console.log("ENV FILE TEST:");
console.log("MONGO_URI:", process.env.MONGO_URI);
process.exit();
