import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

<<<<<<< HEAD
const userSchema = new mongoose.Schema({
   uid: {
    type: Number,
    unique: true
  },
  username: String,
  email: { type: String, unique: true },
  password: String,
=======
// Initialize AutoIncrement
const AutoIncrement = AutoIncrementFactory(mongoose);
>>>>>>> 0919c25 (update code)

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    totalDeposited: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    lastTrades: { type: Array, default: [] },
    // NEW: UID field
    uid: { type: Number, unique: true },
  },
  { timestamps: true }
);

// Apply auto-increment plugin for UID
userSchema.plugin(AutoIncrement, { inc_field: "uid" });

const User = mongoose.model("User", userSchema);

export default User;
