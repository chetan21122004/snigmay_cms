"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useCenterContext } from "@/context/center-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { 
  IndianRupee, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Wallet,
  Receipt,
  Users,
  BarChart3
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

interface Student {
  id: string
  name: string
  batch_name: string
  center_location: string
  monthly_fee: number
  total_paid: number
  total_outstanding: number
  overdue_count: number
}

interface FeePayment {
  id: string
  student_name: string
  amount: number
  payment_date: string
  payment_mode: string
  status: string
  receipt_number: string
  batch_name: string
  center_location: string
}

interface FinanceStats {
  totalRevenue: number
  monthlyRevenue: number
  outstandingAmount: number
  overdueAmount: number
  paidCount: number
  dueCount: number
  overdueCount: number
  collectionRate: number
}

interface StudentData {
  id: string
  full_name: string
  monthly_fee: number
  batches: {
    id: string
    name: string
    centers: {
      id: string
      name: string
      location: string
    }
  }
  fee_payments: {
    id: string
    amount: number
    status: string
    payment_date: string
  }[]
}

interface PaymentData {
  id: string
  amount: number
  payment_date: string
  payment_mode: string
  status: string
  receipt_number: string
  students: {
    id: string
    full_name: string
    batches: {
      id: string
      name: string
      centers: {
        id: string
        name: string
        location: string
      }
    }
  }
}

interface PaymentStatsData {
  id: string
  amount: number
  status: string
  payment_date: string
  students: {
    id: string
    batches: {
      id: string
      centers: {
        id: string
      }
    }
  }
}

export function FinanceManagement() {
  const { selectedCenter } = useCenterContext()
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    outstandingAmount: 0,
    overdueAmount: 0,
    paidCount: 0,
    dueCount: 0,
    overdueCount: 0,
    collectionRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  useEffect(() => {
    loadFinanceData()
  }, [selectedCenter])

  const loadFinanceData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadStudentBalances(),
        loadRecentPayments(),
        loadFinanceStats()
      ])
    } catch (error) {
      console.error('Error loading finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudentBalances = async () => {
    try {
      let query = supabase
        .from('students')
        .select(`
          id,
          full_name,
          monthly_fee,
          batches!inner (
            id,
            name,
            centers!inner (
              id,
              name,
              location
            )
          ),
          fee_payments (
            id,
            amount,
            status,
            payment_date
          )
        `)
        .order('full_name')

      if (selectedCenter) {
        query = query.eq('batches.centers.id', selectedCenter.id)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data
      const studentsWithBalances = (data as StudentData[] || []).map(student => {
        const payments = student.fee_payments || []
        const totalPaid = payments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + Number(p.amount), 0)
        const totalOutstanding = payments
          .filter(p => p.status === 'due' || p.status === 'overdue')
          .reduce((sum, p) => sum + Number(p.amount), 0)
        const overdueCount = payments.filter(p => p.status === 'overdue').length

        return {
          id: student.id,
          name: student.full_name,
          batch_name: student.batches?.name || 'Unknown Batch',
          center_location: student.batches?.centers?.location || 'Unknown Location',
          monthly_fee: student.monthly_fee || 0,
          total_paid: totalPaid,
          total_outstanding: totalOutstanding,
          overdue_count: overdueCount
        }
      })

      setStudents(studentsWithBalances)
    } catch (error) {
      console.error('Error loading student balances:', error)
    }
  }

  const loadRecentPayments = async () => {
    try {
      let query = supabase
        .from('fee_payments')
        .select(`
          id,
          amount,
          payment_date,
          payment_mode,
          status,
          receipt_number,
          students!inner (
            id,
            full_name,
            batches!inner (
              id,
              name,
              centers!inner (
                id,
                name,
                location
              )
            )
          )
        `)
        .order('payment_date', { ascending: false })
        .limit(50)

      if (selectedCenter) {
        query = query.eq('students.batches.centers.id', selectedCenter.id)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedPayments = (data as PaymentData[] || []).map(payment => ({
        id: payment.id,
        student_name: payment.students?.full_name || 'Unknown Student',
        amount: Number(payment.amount),
        payment_date: payment.payment_date,
        payment_mode: payment.payment_mode,
        status: payment.status,
        receipt_number: payment.receipt_number,
        batch_name: payment.students?.batches?.name || 'Unknown Batch',
        center_location: payment.students?.batches?.centers?.location || 'Unknown Location'
      }))

      setPayments(formattedPayments)
    } catch (error) {
      console.error('Error loading payments:', error)
    }
  }

  const loadFinanceStats = async () => {
    try {
      let query = supabase
        .from('fee_payments')
        .select(`
          id,
          amount,
          status,
          payment_date,
          students!inner (
            id,
            batches!inner (
              id,
              centers!inner (
                id
              )
            )
          )
        `)

      if (selectedCenter) {
        query = query.eq('students.batches.centers.id', selectedCenter.id)
      }

      const { data: paymentsData, error } = await query

      if (error) throw error

      const payments = paymentsData as PaymentStatsData[] || []
      const paidPayments = payments.filter(p => p.status === 'paid')
      const duePayments = payments.filter(p => p.status === 'due')
      const overduePayments = payments.filter(p => p.status === 'overdue')

      const totalRevenue = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      const outstandingAmount = [...duePayments, ...overduePayments].reduce((sum, p) => sum + Number(p.amount), 0)
      const overdueAmount = overduePayments.reduce((sum, p) => sum + Number(p.amount), 0)

      // Monthly revenue (current month)
      const currentMonth = new Date().toISOString().slice(0, 7)
      const monthlyRevenue = paidPayments
        .filter(p => p.payment_date?.startsWith(currentMonth))
        .reduce((sum, p) => sum + Number(p.amount), 0)

      const totalPayments = payments.length
      const collectionRate = totalPayments > 0 ? Math.round((paidPayments.length / totalPayments) * 100) : 0

      setStats({
        totalRevenue,
        monthlyRevenue,
        outstandingAmount,
        overdueAmount,
        paidCount: paidPayments.length,
        dueCount: duePayments.length,
        overdueCount: overduePayments.length,
        collectionRate
      })
    } catch (error) {
      console.error('Error loading finance stats:', error)
    }
  }

  const handlePaymentRecord = async (studentId: string, amount: number, paymentMode: string) => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        toast({
          title: "Error",
          description: "You must be logged in to record payments",
          variant: "destructive"
        })
        return
      }

      if (!selectedCenter?.id) {
        toast({
          title: "Error",
          description: "Please select a center first",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from('fee_payments')
        .insert([
          {
            student_id: studentId,
            amount,
            payment_date: new Date().toISOString().split('T')[0],
            payment_mode: paymentMode,
            status: 'paid',
            receipt_number: `RCP-${Date.now()}`,
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            center_id: selectedCenter.id,
            created_by: currentUser.id
          }
        ])

      if (error) throw error

      toast({
        title: "Payment Recorded",
        description: `Payment of ₹${amount} recorded successfully`
      })

      setPaymentDialogOpen(false)
      loadFinanceData()
    } catch (error) {
      console.error('Error recording payment:', error)
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      })
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parent_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "outstanding" && student.total_outstanding > 0) ||
                         (statusFilter === "overdue" && student.overdue_count > 0) ||
                         (statusFilter === "paid" && student.total_outstanding === 0)
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (student: Student) => {
    if (student.overdue_count > 0) {
      return <Badge variant="destructive">Overdue</Badge>
    } else if (student.total_outstanding > 0) {
      return <Badge variant="secondary">Due</Badge>
    } else {
      return <Badge variant="default" className="bg-green-500">Paid</Badge>
    }
  }

  const getPaymentModeBadge = (mode: string) => {
    const modeConfig = {
      cash: { label: "Cash", className: "bg-green-100 text-green-800" },
      upi: { label: "UPI", className: "bg-blue-100 text-blue-800" },
      bank_transfer: { label: "Bank Transfer", className: "bg-purple-100 text-purple-800" },
      card: { label: "Card", className: "bg-orange-100 text-orange-800" },
      check: { label: "Check", className: "bg-gray-100 text-gray-800" }
    }
    
    const config = modeConfig[mode as keyof typeof modeConfig] || { label: mode, className: "bg-gray-100 text-gray-800" }
    
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading finance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Finance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time collection</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{stats.outstandingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.dueCount + stats.overdueCount} pending payments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.collectionRate}%</div>
            <Progress value={stats.collectionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{stats.paidCount} of {stats.paidCount + stats.dueCount + stats.overdueCount} payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Finance Management Tabs */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Student Balances</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Fee Management</CardTitle>
                  <CardDescription>Track student payments and outstanding balances</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students or parents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="outstanding">Outstanding</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="paid">Paid Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Monthly Fee</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.parent_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.batch_name}</div>
                            <div className="text-sm text-muted-foreground">{student.center_location}</div>
                          </div>
                        </TableCell>
                        <TableCell>₹{student.monthly_fee?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-green-600">₹{student.total_paid?.toLocaleString() || 0}</TableCell>
                        <TableCell className="text-red-600">₹{student.total_outstanding?.toLocaleString() || 0}</TableCell>
                        <TableCell>{getStatusBadge(student)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student)
                                setPaymentDialogOpen(true)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Pay
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>View all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.student_name}</div>
                            <div className="text-sm text-muted-foreground">{payment.batch_name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">₹{payment.amount.toLocaleString()}</TableCell>
                        <TableCell>{getPaymentModeBadge(payment.payment_mode)}</TableCell>
                        <TableCell className="font-mono text-sm">{payment.receipt_number}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Paid</span>
                    </div>
                    <span className="font-medium">{stats.paidCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Due</span>
                    </div>
                    <span className="font-medium">{stats.dueCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span>Overdue</span>
                    </div>
                    <span className="font-medium">{stats.overdueCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Collected</span>
                    <span className="font-medium text-green-600">₹{stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outstanding</span>
                    <span className="font-medium text-orange-600">₹{stats.outstandingAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overdue</span>
                    <span className="font-medium text-red-600">₹{stats.overdueAmount.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Collection Rate</span>
                      <span className="font-bold">{stats.collectionRate}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Recording Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a new payment for {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                defaultValue={selectedStudent?.monthly_fee || 0}
              />
            </div>
            <div>
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select defaultValue="cash">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const amount = (document.getElementById('amount') as HTMLInputElement)?.value
              const paymentMode = 'cash' // This should come from the select
              if (selectedStudent && amount) {
                handlePaymentRecord(selectedStudent.id, Number(amount), paymentMode)
              }
            }}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 