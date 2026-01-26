import mongoose from "mongoose"

const AdminSettingsSchema = new mongoose.Schema({
  // Admin UPI IDs for receiving losing bet amounts
  adminUpiIds: [{
    upiId: { type: String, required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  }],
  // Track which admin received the last payment (for equal distribution)
  lastPaymentAdminIndex: { type: Number, default: 0 },
  // Commission percentage (optional)
  commissionPercent: { type: Number, default: 5 },
  // Minimum/Maximum bet amounts
  minBetAmount: { type: Number, default: 10 },
  maxBetAmount: { type: Number, default: 100000 },
}, { timestamps: true })

export default mongoose.models.AdminSettings || mongoose.model("AdminSettings", AdminSettingsSchema)
