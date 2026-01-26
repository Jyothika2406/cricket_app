// If you buy a RapidAPI key later, put it here.
// For now, this returns Mock Data so your app WORKS immediately.

export async function getLiveMatches() {
    // UNCOMMENT THIS BLOCK TO USE REAL API (e.g., from RapidAPI)
    /*
    const res = await fetch('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/recent', {
      headers: {
        'X-RapidAPI-Key': 'YOUR_KEY_HERE',
        'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com'
      }
    });
    const data = await res.json();
    return data;
    */

    // --- MOCK DATA (Simulating Live Action) ---
    return [
        {
            id: "m1",
            teamA: "India",
            teamB: "Australia",
            scoreA: "185/3 (18.2)",
            scoreB: "---",
            status: "LIVE",
            note: "India batting, needs quick runs."
        },
        {
            id: "m2",
            teamA: "CSK",
            teamB: "RCB",
            scoreA: "210/4",
            scoreB: "45/1 (5.1)",
            status: "LIVE",
            note: "RCB needs 166 runs in 89 balls"
        }
    ];
}