"use client";
import React, { useEffect, useState } from "react";

const MatchHeading = () => {
    const [question, setQuestion] = useState("Loading match event...");

    useEffect(() => {
        // This fetches the dynamic question set by the Admin in MongoDB
        const fetchQuestion = async () => {
            try {
                const res = await fetch("/api/admin/get-active-question");
                const data = await res.json();
                if (data.question) setQuestion(data.question);
            } catch (err) {
                console.error("Failed to load question", err);
            }
        };
        fetchQuestion();
    }, []);

    return (
        <div className="w-full bg-[#0a0a0a] border-b border-[#333] p-6 text-center">
            <h2 className="text-[#1ed760] text-xl font-bold tracking-wide uppercase">
                {question}
            </h2>
            <div className="mt-2 flex justify-center gap-4 text-xs text-gray-500">
                <span>LIVE SESSION</span>
                <span className="text-red-500">●</span>
            </div>
        </div>
    );
};

export default MatchHeading;