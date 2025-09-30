-- Insert demo attendance records for the past 3 weeks
-- This creates realistic attendance patterns with some students occasionally absent

-- Week 1 (3 weeks ago) - Monday 2024-01-08
INSERT INTO public.attendance (student_id, batch_id, date, status, marked_by) VALUES
  -- Under 8 Beginners (Monday)
  ('s0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-08', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-08', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-08', 'absent', '22222222-2222-2222-2222-222222222222'),
  ('s0000004-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-08', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000005-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-08', 'present', '22222222-2222-2222-2222-222222222222'),

-- Week 1 - Tuesday 2024-01-09
  -- Under 10 Development
  ('s0000006-0000-0000-0000-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-09', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000007-0000-0000-0000-000000000007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-09', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000008-0000-0000-0000-000000000008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-09', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000009-0000-0000-0000-000000000009', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-09', 'absent', '33333333-3333-3333-3333-333333333333'),
  ('s0000010-0000-0000-0000-000000000010', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-09', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000011-0000-0000-0000-000000000011', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-09', 'present', '33333333-3333-3333-3333-333333333333'),

-- Week 1 - Wednesday 2024-01-10
  -- Under 12 Competitive
  ('s0000012-0000-0000-0000-000000000012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-10', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000013-0000-0000-0000-000000000013', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-10', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000014-0000-0000-0000-000000000014', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-10', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000015-0000-0000-0000-000000000015', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-10', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000016-0000-0000-0000-000000000016', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-10', 'absent', '22222222-2222-2222-2222-222222222222'),
  ('s0000017-0000-0000-0000-000000000017', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-10', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000018-0000-0000-0000-000000000018', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-10', 'present', '22222222-2222-2222-2222-222222222222'),

-- Week 1 - Thursday 2024-01-11
  -- Under 15 Elite
  ('s0000019-0000-0000-0000-000000000019', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-11', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000020-0000-0000-0000-000000000020', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-11', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000021-0000-0000-0000-000000000021', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-11', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000022-0000-0000-0000-000000000022', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-11', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000023-0000-0000-0000-000000000023', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-11', 'absent', '44444444-4444-4444-4444-444444444444'),
  ('s0000024-0000-0000-0000-000000000024', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-11', 'present', '44444444-4444-4444-4444-444444444444'),

-- Week 1 - Friday 2024-01-12
  -- Girls Under 12
  ('s0000030-0000-0000-0000-000000000030', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-01-12', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000031-0000-0000-0000-000000000031', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-01-12', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000032-0000-0000-0000-000000000032', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-01-12', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000033-0000-0000-0000-000000000033', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-01-12', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000034-0000-0000-0000-000000000034', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-01-12', 'absent', '33333333-3333-3333-3333-333333333333'),

-- Week 2 (2 weeks ago) - Monday 2024-01-15
  -- Under 8 Beginners
  ('s0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-15', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-15', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-15', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000004-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-15', 'absent', '22222222-2222-2222-2222-222222222222'),
  ('s0000005-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-15', 'present', '22222222-2222-2222-2222-222222222222'),

-- Week 2 - Tuesday 2024-01-16
  -- Under 10 Development
  ('s0000006-0000-0000-0000-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-16', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000007-0000-0000-0000-000000000007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-16', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000008-0000-0000-0000-000000000008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-16', 'absent', '33333333-3333-3333-3333-333333333333'),
  ('s0000009-0000-0000-0000-000000000009', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-16', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000010-0000-0000-0000-000000000010', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-16', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000011-0000-0000-0000-000000000011', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-16', 'present', '33333333-3333-3333-3333-333333333333'),

-- Week 2 - Wednesday 2024-01-17
  -- Under 12 Competitive
  ('s0000012-0000-0000-0000-000000000012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-17', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000013-0000-0000-0000-000000000013', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-17', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000014-0000-0000-0000-000000000014', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-17', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000015-0000-0000-0000-000000000015', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-17', 'absent', '22222222-2222-2222-2222-222222222222'),
  ('s0000016-0000-0000-0000-000000000016', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-17', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000017-0000-0000-0000-000000000017', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-17', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000018-0000-0000-0000-000000000018', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-17', 'present', '22222222-2222-2222-2222-222222222222'),

-- Week 2 - Thursday 2024-01-18
  -- Under 15 Elite
  ('s0000019-0000-0000-0000-000000000019', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-18', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000020-0000-0000-0000-000000000020', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-18', 'absent', '44444444-4444-4444-4444-444444444444'),
  ('s0000021-0000-0000-0000-000000000021', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-18', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000022-0000-0000-0000-000000000022', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-18', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000023-0000-0000-0000-000000000023', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-18', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000024-0000-0000-0000-000000000024', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-18', 'present', '44444444-4444-4444-4444-444444444444'),

-- Week 2 - Friday 2024-01-19
  -- Under 18 Academy
  ('s0000025-0000-0000-0000-000000000025', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2024-01-19', 'present', '55555555-5555-5555-5555-555555555555'),
  ('s0000026-0000-0000-0000-000000000026', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2024-01-19', 'present', '55555555-5555-5555-5555-555555555555'),
  ('s0000027-0000-0000-0000-000000000027', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2024-01-19', 'present', '55555555-5555-5555-5555-555555555555'),
  ('s0000028-0000-0000-0000-000000000028', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2024-01-19', 'absent', '55555555-5555-5555-5555-555555555555'),
  ('s0000029-0000-0000-0000-000000000029', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2024-01-19', 'present', '55555555-5555-5555-5555-555555555555'),

-- Week 3 (last week) - Monday 2024-01-22
  -- Under 8 Beginners
  ('s0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-22', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-22', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-22', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000004-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-22', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000005-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-22', 'absent', '22222222-2222-2222-2222-222222222222'),

-- Week 3 - Tuesday 2024-01-23
  -- Under 10 Development
  ('s0000006-0000-0000-0000-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-23', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000007-0000-0000-0000-000000000007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-23', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000008-0000-0000-0000-000000000008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-23', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000009-0000-0000-0000-000000000009', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-23', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000010-0000-0000-0000-000000000010', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-23', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000011-0000-0000-0000-000000000011', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-23', 'absent', '33333333-3333-3333-3333-333333333333'),

-- Week 3 - Wednesday 2024-01-24
  -- Under 12 Competitive
  ('s0000012-0000-0000-0000-000000000012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-24', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000013-0000-0000-0000-000000000013', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-24', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000014-0000-0000-0000-000000000014', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-24', 'absent', '22222222-2222-2222-2222-222222222222'),
  ('s0000015-0000-0000-0000-000000000015', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-24', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000016-0000-0000-0000-000000000016', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-24', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000017-0000-0000-0000-000000000017', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-24', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000018-0000-0000-0000-000000000018', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-01-24', 'present', '22222222-2222-2222-2222-222222222222'),

-- Week 3 - Thursday 2024-01-25
  -- Under 15 Elite
  ('s0000019-0000-0000-0000-000000000019', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-25', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000020-0000-0000-0000-000000000020', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-25', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000021-0000-0000-0000-000000000021', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-25', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000022-0000-0000-0000-000000000022', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-25', 'absent', '44444444-4444-4444-4444-444444444444'),
  ('s0000023-0000-0000-0000-000000000023', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-25', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000024-0000-0000-0000-000000000024', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-01-25', 'present', '44444444-4444-4444-4444-444444444444'),

-- Week 3 - Friday 2024-01-26
  -- Girls Under 12
  ('s0000030-0000-0000-0000-000000000030', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-01-26', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000031-0000-0000-0000-000000000031', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-01-26', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000032-0000-0000-0000-000000000032', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-01-26', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000033-0000-0000-0000-000000000033', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-01-26', 'absent', '33333333-3333-3333-3333-333333333333'),
  ('s0000034-0000-0000-0000-000000000034', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-01-26', 'present', '33333333-3333-3333-3333-333333333333'),

-- Week 3 - Saturday 2024-01-27
  -- Adult Recreational
  ('s0000035-0000-0000-0000-000000000035', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '2024-01-27', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000036-0000-0000-0000-000000000036', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '2024-01-27', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000037-0000-0000-0000-000000000037', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '2024-01-27', 'absent', '44444444-4444-4444-4444-444444444444'),
  ('s0000038-0000-0000-0000-000000000038', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '2024-01-27', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000039-0000-0000-0000-000000000039', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '2024-01-27', 'present', '44444444-4444-4444-4444-444444444444'),
  ('s0000040-0000-0000-0000-000000000040', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '2024-01-27', 'absent', '44444444-4444-4444-4444-444444444444');

-- Add some recent attendance for this week (current week)
-- Monday 2024-01-29
INSERT INTO public.attendance (student_id, batch_id, date, status, marked_by) VALUES
  -- Under 8 Beginners
  ('s0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-29', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-29', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-29', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000004-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-29', 'present', '22222222-2222-2222-2222-222222222222'),
  ('s0000005-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-29', 'present', '22222222-2222-2222-2222-222222222222');

-- Tuesday 2024-01-30 (today's date for testing)
INSERT INTO public.attendance (student_id, batch_id, date, status, marked_by) VALUES
  -- Under 10 Development
  ('s0000006-0000-0000-0000-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-30', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000007-0000-0000-0000-000000000007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-30', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000008-0000-0000-0000-000000000008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-30', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000009-0000-0000-0000-000000000009', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-30', 'absent', '33333333-3333-3333-3333-333333333333'),
  ('s0000010-0000-0000-0000-000000000010', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-30', 'present', '33333333-3333-3333-3333-333333333333'),
  ('s0000011-0000-0000-0000-000000000011', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-30', 'present', '33333333-3333-3333-3333-333333333333');
