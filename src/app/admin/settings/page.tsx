"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { 
  Settings, 
  Loader2, 
  Plus, 
  Trash2,
  Save,
  CreditCard
} from "lucide-react"

interface AdminUpi {
  upiId: string
  name: string
  isActive: boolean
}

interface SettingsData {
  adminUpiIds: AdminUpi[]
  minBetAmount: number
  maxBetAmount: number
  commissionPercent: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    adminUpiIds: [],
    minBetAmount: 10,
    maxBetAmount: 100000,
    commissionPercent: 5
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newUpi, setNewUpi] = useState({ upiId: "", name: "" })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      if (data.success && data.settings) {
        setSettings(data.settings)
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      const data = await res.json()
      if (data.success) {
        alert("Settings saved!")
      } else {
        alert("Failed to save: " + data.message)
      }
    } catch (err) {
      alert("Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  const addUpi = () => {
    if (!newUpi.upiId || !newUpi.name) {
      alert("Please enter UPI ID and name")
      return
    }

    setSettings({
      ...settings,
      adminUpiIds: [...settings.adminUpiIds, { ...newUpi, isActive: true }]
    })
    setNewUpi({ upiId: "", name: "" })
  }

  const removeUpi = (index: number) => {
    setSettings({
      ...settings,
      adminUpiIds: settings.adminUpiIds.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure admin payment and betting settings</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-green-500 hover:bg-green-600 text-black font-bold"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Admin UPI IDs */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-green-500" />
          <div>
            <h2 className="text-lg font-bold text-foreground">Admin UPI IDs</h2>
            <p className="text-sm text-muted-foreground">Configure UPI IDs for receiving losing bet amounts</p>
          </div>
        </div>

        <div className="space-y-4">
          {settings.adminUpiIds.map((upi, index) => (
            <div key={index} className="flex items-center gap-4 bg-background rounded-xl p-4">
              <div className="flex-1">
                <p className="font-bold text-foreground">{upi.name}</p>
                <p className="text-sm text-muted-foreground">{upi.upiId}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                upi.isActive ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
              }`}>
                {upi.isActive ? "Active" : "Inactive"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeUpi(index)}
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {/* Add new UPI */}
          <div className="flex gap-4 mt-4">
            <Input
              placeholder="Admin Name"
              value={newUpi.name}
              onChange={(e) => setNewUpi({ ...newUpi, name: e.target.value })}
              className="bg-background border-border"
            />
            <Input
              placeholder="UPI ID (e.g., admin@upi)"
              value={newUpi.upiId}
              onChange={(e) => setNewUpi({ ...newUpi, upiId: e.target.value })}
              className="bg-background border-border"
            />
            <Button onClick={addUpi} className="bg-green-500 hover:bg-green-600 text-black">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Betting Limits */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-green-500" />
          <div>
            <h2 className="text-lg font-bold text-foreground">Betting Limits</h2>
            <p className="text-sm text-muted-foreground">Set minimum and maximum bet amounts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase font-bold">Minimum Bet (₹)</Label>
            <Input
              type="number"
              value={settings.minBetAmount}
              onChange={(e) => setSettings({ ...settings, minBetAmount: Number(e.target.value) })}
              className="h-12 bg-background border-border rounded-xl text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase font-bold">Maximum Bet (₹)</Label>
            <Input
              type="number"
              value={settings.maxBetAmount}
              onChange={(e) => setSettings({ ...settings, maxBetAmount: Number(e.target.value) })}
              className="h-12 bg-background border-border rounded-xl text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase font-bold">Commission (%)</Label>
            <Input
              type="number"
              value={settings.commissionPercent}
              onChange={(e) => setSettings({ ...settings, commissionPercent: Number(e.target.value) })}
              className="h-12 bg-background border-border rounded-xl text-foreground"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
