import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    walletBalance: { type: Number, default: 0 },
    role: { type: String, default: "user" },
    isAdmin: { type: Boolean, default: false },
    kycStatus: { type: String, default: "pending" }
});

const BetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    matchId: String,
    questionId: String,
    selection: String,
    amount: Number,
    odds: Number,
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

const QuestionSchema = new mongoose.Schema({
    matchId: String,
    text: String,
    options: [{ name: String, odds: Number }],
    status: { type: String, default: "live" },
    result: String
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Bet = mongoose.models.Bet || mongoose.model("Bet", BetSchema);
export const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);