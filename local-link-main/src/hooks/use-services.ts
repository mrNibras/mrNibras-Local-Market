import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceWithRating {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  is_active: boolean;
  category_name: string;
  category_icon: string;
  category_color: string;
  provider_name: string;
  provider_avatar: string | null;
  avg_rating: number;
  review_count: number;
  provider_id: string;
  category_id: string;
  created_at: string;
}

export function useServices(category?: string, query?: string) {
  return useQuery({
    queryKey: ["services", category, query],
    queryFn: async () => {
      let q = supabase.from("services_with_rating").select("*");

      if (category) {
        q = q.eq("category_name", category);
      }
      if (query) {
        q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      const { data, error } = await q.order("avg_rating", { ascending: false });
      if (error) throw error;
      return data as ServiceWithRating[];
    },
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services_with_rating")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as ServiceWithRating;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useReviews(serviceId: string) {
  return useQuery({
    queryKey: ["reviews", serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profiles:user_id(full_name, avatar_url)")
        .eq("service_id", serviceId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });
}
