import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatch extends Document {
    title: string;
    team1: string;
    team2: string;
    startTime: Date;
    status: 'live' | 'upcoming' | 'completed';
    questions: {
        _id: string;
        text: string;
        options: { text: string; odds: number }[];
        status: 'open' | 'closed' | 'settled';
        correctOption?: number;
    }[];
    createdAt: Date;
}

const MatchSchema: Schema<IMatch> = new mongoose.Schema({
    title: { type: String, required: true },
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    status: { type: String, enum: ['live', 'upcoming', 'completed'], default: 'upcoming' },
    questions: [{
        text: { type: String, required: true },
        options: [{
            text: { type: String, required: true },
            odds: { type: Number, default: 1.5 }
        }],
        status: { type: String, enum: ['open', 'closed', 'settled'], default: 'open' },
        correctOption: { type: Number },
    }]
}, { timestamps: true });

const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);
export default Match;