import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  phone: { type: String },
  walletBalance: { type: Number, default: 0 },
  role: { type: String, default: "user" }, // 'admin' or 'user'
  kycStatus: {
    type: String,
    enum: ["none", "pending", "submitted", "verified", "rejected"],
    default: "none"
  },
  kycData: {
    fullName: String,
    panNumber: String,
    aadhaarNumber: String,
    bankAccountNumber: String,
    ifscCode: String,
    bankName: String,
    upiId: String,
    bankVerified: { type: Boolean, default: false },
    upiVerified: { type: Boolean, default: false },
    submittedAt: Date,
    verifiedAt: Date,
    rejectionReason: String,
  },
  // OTP for login verification
  loginOtp: { type: String, select: false },
  loginOtpExpiry: { type: Date, select: false },
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  // Referral System
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  referralCount: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 },
  // Settings
  notifications: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: true },
  currency: { type: String, default: "INR" },
  language: { type: String, default: "en" },
}, { timestamps: true });

// Indexes for faster queries (only add indexes not covered by unique: true)
UserSchema.index({ phone: 1 });
UserSchema.index({ kycStatus: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
