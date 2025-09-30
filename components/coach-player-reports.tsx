"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useCenterContext } from "@/context/center-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Star, 
  Target, 
  Award, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Zap,
  Trophy,
  Medal,
  User,
  Share2,
  Mail,
  Printer
} from "lucide-react"
import { format } from "date-fns"

interface Player {
  id: string
  full_name: string
  age: number
  batch_id: string
  batch_name: string
  center_name: string
}

interface KPI {
  id: string
  name: string
  description: string
  min_value: number
  max_value: number
  unit: string
  category: 'technical' | 'physical' | 'mental' | 'tactical'
  is_active: boolean
}

interface PlayerReport {
  id: string
  player_id: string
  player_name: string
  batch_name: string
  report_date: string
  overall_rating: number
  notes: string
  kpi_scores: KPIScore[]
  created_by: string
  created_at: string
  updated_at: string
}

interface KPIScore {
  kpi_id: string
  kpi_name: string
  score: number
  notes?: string
}

interface NewReport {
  player_id: string
  overall_rating: number
  notes: string
  kpi_scores: { [key: string]: number }
  kpi_notes: { [key: string]: string }
}

export default function CoachPlayerReports() {
  const { user, selectedCenter, loading: contextLoading } = useCenterContext()
  const [players, setPlayers] = useState<Player[]>([])
  const [kpis, setKPIs] = useState<KPI[]>([])
  const [reports, setReports] = useState<PlayerReport[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("create-report")
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showKPIDialog, setShowKPIDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedReport, setSelectedReport] = useState<PlayerReport | null>(null)
  const [newReport, setNewReport] = useState<NewReport>({
    player_id: "",
    overall_rating: 5,
    notes: "",
    kpi_scores: {},
    kpi_notes: {}
  })
  const [newKPI, setNewKPI] = useState({
    name: "",
    description: "",
    min_value: 0,
    max_value: 10,
    unit: "points",
    category: "technical" as const
  })

  // Load data on component mount
  useEffect(() => {
    if (user?.role === 'coach' && user?.id) {
      loadPlayers()
      loadKPIs()
    }
  }, [user])

  // Load reports after players are loaded
  useEffect(() => {
    if (players.length > 0) {
      loadReports()
    }
  }, [players, user])

  const loadPlayers = async () => {
    setLoading(true)
    try {
      if (!user?.id) throw new Error("User not authenticated")

      // Get players from coach's batches
      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          full_name,
          age,
          batch_id,
          batches!inner(id, name, coach_id, centers!inner(name))
        `)
        .eq("batches.coach_id", user.id)
        .order("full_name")

      if (error) throw error

      const formattedPlayers: Player[] = (data || []).map((player: any) => ({
        id: player.id,
        full_name: player.full_name,
        age: player.age,
        batch_id: player.batch_id,
        batch_name: player.batches?.name || "Unknown Batch",
        center_name: player.batches?.centers?.name || "Unknown Center"
      }))

      setPlayers(formattedPlayers)
    } catch (error: any) {
      console.error('Error loading players:', error)
      setError(error.message || "Failed to load players")
    } finally {
      setLoading(false)
    }
  }

  const loadKPIs = async () => {
    try {
      // For now, we'll use default KPIs. Later this can be made configurable per coach/center
      const defaultKPIs: KPI[] = [
        { id: "1", name: "Ball Control", description: "Ability to control and manipulate the ball", min_value: 0, max_value: 10, unit: "points", category: "technical", is_active: true },
        { id: "2", name: "Passing Accuracy", description: "Precision in passing the ball to teammates", min_value: 0, max_value: 10, unit: "points", category: "technical", is_active: true },
        { id: "3", name: "Shooting", description: "Goal scoring ability and shot accuracy", min_value: 0, max_value: 10, unit: "points", category: "technical", is_active: true },
        { id: "4", name: "Speed", description: "Running speed and acceleration", min_value: 0, max_value: 10, unit: "points", category: "physical", is_active: true },
        { id: "5", name: "Endurance", description: "Stamina and fitness levels", min_value: 0, max_value: 10, unit: "points", category: "physical", is_active: true },
        { id: "6", name: "Teamwork", description: "Ability to work well with teammates", min_value: 0, max_value: 10, unit: "points", category: "mental", is_active: true },
        { id: "7", name: "Focus", description: "Concentration and attention during training", min_value: 0, max_value: 10, unit: "points", category: "mental", is_active: true },
        { id: "8", name: "Positioning", description: "Understanding of field positions and movement", min_value: 0, max_value: 10, unit: "points", category: "tactical", is_active: true },
        { id: "9", name: "Decision Making", description: "Quick thinking and smart choices on field", min_value: 0, max_value: 10, unit: "points", category: "tactical", is_active: true },
        { id: "10", name: "Attitude", description: "Positive attitude and coachability", min_value: 0, max_value: 10, unit: "points", category: "mental", is_active: true }
      ]
      setKPIs(defaultKPIs)
    } catch (error: any) {
      console.error('Error loading KPIs:', error)
    }
  }

  const loadReports = async () => {
    try {
      if (!user?.id) return

      // For now, we'll simulate report data with a sample report. Later this should come from a reports table
      const sampleReports: PlayerReport[] = players.length > 0 ? [{
        id: "sample-1",
        player_id: players[0]?.id || "",
        player_name: players[0]?.full_name || "Sample Player",
        batch_name: players[0]?.batch_name || "Sample Batch",
        report_date: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 7 days ago
        overall_rating: 7.5,
        notes: "Great improvement in ball control and passing accuracy. Needs to work on decision making under pressure. Shows excellent teamwork and positive attitude during training sessions.",
        kpi_scores: [
          { kpi_id: "1", kpi_name: "Ball Control", score: 8.5, notes: "Excellent progress this week" },
          { kpi_id: "2", kpi_name: "Passing Accuracy", score: 8.0, notes: "Very consistent" },
          { kpi_id: "3", kpi_name: "Shooting", score: 6.5, notes: "Needs more practice" },
          { kpi_id: "4", kpi_name: "Speed", score: 7.0 },
          { kpi_id: "5", kpi_name: "Endurance", score: 7.5 },
          { kpi_id: "6", kpi_name: "Teamwork", score: 9.0, notes: "Outstanding team player" },
          { kpi_id: "7", kpi_name: "Focus", score: 8.0 },
          { kpi_id: "8", kpi_name: "Positioning", score: 6.0, notes: "Room for improvement" },
          { kpi_id: "9", kpi_name: "Decision Making", score: 5.5, notes: "Needs work under pressure" },
          { kpi_id: "10", kpi_name: "Attitude", score: 9.5, notes: "Exceptional attitude" }
        ],
        created_by: user.id,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }] : []
      
      setReports(sampleReports)
    } catch (error: any) {
      console.error('Error loading reports:', error)
    }
  }

  const handleCreateReport = async () => {
    if (!newReport.player_id || !user?.id) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const selectedPlayerData = players.find(p => p.id === newReport.player_id)
      if (!selectedPlayerData) throw new Error("Player not found")

      // Calculate KPI scores array
      const kpiScores: KPIScore[] = Object.entries(newReport.kpi_scores).map(([kpiId, score]) => {
        const kpi = kpis.find(k => k.id === kpiId)
        return {
          kpi_id: kpiId,
          kpi_name: kpi?.name || "Unknown KPI",
          score: score,
          notes: newReport.kpi_notes[kpiId] || ""
        }
      })

      // Create new report object
      const reportData: PlayerReport = {
        id: Date.now().toString(), // Temporary ID
        player_id: newReport.player_id,
        player_name: selectedPlayerData.full_name,
        batch_name: selectedPlayerData.batch_name,
        report_date: format(new Date(), "yyyy-MM-dd"),
        overall_rating: newReport.overall_rating,
        notes: newReport.notes,
        kpi_scores: kpiScores,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // In a real implementation, this would be saved to the database
      setReports(prev => [reportData, ...prev])
      
      setSuccess("Player report created successfully!")
      setShowReportDialog(false)
      resetReportForm()

    } catch (error: any) {
      console.error('Error creating report:', error)
      setError(error.message || "Failed to create report")
    } finally {
      setSaving(false)
    }
  }

  const resetReportForm = () => {
    setNewReport({
      player_id: "",
      overall_rating: 5,
      notes: "",
      kpi_scores: {},
      kpi_notes: {}
    })
  }

  const handleKPIScoreChange = (kpiId: string, score: number) => {
    setNewReport(prev => ({
      ...prev,
      kpi_scores: { ...prev.kpi_scores, [kpiId]: score }
    }))
  }

  const handleKPINotesChange = (kpiId: string, notes: string) => {
    setNewReport(prev => ({
      ...prev,
      kpi_notes: { ...prev.kpi_notes, [kpiId]: notes }
    }))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Target className="h-4 w-4" />
      case 'physical': return <Zap className="h-4 w-4" />
      case 'mental': return <User className="h-4 w-4" />
      case 'tactical': return <BarChart3 className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'text-blue-600 bg-blue-50'
      case 'physical': return 'text-green-600 bg-green-50'
      case 'mental': return 'text-purple-600 bg-purple-50'
      case 'tactical': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getScoreColor = (score: number, maxScore: number = 10) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPlayerReports = (playerId: string) => {
    return reports.filter(r => r.player_id === playerId)
  }

  const handleViewReport = (report: PlayerReport) => {
    setSelectedReport(report)
    setShowViewDialog(true)
  }

  const handleDownloadReport = async (report: PlayerReport) => {
    try {
      // Create HTML content for the report
      const htmlContent = generateReportHTML(report)
      
      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `${report.player_name}_Report_${report.report_date}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setSuccess("Report downloaded successfully!")
    } catch (error) {
      console.error('Error downloading report:', error)
      setError("Failed to download report")
    }
  }

  const handleShareReport = async (report: PlayerReport) => {
    try {
      if (navigator.share) {
        // Use native Web Share API if available
        await navigator.share({
          title: `Player Report - ${report.player_name}`,
          text: `Performance report for ${report.player_name} (${report.overall_rating}/10 overall rating)`,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        const reportText = `Player Report - ${report.player_name}\nOverall Rating: ${report.overall_rating}/10\nDate: ${format(new Date(report.report_date), "PPP")}\nNotes: ${report.notes}`
        await navigator.clipboard.writeText(reportText)
        setSuccess("Report details copied to clipboard!")
      }
    } catch (error) {
      console.error('Error sharing report:', error)
      setError("Failed to share report")
    }
  }

  const generateReportHTML = (report: PlayerReport) => {
    const kpisByCategory = report.kpi_scores.reduce((acc, score) => {
      const kpi = kpis.find(k => k.id === score.kpi_id)
      const category = kpi?.category || 'other'
      if (!acc[category]) acc[category] = []
      acc[category].push({ ...score, category: kpi?.category })
      return acc
    }, {} as Record<string, any[]>)

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Player Report - ${report.player_name}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #8B1538; padding-bottom: 20px; margin-bottom: 30px; }
        .player-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .overall-rating { text-align: center; background: #8B1538; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .kpi-section { margin-bottom: 30px; }
        .kpi-category { background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .kpi-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #e2e8f0; }
        .kpi-item:last-child { border-bottom: none; }
        .score-high { color: #16a34a; font-weight: bold; }
        .score-medium { color: #ca8a04; font-weight: bold; }
        .score-low { color: #dc2626; font-weight: bold; }
        .notes { background: #fef7cd; padding: 20px; border-radius: 8px; border-left: 4px solid #eab308; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Player Performance Report</h1>
        <p>Snigmay Pune FC</p>
    </div>
    
    <div class="player-info">
        <h2>${report.player_name}</h2>
        <p><strong>Batch:</strong> ${report.batch_name}</p>
        <p><strong>Report Date:</strong> ${format(new Date(report.report_date), "PPP")}</p>
        <p><strong>Created by:</strong> Coach</p>
    </div>
    
    <div class="overall-rating">
        <h2>Overall Rating</h2>
        <div style="font-size: 3em; font-weight: bold;">${report.overall_rating}/10</div>
    </div>
    
    <div class="kpi-section">
        <h2>Performance Breakdown</h2>
        ${Object.entries(kpisByCategory).map(([category, scores]) => `
            <div class="kpi-category">
                <h3 style="text-transform: capitalize; color: #1e293b; margin-bottom: 15px;">${category} Skills</h3>
                ${scores.map(score => `
                    <div class="kpi-item">
                        <span>${score.kpi_name}</span>
                        <span class="${score.score >= 8 ? 'score-high' : score.score >= 6 ? 'score-medium' : 'score-low'}">${score.score}/10</span>
                    </div>
                    ${score.notes ? `<div style="font-size: 0.9em; color: #64748b; margin-top: 5px;">${score.notes}</div>` : ''}
                `).join('')}
            </div>
        `).join('')}
    </div>
    
    ${report.notes ? `
    <div class="notes">
        <h3>Coach's Notes & Recommendations</h3>
        <p>${report.notes}</p>
    </div>
    ` : ''}
    
    <div class="footer">
        <p>Generated on ${format(new Date(), "PPP")} | Snigmay Pune FC Management System</p>
    </div>
</body>
</html>
    `
  }

  // Loading state
  if (contextLoading || (loading && players.length === 0)) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy-600"></div>
          <p className="text-sm text-gray-600">Loading player reports...</p>
        </div>
      </div>
    )
  }

  // No players assigned
  if (players.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <FileText className="h-6 w-6" />
              Player Reports
            </CardTitle>
            <CardDescription>Create and manage player performance reports</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <Users className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">No Players Assigned</h3>
                <p className="text-gray-600 mt-1">
                  You don't have any players in your batches yet. Players will appear here once they are enrolled in your batches.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Player Reports
          </CardTitle>
          <CardDescription>
            Create detailed performance reports for your players with customizable KPIs
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create-report" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Report
          </TabsTrigger>
          <TabsTrigger value="view-reports" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Reports
          </TabsTrigger>
          <TabsTrigger value="manage-kpis" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Manage KPIs
          </TabsTrigger>
        </TabsList>

        {/* Create Report Tab */}
        <TabsContent value="create-report" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Player Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Select Player</CardTitle>
                <CardDescription>Choose a player to create a report for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {players.map((player) => (
                    <div 
                      key={player.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPlayer === player.id 
                          ? 'border-burgundy-500 bg-burgundy-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPlayer(player.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{player.full_name}</h4>
                          <p className="text-sm text-gray-600">Age: {player.age}</p>
                          <p className="text-sm text-gray-500">{player.batch_name}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getPlayerReports(player.id).length} reports
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Creation Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Create New Report</CardTitle>
                    <CardDescription>
                      {selectedPlayer 
                        ? `Creating report for ${players.find(p => p.id === selectedPlayer)?.full_name}`
                        : "Select a player to create a report"
                      }
                    </CardDescription>
                  </div>
                  <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        disabled={!selectedPlayer}
                        className="bg-burgundy-600 hover:bg-burgundy-700"
                        onClick={() => setNewReport(prev => ({ ...prev, player_id: selectedPlayer }))}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create Player Report</DialogTitle>
                        <DialogDescription>
                          Evaluate {players.find(p => p.id === selectedPlayer)?.full_name} across different KPIs
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Overall Rating */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium">Overall Rating</Label>
                          <div className="space-y-2">
                            <Slider
                              value={[newReport.overall_rating]}
                              onValueChange={([value]) => setNewReport(prev => ({ ...prev, overall_rating: value }))}
                              max={10}
                              min={0}
                              step={0.5}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>0</span>
                              <span className="font-medium text-burgundy-600">{newReport.overall_rating}/10</span>
                              <span>10</span>
                            </div>
                          </div>
                        </div>

                        {/* KPI Scores */}
                        <div className="space-y-4">
                          <Label className="text-base font-medium">KPI Evaluations</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {kpis.filter(kpi => kpi.is_active).map((kpi) => (
                              <Card key={kpi.id} className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded ${getCategoryColor(kpi.category)}`}>
                                      {getCategoryIcon(kpi.category)}
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{kpi.name}</h4>
                                      <p className="text-xs text-gray-500">{kpi.description}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Slider
                                      value={[newReport.kpi_scores[kpi.id] || 5]}
                                      onValueChange={([value]) => handleKPIScoreChange(kpi.id, value)}
                                      max={kpi.max_value}
                                      min={kpi.min_value}
                                      step={0.5}
                                      className="w-full"
                                    />
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500">{kpi.min_value}</span>
                                      <span className={`font-medium ${getScoreColor(newReport.kpi_scores[kpi.id] || 5, kpi.max_value)}`}>
                                        {newReport.kpi_scores[kpi.id] || 5}/{kpi.max_value}
                                      </span>
                                      <span className="text-gray-500">{kpi.max_value}</span>
                                    </div>
                                  </div>

                                  <Input
                                    placeholder="Notes (optional)"
                                    value={newReport.kpi_notes[kpi.id] || ""}
                                    onChange={(e) => handleKPINotesChange(kpi.id, e.target.value)}
                                    className="text-sm"
                                  />
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* General Notes */}
                        <div className="space-y-2">
                          <Label className="text-base font-medium">General Notes</Label>
                          <Textarea
                            placeholder="Add any additional observations, recommendations, or comments about the player's performance..."
                            value={newReport.notes}
                            onChange={(e) => setNewReport(prev => ({ ...prev, notes: e.target.value }))}
                            rows={4}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowReportDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateReport}
                          disabled={saving || !selectedPlayer}
                          className="bg-burgundy-600 hover:bg-burgundy-700"
                        >
                          {saving ? "Creating..." : "Create Report"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {selectedPlayer ? (
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Click "Create Report" to start evaluating this player</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Select a player from the left to create a report</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* View Reports Tab */}
        <TabsContent value="view-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Player Reports</CardTitle>
              <CardDescription>
                View and manage all created player reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{report.player_name}</h4>
                            <Badge variant="outline">{report.batch_name}</Badge>
                            <Badge 
                              variant="outline" 
                              className={getScoreColor(report.overall_rating, 10)}
                            >
                              {report.overall_rating}/10
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Created on {format(new Date(report.created_at), "PPP")}
                          </p>
                          {report.notes && (
                            <p className="text-sm text-gray-700">{report.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleShareReport(report)}
                          >
                            <Share2 className="mr-1 h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Created Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start creating player reports to track performance and progress
                  </p>
                  <Button 
                    onClick={() => setActiveTab("create-report")}
                    className="bg-burgundy-600 hover:bg-burgundy-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage KPIs Tab */}
        <TabsContent value="manage-kpis" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Manage KPIs</CardTitle>
                  <CardDescription>
                    Configure Key Performance Indicators for player evaluation
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowKPIDialog(true)}
                  className="bg-burgundy-600 hover:bg-burgundy-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add KPI
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi) => (
                  <Card key={kpi.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${getCategoryColor(kpi.category)}`}>
                            {getCategoryIcon(kpi.category)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {kpi.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">{kpi.name}</h4>
                        <p className="text-sm text-gray-600">{kpi.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Range: {kpi.min_value}-{kpi.max_value}</span>
                        <span>{kpi.unit}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Report Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Player Performance Report</DialogTitle>
            <DialogDescription>
              {selectedReport && `Detailed report for ${selectedReport.player_name} - ${format(new Date(selectedReport.report_date), "PPP")}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Player Info */}
              <Card className="bg-gradient-to-r from-burgundy-50 to-burgundy-100 border-burgundy-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-burgundy-900">{selectedReport.player_name}</h3>
                      <p className="text-burgundy-700">Batch: {selectedReport.batch_name}</p>
                      <p className="text-burgundy-600 text-sm">Report Date: {format(new Date(selectedReport.report_date), "PPP")}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-burgundy-600 text-white rounded-full">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{selectedReport.overall_rating}</div>
                          <div className="text-xs">/ 10</div>
                        </div>
                      </div>
                      <p className="text-burgundy-700 mt-2 font-medium">Overall Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KPI Breakdown */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Performance Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReport.kpi_scores.map((score) => {
                    const kpi = kpis.find(k => k.id === score.kpi_id)
                    return (
                      <Card key={score.kpi_id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded ${getCategoryColor(kpi?.category || 'technical')}`}>
                                {getCategoryIcon(kpi?.category || 'technical')}
                              </div>
                              <div>
                                <h5 className="font-medium">{score.kpi_name}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {kpi?.category}
                                </Badge>
                              </div>
                            </div>
                            <div className={`text-lg font-bold ${getScoreColor(score.score, kpi?.max_value || 10)}`}>
                              {score.score}/{kpi?.max_value || 10}
                            </div>
                          </div>
                          <Progress 
                            value={(score.score / (kpi?.max_value || 10)) * 100} 
                            className="h-2"
                          />
                          {score.notes && (
                            <p className="text-sm text-gray-600 italic">{score.notes}</p>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Coach's Notes */}
              {selectedReport.notes && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-800">Coach's Notes & Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-yellow-900">{selectedReport.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {selectedReport && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownloadReport(selectedReport)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleShareReport(selectedReport)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.print()}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </>
              )}
            </div>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
