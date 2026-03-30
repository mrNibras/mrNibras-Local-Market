import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface Service {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  averageRating: number;
  totalReviews: number;
  provider: {
    _id: string;
    name: string;
    email: string;
  };
  location: {
    type: string;
    coordinates: number[];
  };
  isActive: boolean;
  id?: string;
  category_name?: string;
  provider_name?: string;
  avg_rating?: number;
  review_count?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export function useServices(category?: string, query?: string) {
  return useQuery({
    queryKey: ["services", category, query],
    queryFn: async () => {
      try {
        let url = `${API_URL}/services`;
        const params = new URLSearchParams();
        
        if (category) params.append('category', category);
        if (query) params.append('search', query);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        console.log("Fetching services from:", url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Failed to fetch services' }));
          throw new Error(error.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Services response:", data);
        
        // Map backend fields to frontend fields
        return (data.data || []).map((service: any) => ({
          ...service,
          id: service._id,
          category_name: service.category,
          provider_name: service.provider?.name || 'Unknown Provider',
          avg_rating: service.averageRating || 0,
          review_count: service.totalReviews || 0
        }));
      } catch (error) {
        console.error("Error in useServices:", error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/services/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch service');
      }
      
      const data = await response.json();
      const service = data.data;
      
      // Map backend fields to frontend fields
      return {
        ...service,
        id: service._id,
        category_name: service.category,
        provider_name: service.provider?.name || 'Unknown Provider',
        avg_rating: service.averageRating || 0,
        review_count: service.totalReviews || 0
      };
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/services/categories`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch categories');
      }
      
      const data = await response.json();
      
      // Transform backend categories to frontend format
      const categoryIcons: Record<string, string> = {
        plumbing: 'Wrench',
        electrical: 'Zap',
        cleaning: 'Sparkles',
        tutoring: 'Book',
        painting: 'Paintbrush',
        carpentry: 'Hammer',
        gardening: 'Flower',
        moving: 'Truck'
      };
      
      const categoryColors: Record<string, string> = {
        plumbing: '#3b82f6',
        electrical: '#f59e0b',
        cleaning: '#10b981',
        tutoring: '#8b5cf6',
        painting: '#ef4444',
        carpentry: '#06b6d4',
        gardening: '#22c55e',
        moving: '#f97316'
      };
      
      return data.data.map((cat: any, index: number) => ({
        id: cat._id || index.toString(),
        name: cat._id,
        icon: categoryIcons[cat._id] || 'Wrench',
        color: categoryColors[cat._id] || '#3b82f6',
        count: cat.count
      }));
    },
  });
}

export function useReviews(serviceId: string) {
  return useQuery({
    queryKey: ["reviews", serviceId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/reviews/service/${serviceId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch reviews');
      }
      
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!serviceId,
  });
}
