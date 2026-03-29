
-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin')),
  location TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'Wrench',
  color TEXT NOT NULL DEFAULT 'hsl(24, 80%, 50%)',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT USING (true);

INSERT INTO public.categories (name, icon, color) VALUES
  ('Plumbing', 'Wrench', 'hsl(24, 80%, 50%)'),
  ('Electrical', 'Zap', 'hsl(45, 90%, 55%)'),
  ('Tutoring', 'BookOpen', 'hsl(200, 70%, 50%)'),
  ('Cleaning', 'Sparkles', 'hsl(160, 60%, 45%)'),
  ('Painting', 'Paintbrush', 'hsl(340, 65%, 55%)'),
  ('Tech & Dev', 'Code', 'hsl(260, 60%, 55%)'),
  ('Moving', 'Truck', 'hsl(30, 70%, 50%)'),
  ('Catering', 'UtensilsCrossed', 'hsl(10, 70%, 50%)');

-- Services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_id UUID NOT NULL REFERENCES public.categories(id),
  price NUMERIC NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active services are viewable by everyone"
  ON public.services FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can insert their own services"
  ON public.services FOR INSERT
  WITH CHECK (provider_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Providers can update their own services"
  ON public.services FOR UPDATE
  USING (provider_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Providers can delete their own services"
  ON public.services FOR DELETE
  USING (provider_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_services_category ON public.services(category_id);
CREATE INDEX idx_services_provider ON public.services(provider_id);
CREATE INDEX idx_services_location ON public.services(location);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking participants can view"
  ON public.bookings FOR SELECT
  USING (customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR provider_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Booking participants can update"
  ON public.bookings FOR UPDATE
  USING (customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR provider_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE INDEX idx_reviews_service ON public.reviews(service_id);

-- Create a view for services with aggregated rating
CREATE OR REPLACE VIEW public.services_with_rating AS
SELECT
  s.*,
  c.name as category_name,
  c.icon as category_icon,
  c.color as category_color,
  p.full_name as provider_name,
  p.avatar_url as provider_avatar,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(r.id) as review_count
FROM public.services s
JOIN public.categories c ON s.category_id = c.id
JOIN public.profiles p ON s.provider_id = p.id
LEFT JOIN public.reviews r ON r.service_id = s.id
WHERE s.is_active = true
GROUP BY s.id, c.name, c.icon, c.color, p.full_name, p.avatar_url;
