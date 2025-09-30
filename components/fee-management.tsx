"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, DollarSign, AlertCircle, CheckCircle, Plus, Search, Filter, IndianRupee, Receipt, Calendar, Users } from "lucide-react"
import { useCenterContext } from "@/context/center-context"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface FeePayment {
  id: string
  student_id: string
  student_name: string
  batch_name: string
  center_name: string
  center_location: string
  amount: number
  payment_date: string
  payment_mode: string
  receipt_number: string
  status: string
  due_date: string
}

interface FeeStats {
  totalCollected: number
  totalPending: number
  totalOverdue: number
  collectionRate: number
  paidCount: number
  dueCount: number
  overdueCount: number
}

export default function FeeManagement() {
  const { selectedCenter, user } = useCenterContext()
  const { toast } = useToast()
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [stats, setStats] = useState<FeeStats>({
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    collectionRate: 0,
    paidCount: 0,
    dueCount: 0,
    overdueCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<FeePayment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    payment_mode: "cash",
    receipt_number: "",
    status: "paid",
    due_date: "",
  })
  const [error, setError] = useState("")

  // Check if user can collect fees
  const canCollectFees = user?.role === 'super_admin' || user?.role === 'club_manager' || user?.role === 'center_manager'

  useEffect(() => {
    if (selectedCenter?.id) {
    loadPayments()
    loadStudents()
    }
  }, [selectedCenter])

  const loadPayments = async () => {
    if (!selectedCenter?.id) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fee_payments')
        .select(`
          *,
          students (
            id,
            full_name,
            batches (
              id,
              name,
              centers (
                id,
                name,
                location
              )
            )
          )
        `)
        .eq('center_id', selectedCenter.id)
        .order('payment_date', { ascending: false })
      
      if (error) throw error

      // Transform the data to match our interface
      const transformedPayments = (data || []).map(payment => ({
        ...payment,
        student_name: payment.students?.full_name || 'Unknown Student',
        batch_name: payment.students?.batches?.name || 'Unknown Batch',
        center_name: payment.students?.batches?.centers?.name || 'Unknown Center',
        center_location: payment.students?.batches?.centers?.location || 'Unknown Location'
      }))

      setPayments(transformedPayments)
      calculateStats(transformedPayments)
    } catch (error) {
      console.error('Error loading payments:', error)
      setError('Failed to load fee payments')
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    if (!selectedCenter?.id) return
    
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('center_id', selectedCenter.id)
        .order('full_name')
      
      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const calculateStats = (paymentsData: FeePayment[]) => {
    const total = paymentsData.reduce((sum, payment) => sum + payment.amount, 0)
    const paidPayments = paymentsData.filter(p => p.status === 'paid')
    const duePayments = paymentsData.filter(p => p.status === 'due')
    const overduePayments = paymentsData.filter(p => p.status === 'overdue')
    
    const totalCollected = paidPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalPending = duePayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalOverdue = overduePayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    setStats({
      totalCollected,
      totalPending,
      totalOverdue,
      collectionRate: total > 0 ? (totalCollected / total) * 100 : 0,
      paidCount: paidPayments.length,
      dueCount: duePayments.length,
      overdueCount: overduePayments.length
    })
  }

  const handleEdit = (payment: FeePayment) => {
    setEditingPayment(payment)
    setFormData({
      student_id: payment.student_id || "",
      amount: payment.amount.toString(),
      payment_mode: payment.payment_mode,
      receipt_number: payment.receipt_number || "",
      status: payment.status,
      due_date: payment.due_date || "",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      student_id: "",
      amount: "",
      payment_mode: "cash",
      receipt_number: "",
      status: "paid",
      due_date: "",
    })
    setEditingPayment(null)
    setError("")
  }

  const handleDelete = async (payment: FeePayment) => {
    if (!confirm(`Are you sure you want to delete this payment record?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('fee_payments')
        .delete()
        .eq('id', payment.id)

      if (error) throw error

      // Refresh data
      await loadPayments()
    } catch (error: any) {
      console.error('Error deleting payment:', error)
      setError(error.message || "Failed to delete payment")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
      case "due":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Due</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentModeBadge = (mode: string) => {
    const colors = {
      cash: "bg-blue-100 text-blue-800 border-blue-200",
      upi: "bg-purple-100 text-purple-800 border-purple-200",
      bank_transfer: "bg-green-100 text-green-800 border-green-200",
      check: "bg-orange-100 text-orange-800 border-orange-200"
    }
    return (
      <Badge className={colors[mode as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"}>
        {mode.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = (payment.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.batch_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.center_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards - Mobile Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              ₹{stats.totalCollected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.paidCount} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              ₹{stats.totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.dueCount} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              ₹{stats.totalOverdue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueCount} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {stats.collectionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall collection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search - Mobile Responsive */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Fee Management
          </CardTitle>
          <CardDescription>
            Track and manage student fee payments across all centers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name, batch, or center..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile-friendly table */}
          <div className="rounded-md border">
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Center</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No fee payments found. {searchTerm || statusFilter !== "all" ? "Try adjusting your filters." : ""}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.student_name}</TableCell>
                        <TableCell>{payment.batch_name}</TableCell>
                        <TableCell>{payment.center_name}</TableCell>
                        <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(payment.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>{payment.payment_mode ? getPaymentModeBadge(payment.payment_mode) : '-'}</TableCell>
                        <TableCell>
                          {payment.status !== "paid" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setEditingPayment(payment)
                                setFormData({
                                  student_id: payment.student_id || "",
                                  amount: payment.amount.toString(),
                                  payment_mode: payment.payment_mode,
                                  receipt_number: payment.receipt_number || "",
                                  status: payment.status,
                                  due_date: payment.due_date || "",
                                })
                                setDialogOpen(true)
                              }}
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(payment)}
                            className="ml-2"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards View */}
            <div className="sm:hidden space-y-4 p-4">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No fee payments found. {searchTerm || statusFilter !== "all" ? "Try adjusting your filters." : ""}
                </div>
              ) : (
                filteredPayments.map((payment) => (
                  <Card key={payment.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{payment.student_name}</h3>
                        <p className="text-sm text-muted-foreground">{payment.batch_name}</p>
                        <p className="text-xs text-muted-foreground">{payment.center_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{payment.amount.toLocaleString()}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Due: {new Date(payment.due_date).toLocaleDateString()}
                        {payment.payment_mode && (
                          <div className="mt-1">{getPaymentModeBadge(payment.payment_mode)}</div>
                        )}
                      </div>
                      {payment.status !== "paid" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingPayment(payment)
                            setFormData({
                              student_id: payment.student_id || "",
                              amount: payment.amount.toString(),
                              payment_mode: payment.payment_mode,
                              receipt_number: payment.receipt_number || "",
                              status: payment.status,
                              due_date: payment.due_date || "",
                            })
                            setDialogOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(payment)}
                        className="ml-2"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Collection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPayment ? "Edit Fee Payment" : "Collect Fee Payment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select
                value={formData.student_id}
                onValueChange={(value) => setFormData({ ...formData, student_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount *</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Payment Mode *</Label>
              <Select
                value={formData.payment_mode}
                onValueChange={(value) => setFormData({ ...formData, payment_mode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Receipt Number (Optional)</Label>
              <Input
                value={formData.receipt_number}
                onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div>
              <Label>Due Date (Optional)</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                placeholder="Select due date"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (!formData.student_id || !formData.amount) {
                toast({ 
                  title: "Please fill all required fields", 
                  variant: "destructive" 
                })
                return
              }

              try {
                const currentUser = await getCurrentUser()
                if (!currentUser) {
                  setError("You must be logged in to manage fees")
                  return
                }

                const paymentData = {
                  id: editingPayment?.id || null, // Use existing ID for update
                  student_id: formData.student_id,
                  amount: parseFloat(formData.amount),
                  payment_date: editingPayment?.payment_date || new Date().toISOString().split('T')[0],
                  payment_mode: formData.payment_mode as 'cash' | 'upi' | 'bank_transfer' | 'check' | 'card' | 'online',
                  receipt_number: formData.receipt_number || null,
                  status: formData.status,
                  due_date: formData.due_date || null,
                  created_by: currentUser.id,
                  center_id: selectedCenter?.id || null,
                }

                const { error } = await supabase
                  .from('fee_payments')
                  .upsert(paymentData)
                  .select()
                  .single()

                if (error) throw error

                toast({ 
                  title: editingPayment ? "Payment updated successfully" : "Payment collected successfully",
                  description: editingPayment ? `₹${formData.amount} updated for ${students.find(s => s.id === formData.student_id)?.full_name}` : `₹${formData.amount} collected from ${students.find(s => s.id === formData.student_id)?.full_name}`
                })
                setDialogOpen(false)
                resetForm()
                loadPayments()
              } catch (error: any) {
                console.error('Error saving payment:', error)
                setError(error.message || "Failed to save payment")
              }
            }}>
              {editingPayment ? "Update Payment" : "Collect Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 