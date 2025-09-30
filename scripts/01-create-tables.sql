-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'club_manager', 'head_coach', 'coach', 'center_manager');
CREATE TYPE attendance_status AS ENUM ('present', 'absent');
CREATE TYPE payment_mode AS ENUM ('cash', 'upi', 'bank_transfer', 'check');
CREATE TYPE payment_status AS ENUM ('paid', 'due', 'overdue');
CREATE TYPE fee_frequency AS ENUM ('monthly', 'quarterly', 'annually');

-- Centers table (create first as it's referenced by users)
CREATE TABLE public.centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (custom table, not extending auth.users)
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'coach',
  center_id UUID REFERENCES public.centers(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batches table
CREATE TABLE public.batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  coach_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  contact_info TEXT,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  address TEXT,
  emergency_contact TEXT,
  medical_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fee structures table
CREATE TABLE public.fee_structures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  frequency fee_frequency NOT NULL DEFAULT 'monthly',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fee payments table
CREATE TABLE public.fee_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_mode payment_mode NOT NULL DEFAULT 'cash',
  receipt_number TEXT,
  status payment_status NOT NULL DEFAULT 'due',
  due_date DATE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table
CREATE TABLE public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  marked_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin' OR role = 'club_manager'
    )
  );

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin' OR role = 'club_manager'
    )
  );

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin' OR role = 'club_manager'
    )
  );

-- RLS Policies for centers table
CREATE POLICY "Anyone can view centers" ON public.centers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage centers" ON public.centers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin' OR role = 'club_manager'
    )
  );

-- RLS Policies for batches table
CREATE POLICY "Admins can manage all batches" ON public.batches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin' OR role = 'club_manager'
    )
  );

CREATE POLICY "Coaches can view their assigned batches" ON public.batches
  FOR SELECT USING (coach_id = auth.uid());

-- RLS Policies for students table
CREATE POLICY "Admins can manage all students" ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin' OR role = 'club_manager'
    )
  );

CREATE POLICY "Coaches can view students in their batches" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.batches 
      WHERE id = batch_id AND coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can add students to their batches" ON public.students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.batches 
      WHERE id = batch_id AND coach_id = auth.uid()
    )
  );

-- RLS Policies for fee_structures table
CREATE POLICY "Admins can manage all fee structures" ON public.fee_structures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin' OR role = 'club_manager'
    )
  );

CREATE POLICY "Coaches can view fee structures for their batches" ON public.fee_structures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.batches 
      WHERE id = batch_id AND coach_id = auth.uid()
    )
  );

-- RLS Policies for fee_payments table
CREATE POLICY "Admins can manage all fee payments" ON public.fee_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin' OR role = 'club_manager'
    )
  );

CREATE POLICY "Coaches can view fee payments for their students" ON public.fee_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.batches b ON s.batch_id = b.id
      WHERE s.id = student_id AND b.coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can insert fee payments for their students" ON public.fee_payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.batches b ON s.batch_id = b.id
      WHERE s.id = student_id AND b.coach_id = auth.uid()
    ) AND created_by = auth.uid()
  );

-- RLS Policies for attendance table
CREATE POLICY "Admins can view all attendance" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin' OR role = 'club_manager'
    )
  );

CREATE POLICY "Coaches can view attendance for their batches" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.batches 
      WHERE id = batch_id AND coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can mark attendance for their batches" ON public.attendance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.batches 
      WHERE id = batch_id AND coach_id = auth.uid()
    ) AND marked_by = auth.uid()
  );

CREATE POLICY "Coaches can update attendance for their batches" ON public.attendance
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.batches 
      WHERE id = batch_id AND coach_id = auth.uid()
    ) AND marked_by = auth.uid()
  );

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_center_id ON public.users(center_id);
CREATE INDEX idx_batches_coach_id ON public.batches(coach_id);
CREATE INDEX idx_batches_center_id ON public.batches(center_id);
CREATE INDEX idx_students_batch_id ON public.students(batch_id);
CREATE INDEX idx_students_center_id ON public.students(center_id);
CREATE INDEX idx_fee_structures_batch_id ON public.fee_structures(batch_id);
CREATE INDEX idx_fee_structures_center_id ON public.fee_structures(center_id);
CREATE INDEX idx_fee_payments_student_id ON public.fee_payments(student_id);
CREATE INDEX idx_fee_payments_center_id ON public.fee_payments(center_id);
CREATE INDEX idx_fee_payments_status ON public.fee_payments(status);
CREATE INDEX idx_fee_payments_payment_date ON public.fee_payments(payment_date);
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_attendance_batch_date ON public.attendance(batch_id, date);
CREATE INDEX idx_attendance_center_id ON public.attendance(center_id);

-- Create views for better data access
CREATE VIEW public.student_outstanding_balances AS
SELECT 
  s.id as student_id,
  s.full_name,
  b.name as batch_name,
  c.location as center_location,
  c.id as center_id,
  COALESCE(fs.amount, 0) as monthly_fee,
  COALESCE(paid.total_paid, 0) as total_paid,
  COALESCE(pending.total_outstanding, 0) as total_outstanding,
  COALESCE(overdue.overdue_count, 0) as overdue_count,
  s.parent_name,
  s.parent_phone
FROM public.students s
LEFT JOIN public.batches b ON s.batch_id = b.id
LEFT JOIN public.centers c ON s.center_id = c.id
LEFT JOIN public.fee_structures fs ON b.id = fs.batch_id
LEFT JOIN (
  SELECT 
    student_id,
    SUM(amount) as total_paid
  FROM public.fee_payments 
  WHERE status = 'paid'
  GROUP BY student_id
) paid ON s.id = paid.student_id
LEFT JOIN (
  SELECT 
    student_id,
    SUM(amount) as total_outstanding
  FROM public.fee_payments 
  WHERE status IN ('due', 'overdue')
  GROUP BY student_id
) pending ON s.id = pending.student_id
LEFT JOIN (
  SELECT 
    student_id,
    COUNT(*) as overdue_count
  FROM public.fee_payments 
  WHERE status = 'overdue'
  GROUP BY student_id
) overdue ON s.id = overdue.student_id;
