-- Add photo columns to existing tables
-- This migration adds photo storage capability to students, users (coaches), and centers

-- Add photo column to students table
ALTER TABLE students 
ADD COLUMN photo TEXT;

-- Add photo column to users table (for coaches and staff)
ALTER TABLE users 
ADD COLUMN photo TEXT;

-- Add photo column to centers table
ALTER TABLE centers 
ADD COLUMN photo TEXT;

-- Create feedback tables for player and coach feedback
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('player', 'coach')),
    subject_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    category VARCHAR(50) NOT NULL,
    feedback_text TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    submitted_by UUID REFERENCES users(id),
    admin_response TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_subject_id ON feedback(subject_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_submitted_by ON feedback(submitted_by);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

-- Add comments for documentation
COMMENT ON TABLE feedback IS 'Stores feedback about players and coaches';
COMMENT ON COLUMN feedback.type IS 'Type of feedback: player or coach';
COMMENT ON COLUMN feedback.subject_id IS 'ID of the player or coach being reviewed';
COMMENT ON COLUMN feedback.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN feedback.category IS 'Category of feedback (Performance, Behavior, etc.)';
COMMENT ON COLUMN feedback.feedback_text IS 'The actual feedback content';
COMMENT ON COLUMN feedback.is_anonymous IS 'Whether the feedback was submitted anonymously';
COMMENT ON COLUMN feedback.submitted_by IS 'User who submitted the feedback (null if anonymous)';
COMMENT ON COLUMN feedback.admin_response IS 'Response from super admin';
COMMENT ON COLUMN feedback.status IS 'Current status: pending, reviewed, or resolved';

-- Add photo column comments
COMMENT ON COLUMN students.photo IS 'Base64 encoded photo or URL to photo storage';
COMMENT ON COLUMN users.photo IS 'Base64 encoded photo or URL to photo storage';
COMMENT ON COLUMN centers.photo IS 'Base64 encoded photo or URL to photo storage';
