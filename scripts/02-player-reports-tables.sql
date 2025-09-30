-- Player Reports Tables
-- This script creates tables for storing player performance reports and KPIs

-- Create KPIs table for customizable Key Performance Indicators
CREATE TABLE IF NOT EXISTS public.kpis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_value DECIMAL(5,2) DEFAULT 0,
    max_value DECIMAL(5,2) DEFAULT 10,
    unit VARCHAR(20) DEFAULT 'points',
    category VARCHAR(20) CHECK (category IN ('technical', 'physical', 'mental', 'tactical')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    center_id UUID REFERENCES public.centers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create player reports table
CREATE TABLE IF NOT EXISTS public.player_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.users(id),
    batch_id UUID REFERENCES public.batches(id),
    center_id UUID REFERENCES public.centers(id),
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    overall_rating DECIMAL(3,1) CHECK (overall_rating >= 0 AND overall_rating <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one report per player per date per coach
    UNIQUE(player_id, coach_id, report_date)
);

-- Create KPI scores table to store individual KPI evaluations
CREATE TABLE IF NOT EXISTS public.kpi_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES public.player_reports(id) ON DELETE CASCADE,
    kpi_id UUID NOT NULL REFERENCES public.kpis(id),
    score DECIMAL(5,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one score per KPI per report
    UNIQUE(report_id, kpi_id)
);

-- Insert default KPIs
INSERT INTO public.kpis (name, description, min_value, max_value, unit, category, is_active) VALUES
('Ball Control', 'Ability to control and manipulate the ball', 0, 10, 'points', 'technical', true),
('Passing Accuracy', 'Precision in passing the ball to teammates', 0, 10, 'points', 'technical', true),
('Shooting', 'Goal scoring ability and shot accuracy', 0, 10, 'points', 'technical', true),
('Dribbling', 'Ability to move with the ball past opponents', 0, 10, 'points', 'technical', true),
('Speed', 'Running speed and acceleration', 0, 10, 'points', 'physical', true),
('Endurance', 'Stamina and fitness levels', 0, 10, 'points', 'physical', true),
('Strength', 'Physical strength and power', 0, 10, 'points', 'physical', true),
('Agility', 'Quickness and ability to change direction', 0, 10, 'points', 'physical', true),
('Teamwork', 'Ability to work well with teammates', 0, 10, 'points', 'mental', true),
('Focus', 'Concentration and attention during training', 0, 10, 'points', 'mental', true),
('Confidence', 'Self-assurance and belief in abilities', 0, 10, 'points', 'mental', true),
('Attitude', 'Positive attitude and coachability', 0, 10, 'points', 'mental', true),
('Positioning', 'Understanding of field positions and movement', 0, 10, 'points', 'tactical', true),
('Decision Making', 'Quick thinking and smart choices on field', 0, 10, 'points', 'tactical', true),
('Game Awareness', 'Understanding of game situations and tactics', 0, 10, 'points', 'tactical', true),
('Communication', 'Ability to communicate effectively with teammates', 0, 10, 'points', 'tactical', true)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_player_reports_player_id ON public.player_reports(player_id);
CREATE INDEX IF NOT EXISTS idx_player_reports_coach_id ON public.player_reports(coach_id);
CREATE INDEX IF NOT EXISTS idx_player_reports_date ON public.player_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_player_reports_center_id ON public.player_reports(center_id);
CREATE INDEX IF NOT EXISTS idx_kpi_scores_report_id ON public.kpi_scores(report_id);
CREATE INDEX IF NOT EXISTS idx_kpi_scores_kpi_id ON public.kpi_scores(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kpis_category ON public.kpis(category);
CREATE INDEX IF NOT EXISTS idx_kpis_active ON public.kpis(is_active);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_kpis_updated_at BEFORE UPDATE ON public.kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_player_reports_updated_at BEFORE UPDATE ON public.player_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (disable RLS for development)
ALTER TABLE public.kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_scores DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.kpis TO anon, authenticated;
GRANT ALL ON public.player_reports TO anon, authenticated;
GRANT ALL ON public.kpi_scores TO anon, authenticated;
