
DROP VIEW IF EXISTS public.services_with_rating;

CREATE OR REPLACE VIEW public.services_with_rating
WITH (security_invoker=on) AS
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
