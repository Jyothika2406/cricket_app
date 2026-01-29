"use client"
import { useEffect, useState } from "react";

export default function MyBets() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetch("/api/user/bet-history")
            .then(res => {
                if (res.status === 401) {
                    // User not authenticated - return empty bets
                    return { bets: [] }
                }
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
                return res.json()
            })
            .then(data => setHistory(data.bets || []))
            .catch(err => {
                console.error("Failed to fetch bets", err)
                setHistory([])
            });
    }, []);

    return (
        <div className="p-4 space-y-4">
            {history.map((bet: any) => (
                <div key={bet._id} className="bg-card p-4 rounded-2xl border border-border">
                    <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground text-xs uppercase">{bet.matchTitle}</span>
                        <span className={`text-xs font-bold ${bet.status === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                            {bet.status.toUpperCase()}
                        </span>
                    </div>
                    <p className="font-bold text-foreground">{bet.questionText}</p>
                    <div className="flex justify-between mt-3 text-sm">
                        <span className="text-muted-foreground">Invested: ₹{bet.amount}</span>
                        <span className="text-foreground font-bold">Return: ₹{bet.payout || 0}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}