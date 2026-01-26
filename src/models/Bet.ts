import mongoose, { Schema, Document } from 'mongoose';

const BetSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionId: {
        type: String,
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    selectedOption: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    odds: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'won', 'lost'],
        default: 'pending'
    },
    payout: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.models.Bet || mongoose.model('Bet', BetSchema);