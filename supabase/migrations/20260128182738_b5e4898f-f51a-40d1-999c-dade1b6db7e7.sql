-- Create categories enum for femtech areas
CREATE TYPE public.femtech_category AS ENUM (
  'fertility',
  'pregnancy',
  'postpartum',
  'menstrual_health',
  'menopause',
  'sexual_health',
  'mental_health',
  'general_wellness',
  'chronic_conditions',
  'diagnostics',
  'telehealth',
  'other'
);

-- Create femtech companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mission TEXT,
  problem TEXT,
  solution TEXT,
  category femtech_category NOT NULL DEFAULT 'other',
  website_url TEXT,
  logo_url TEXT,
  founded_year INTEGER,
  headquarters TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Public read access - anyone can view companies
CREATE POLICY "Anyone can view companies"
  ON public.companies
  FOR SELECT
  USING (true);

-- Create index for faster search
CREATE INDEX idx_companies_name ON public.companies USING gin(to_tsvector('english', name));
CREATE INDEX idx_companies_category ON public.companies(category);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some seed data
INSERT INTO public.companies (name, mission, problem, solution, category, website_url, founded_year, headquarters)
VALUES
  ('Clue', 'Help people understand their bodies through data', 'Lack of menstrual health awareness and tracking', 'AI-powered period and fertility tracking app with personalized insights', 'menstrual_health', 'https://helloclue.com', 2012, 'Berlin, Germany'),
  ('Maven Clinic', 'Improving healthcare outcomes for women and families', 'Fragmented and inadequate maternal healthcare', 'Virtual clinic providing comprehensive reproductive and family health services', 'pregnancy', 'https://mavenclinic.com', 2014, 'New York, USA'),
  ('Elvie', 'Revolutionize womens health with smart technology', 'Outdated and uncomfortable breast pumps and pelvic floor trainers', 'Award-winning smart breast pumps and Kegel trainers', 'postpartum', 'https://elvie.com', 2013, 'London, UK'),
  ('Nurx', 'Making healthcare accessible and judgment-free', 'Barriers to accessing birth control and STI testing', 'Telehealth platform for birth control, emergency contraception, and STI testing', 'sexual_health', 'https://nurx.com', 2015, 'San Francisco, USA'),
  ('Gennev', 'Transforming the menopause experience', 'Lack of menopause-focused healthcare and support', 'Comprehensive menopause telehealth platform with OB-GYNs and health coaching', 'menopause', 'https://gennev.com', 2016, 'Seattle, USA'),
  ('Kindbody', 'Making fertility care accessible to all', 'High cost and limited access to fertility treatments', 'Full-service fertility clinics with transparent pricing and employer benefits', 'fertility', 'https://kindbody.com', 2018, 'New York, USA'),
  ('Tia', 'Building a new standard for womens healthcare', 'Disconnected and impersonal womens health experiences', 'Holistic womens health clinics combining gynecology, primary care, and mental health', 'general_wellness', 'https://asktia.com', 2017, 'New York, USA'),
  ('Carrot Fertility', 'Making fertility care inclusive and accessible', 'Lack of employer-sponsored fertility benefits', 'Global fertility benefits platform for employers covering IVF, adoption, and more', 'fertility', 'https://get-carrot.com', 2016, 'San Francisco, USA'),
  ('Bloomlife', 'Bringing peace of mind to pregnancy', 'Anxiety and uncertainty during pregnancy monitoring', 'Smart wearable for tracking contractions and baby kicks during pregnancy', 'pregnancy', 'https://bloomlife.com', 2014, 'San Francisco, USA'),
  ('Willow', 'Giving moms true freedom', 'Breast pumping that restricts mobility and lifestyle', 'Wearable, hands-free breast pump that fits in a bra', 'postpartum', 'https://willowpump.com', 2014, 'San Jose, USA'),
  ('Ava', 'Helping women understand their fertility', 'Difficulty tracking fertile windows accurately', 'Wearable fertility bracelet with clinical-grade accuracy', 'fertility', 'https://avawomen.com', 2014, 'Zurich, Switzerland'),
  ('Hologic', 'Enabling healthier lives through diagnostics', 'Late detection of breast cancer and cervical cancer', 'Advanced diagnostic imaging and screening technologies', 'diagnostics', 'https://hologic.com', 1985, 'Massachusetts, USA');
