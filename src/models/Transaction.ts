import mongoose from "mongoose"

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { 
      type: String, 
      enum: ["deposit", "withdraw", "bet", "win", "referral", "bonus"],
      required: true 
    },
    amount: { type: Number, required: true },
    method: { type: String }, // UPI, BANK, etc.
    status: { 
      type: String, 
      enum: ["pending", "approved", "completed", "rejected", "cancelled"],
      default: "pending" 
    },
    // For deposits - UTR/Reference number
    referenceNumber: { type: String },
    utrNumber: { type: String },
    // Admin UPI ID used for this deposit
    adminUpiId: { type: String },
    // For withdrawals - user's payment details
    withdrawalDetails: {
      bankAccountNumber: String,
      ifscCode: String,
      bankName: String,
      upiId: String,
      accountHolderName: String,
    },
    // Admin who approved/rejected
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    processedAt: { type: Date },
    // Rejection reason
    rejectionReason: { type: String },
    // Notes
    notes: { type: String },
  },
  { timestamps: true }
)

// Indexes for faster queries
TransactionSchema.index({ userId: 1, createdAt: -1 })
TransactionSchema.index({ type: 1, status: 1 })
TransactionSchema.index({ status: 1 })

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema)
