"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Plus, 
  Trophy, 
  Loader2, 
  Edit, 
  Trash2, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"

interface Match {
  _id: string
  title: string
  team1: string
  team2: string
  startTime: string
  status: "upcoming" | "live" | "completed"
  questions: Question[]
  createdAt: string
}

interface Question {
  _id: string
  text: string
  options: { text: string; odds: number }[]
  status: "open" | "closed" | "settled"
  correctOption?: number
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [questionOpen, setQuestionOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Match form
  const [matchForm, setMatchForm] = useState({
    title: "",
    team1: "",
    team2: "",
    startTime: "",
  })

  // Question form
  const [questionForm, setQuestionForm] = useState({
    text: "",
    option1: "",
    odds1: "1.5",
    option2: "",
    odds2: "1.5",
  })

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/admin/matches")
      const data = await res.json()
      if (data.success) {
        setMatches(data.matches)
      }
    } catch (err) {
      console.error("Failed to fetch matches:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatch = async () => {
    if (!matchForm.title) {
      alert("Please enter match title")
      return
    }
    if (!matchForm.team1 || !matchForm.team2) {
      alert("Please enter both team names")
      return
    }
    if (!matchForm.startTime) {
      alert("Please select start date and time")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchForm),
      })

      const data = await res.json()
      if (data.success) {
        setMatches([data.match, ...matches])
        setCreateOpen(false)
        setMatchForm({ title: "", team1: "", team2: "", startTime: "" })
      }
    } catch (err) {
      console.error("Failed to create match:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!questionForm.text || !questionForm.option1 || !questionForm.option2 || !selectedMatch) {
      alert("Please fill all fields")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/matches/${selectedMatch._id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: questionForm.text,
          options: [
            { text: questionForm.option1, odds: parseFloat(questionForm.odds1) },
            { text: questionForm.option2, odds: parseFloat(questionForm.odds2) },
          ],
        }),
      })

      const data = await res.json()
      if (data.success) {
        await fetchMatches()
        setQuestionOpen(false)
        setQuestionForm({ text: "", option1: "", odds1: "1.5", option2: "", odds2: "1.5" })
      }
    } catch (err) {
      console.error("Failed to add question:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return

    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setMatches(matches.filter(m => m._id !== matchId))
      }
    } catch (err) {
      console.error("Failed to delete match:", err)
    }
  }

  const handleSettleQuestion = async (matchId: string, questionId: string, correctOption: number) => {
    try {
      const res = await fetch(`/api/admin/matches/${matchId}/questions/${questionId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correctOption }),
      })

      if (res.ok) {
        await fetchMatches()
      }
    } catch (err) {
      console.error("Failed to settle question:", err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-bold uppercase">Live</span>
      case "upcoming":
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold uppercase">Upcoming</span>
      case "completed":
        return <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-bold uppercase">Completed</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Matches & Betting</h1>
          <p className="text-muted-foreground">Create and manage matches with betting questions</p>
        </div>
        <Button 
          onClick={() => setCreateOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-black font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Match
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No Matches Yet</h3>
          <p className="text-muted-foreground mb-6">Create your first match to start accepting bets</p>
          <Button 
            onClick={() => setCreateOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-black font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Match
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match._id} className="bg-card border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-foreground">{match.title}</h3>
                    {getStatusBadge(match.status)}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {match.team1} vs {match.team2}
                  </p>
                  <p className="text-muted-foreground/60 text-xs mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(match.startTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMatch(match)
                      setQuestionOpen(true)
                    }}
                    className="border-green-500 text-green-500 hover:bg-green-500/10"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Question
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMatch(match._id)}
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Questions */}
              {match.questions && match.questions.length > 0 && (
                <div className="border-t border-border pt-4 mt-4">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase mb-3">
                    Betting Questions ({match.questions.length})
                  </h4>
                  <div className="space-y-3">
                    {match.questions.map((q, idx) => (
                      <div key={q._id} className="bg-background rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-foreground font-medium">{q.text}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            q.status === "open" ? "bg-green-500/20 text-green-500" :
                            q.status === "settled" ? "bg-blue-500/20 text-blue-500" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {q.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex-1">
                              <div className={`bg-card rounded-lg p-3 text-center ${
                                q.correctOption === optIdx ? "ring-2 ring-green-500" : ""
                              }`}>
                                <p className="text-sm text-foreground">{opt.text}</p>
                                <p className="text-xs text-green-500 font-bold">@{opt.odds}x</p>
                              </div>
                              {q.status === "open" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSettleQuestion(match._id, q._id, optIdx)}
                                  className="w-full mt-2 text-xs text-muted-foreground hover:text-green-500"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Mark Winner
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Match Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Match</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase font-bold">Match Title</Label>
              <Input
                value={matchForm.title}
                onChange={(e) => setMatchForm({ ...matchForm, title: e.target.value })}
                placeholder="IPL 2026 - Match 1"
                className="h-12 bg-background border-border rounded-xl text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase font-bold">Team 1</Label>
                <Input
                  value={matchForm.team1}
                  onChange={(e) => setMatchForm({ ...matchForm, team1: e.target.value })}
                  placeholder="Mumbai Indians"
                  className="h-12 bg-background border-border rounded-xl text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase font-bold">Team 2</Label>
                <Input
                  value={matchForm.team2}
                  onChange={(e) => setMatchForm({ ...matchForm, team2: e.target.value })}
                  placeholder="Chennai Super Kings"
                  className="h-12 bg-background border-border rounded-xl text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase font-bold">Start Time</Label>
              <Input
                type="datetime-local"
                value={matchForm.startTime}
                onChange={(e) => setMatchForm({ ...matchForm, startTime: e.target.value })}
                className="h-12 bg-background border-border rounded-xl text-foreground"
              />
              <p className="text-xs text-muted-foreground">Select both date and time for the match</p>
            </div>
            <Button
              onClick={handleCreateMatch}
              disabled={submitting}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Match
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={questionOpen} onOpenChange={setQuestionOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Betting Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-background rounded-xl p-3">
              <p className="text-xs text-muted-foreground uppercase">Adding to</p>
              <p className="text-foreground font-bold">{selectedMatch?.title}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase font-bold">Question</Label>
              <Input
                value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                placeholder="Who will win the toss?"
                className="h-12 bg-background border-border rounded-xl text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase font-bold">Option 1</Label>
                <Input
                  value={questionForm.option1}
                  onChange={(e) => setQuestionForm({ ...questionForm, option1: e.target.value })}
                  placeholder="Mumbai Indians"
                  className="h-12 bg-background border-border rounded-xl text-foreground"
                />
                <Input
                  type="number"
                  step="0.1"
                  value={questionForm.odds1}
                  onChange={(e) => setQuestionForm({ ...questionForm, odds1: e.target.value })}
                  placeholder="Odds"
                  className="h-10 bg-background border-border rounded-xl text-foreground text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase font-bold">Option 2</Label>
                <Input
                  value={questionForm.option2}
                  onChange={(e) => setQuestionForm({ ...questionForm, option2: e.target.value })}
                  placeholder="Chennai Super Kings"
                  className="h-12 bg-background border-border rounded-xl text-foreground"
                />
                <Input
                  type="number"
                  step="0.1"
                  value={questionForm.odds2}
                  onChange={(e) => setQuestionForm({ ...questionForm, odds2: e.target.value })}
                  placeholder="Odds"
                  className="h-10 bg-background border-border rounded-xl text-foreground text-sm"
                />
              </div>
            </div>
            <Button
              onClick={handleAddQuestion}
              disabled={submitting}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
