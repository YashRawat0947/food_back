import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      default: "user",
      enum: ["user", "admin"]
    },
    cartData: { 
      type: Object, 
      default: {} 
    },
  },
  { 
    timestamps: true,   // adds createdAt & updatedAt
    minimize: false 
  }
);

// Correct hot-reload safe model export
const userModel =
  mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;