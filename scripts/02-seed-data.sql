-- Clear existing data (in correct order due to foreign key constraints)
DELETE FROM public.attendance;
DELETE FROM public.fee_payments;
DELETE FROM public.fee_structures;
DELETE FROM public.students;
DELETE FROM public.batches;
DELETE FROM public.centers;
DELETE FROM public.users WHERE role IN ('admin', 'coach');

-- Insert Centers
INSERT INTO public.centers (id, name, location, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Kharadi Center', 'Kharadi, Pune', 'Main training facility in Kharadi'),
  ('22222222-2222-2222-2222-222222222222', 'Hadapsar Center', 'Hadapsar, Pune', 'Training facility in Hadapsar'),
  ('33333333-3333-3333-3333-333333333333', 'Viman Nagar Center', 'Viman Nagar, Pune', 'Training facility in Viman Nagar');

-- Insert Users with proper password hashes (using bcrypt hash for 'password123')
INSERT INTO public.users (id, email, password_hash, full_name, role, center_id) VALUES
  -- Super Admin
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@snigmaypune.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewsB.K5fN4.6k8Jy', 'Admin User', 'super_admin', NULL),
  
  -- Club Manager
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'clubman@snigmaypune.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewsB.K5fN4.6k8Jy', 'Club Manager', 'club_manager', NULL),
  
  -- Head Coach
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'headcoach@snigmaypune.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewsB.K5fN4.6k8Jy', 'Head Coach', 'head_coach', NULL),
  
  -- Coaches (center-specific)
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'coach@kharadi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewsB.K5fN4.6k8Jy', 'Kharadi Coach', 'coach', '11111111-1111-1111-1111-111111111111'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'coach@hadapsar.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewsB.K5fN4.6k8Jy', 'Hadapsar Coach', 'coach', '22222222-2222-2222-2222-222222222222'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'coach@vimannagar.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewsB.K5fN4.6k8Jy', 'Viman Nagar Coach', 'coach', '33333333-3333-3333-3333-333333333333'),
  
  -- Center Managers (center-specific)
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'centerman@kharadi.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewsB.K5fN4.6k8Jy', 'Kharadi Center Manager', 'center_manager', '11111111-1111-1111-1111-111111111111'),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'centerman@hadapsar.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewsB.K5fN4.6k8Jy', 'Hadapsar Center Manager', 'center_manager', '22222222-2222-2222-2222-222222222222'),
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'centerman@vimannagar.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewsB.K5fN4.6k8Jy', 'Viman Nagar Center Manager', 'center_manager', '33333333-3333-3333-3333-333333333333');

-- Insert Batches with time slots
INSERT INTO public.batches (id, name, description, start_time, end_time, coach_id, center_id) VALUES
  -- Kharadi Center Batches
  ('10000001-0000-0000-0000-000000000001', 'U-8 Morning Batch', 'Under 8 years morning training', '08:00', '09:30', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111'),
  ('10000001-0000-0000-0000-000000000002', 'U-10 Morning Batch', 'Under 10 years morning training', '09:45', '11:15', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111'),
  ('10000001-0000-0000-0000-000000000003', 'U-12 Evening Batch', 'Under 12 years evening training', '16:00', '17:30', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111'),
  ('10000001-0000-0000-0000-000000000004', 'U-15 Evening Batch', 'Under 15 years evening training', '17:45', '19:15', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111'),

  -- Hadapsar Center Batches
  ('20000001-0000-0000-0000-000000000001', 'U-8 Morning Batch', 'Under 8 years morning training', '08:00', '09:30', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222'),
  ('20000001-0000-0000-0000-000000000002', 'U-10 Evening Batch', 'Under 10 years evening training', '16:30', '18:00', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222'),
  ('20000001-0000-0000-0000-000000000003', 'U-14 Evening Batch', 'Under 14 years evening training', '18:15', '19:45', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222'),

  -- Viman Nagar Center Batches
  ('30000001-0000-0000-0000-000000000001', 'U-6 Morning Batch', 'Under 6 years morning training', '08:30', '09:30', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333'),
  ('30000001-0000-0000-0000-000000000002', 'U-12 Morning Batch', 'Under 12 years morning training', '09:45', '11:15', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333'),
  ('30000001-0000-0000-0000-000000000003', 'U-16 Evening Batch', 'Under 16 years evening training', '17:00', '18:30', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333');

-- Insert Students
INSERT INTO public.students (id, full_name, age, contact_info, batch_id, center_id, parent_name, parent_phone, parent_email, address) VALUES
  -- Kharadi Center Students
  ('s1000001-0000-0000-0000-000000000001', 'Arjun Sharma', 7, '9876543210', '10000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Rajesh Sharma', '9876543210', 'rajesh.sharma@email.com', 'Kharadi, Pune'),
  ('s1000001-0000-0000-0000-000000000002', 'Priya Patel', 8, '9876543211', '10000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Amit Patel', '9876543211', 'amit.patel@email.com', 'Kharadi, Pune'),
  ('s1000001-0000-0000-0000-000000000003', 'Rohan Kumar', 9, '9876543212', '10000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Suresh Kumar', '9876543212', 'suresh.kumar@email.com', 'Kharadi, Pune'),
  ('s1000001-0000-0000-0000-000000000004', 'Ananya Singh', 10, '9876543213', '10000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Vikram Singh', '9876543213', 'vikram.singh@email.com', 'Kharadi, Pune'),
  ('s1000001-0000-0000-0000-000000000005', 'Karan Joshi', 11, '9876543214', '10000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Mahesh Joshi', '9876543214', 'mahesh.joshi@email.com', 'Kharadi, Pune'),
  ('s1000001-0000-0000-0000-000000000006', 'Ishita Gupta', 12, '9876543215', '10000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Ravi Gupta', '9876543215', 'ravi.gupta@email.com', 'Kharadi, Pune'),
  ('s1000001-0000-0000-0000-000000000007', 'Aarav Mishra', 14, '9876543216', '10000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Deepak Mishra', '9876543216', 'deepak.mishra@email.com', 'Kharadi, Pune'),
  ('s1000001-0000-0000-0000-000000000008', 'Diya Agarwal', 15, '9876543217', '10000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Sanjay Agarwal', '9876543217', 'sanjay.agarwal@email.com', 'Kharadi, Pune'),

  -- Hadapsar Center Students
  ('s2000001-0000-0000-0000-000000000001', 'Vihaan Reddy', 7, '9876543218', '20000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Krishna Reddy', '9876543218', 'krishna.reddy@email.com', 'Hadapsar, Pune'),
  ('s2000001-0000-0000-0000-000000000002', 'Aisha Khan', 8, '9876543219', '20000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Salim Khan', '9876543219', 'salim.khan@email.com', 'Hadapsar, Pune'),
  ('s2000001-0000-0000-0000-000000000003', 'Advait Desai', 9, '9876543220', '20000001-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Prakash Desai', '9876543220', 'prakash.desai@email.com', 'Hadapsar, Pune'),
  ('s2000001-0000-0000-0000-000000000004', 'Myra Jain', 10, '9876543221', '20000001-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Rohit Jain', '9876543221', 'rohit.jain@email.com', 'Hadapsar, Pune'),
  ('s2000001-0000-0000-0000-000000000005', 'Aryan Verma', 13, '9876543222', '20000001-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Ashok Verma', '9876543222', 'ashok.verma@email.com', 'Hadapsar, Pune'),
  ('s2000001-0000-0000-0000-000000000006', 'Kavya Nair', 14, '9876543223', '20000001-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Mohan Nair', '9876543223', 'mohan.nair@email.com', 'Hadapsar, Pune'),

  -- Viman Nagar Center Students
  ('s3000001-0000-0000-0000-000000000001', 'Reyansh Iyer', 5, '9876543224', '30000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Venkat Iyer', '9876543224', 'venkat.iyer@email.com', 'Viman Nagar, Pune'),
  ('s3000001-0000-0000-0000-000000000002', 'Saanvi Rao', 6, '9876543225', '30000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Ramesh Rao', '9876543225', 'ramesh.rao@email.com', 'Viman Nagar, Pune'),
  ('s3000001-0000-0000-0000-000000000003', 'Atharv Kulkarni', 11, '9876543226', '30000001-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'Ganesh Kulkarni', '9876543226', 'ganesh.kulkarni@email.com', 'Viman Nagar, Pune'),
  ('s3000001-0000-0000-0000-000000000004', 'Aadhya Bhatt', 12, '9876543227', '30000001-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'Kiran Bhatt', '9876543227', 'kiran.bhatt@email.com', 'Viman Nagar, Pune'),
  ('s3000001-0000-0000-0000-000000000005', 'Kabir Saxena', 15, '9876543228', '30000001-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Nikhil Saxena', '9876543228', 'nikhil.saxena@email.com', 'Viman Nagar, Pune'),
  ('s3000001-0000-0000-0000-000000000006', 'Zara Sheikh', 16, '9876543229', '30000001-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Farhan Sheikh', '9876543229', 'farhan.sheikh@email.com', 'Viman Nagar, Pune');

-- Insert Fee Structures
INSERT INTO public.fee_structures (id, batch_id, center_id, amount, frequency, description) VALUES
  -- Kharadi Center Fee Structures
  ('f1000001-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 2000.00, 'monthly', 'U-8 Monthly Training Fee'),
  ('f1000001-0000-0000-0000-000000000002', '10000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 2200.00, 'monthly', 'U-10 Monthly Training Fee'),
  ('f1000001-0000-0000-0000-000000000003', '10000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 2500.00, 'monthly', 'U-12 Monthly Training Fee'),
  ('f1000001-0000-0000-0000-000000000004', '10000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 2800.00, 'monthly', 'U-15 Monthly Training Fee'),

  -- Hadapsar Center Fee Structures
  ('f2000001-0000-0000-0000-000000000001', '20000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 1800.00, 'monthly', 'U-8 Monthly Training Fee'),
  ('f2000001-0000-0000-0000-000000000002', '20000001-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 2200.00, 'monthly', 'U-10 Monthly Training Fee'),
  ('f2000001-0000-0000-0000-000000000003', '20000001-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 2600.00, 'monthly', 'U-14 Monthly Training Fee'),

  -- Viman Nagar Center Fee Structures
  ('f3000001-0000-0000-0000-000000000001', '30000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 1500.00, 'monthly', 'U-6 Monthly Training Fee'),
  ('f3000001-0000-0000-0000-000000000002', '30000001-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 2400.00, 'monthly', 'U-12 Monthly Training Fee'),
  ('f3000001-0000-0000-0000-000000000003', '30000001-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 3000.00, 'monthly', 'U-16 Monthly Training Fee');
