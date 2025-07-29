import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  resetPasswordToken: {
    type: String,
  },
  verificationToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,

  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema)

// mongoose.pre("save")

export  {User};
