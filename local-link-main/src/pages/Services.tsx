import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { useServices, useCategories } from "@/hooks/use-services";

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Debounce the search query to prevent focus loss and excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      // Update URL parameters
      const newParams = new URLSearchParams(searchParams);
      if (query) newParams.set("q", query);
      else newParams.delete("q");
      setSearchParams(newParams, { replace: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [query, setSearchParams, searchParams]);

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    const newCategory = category === selectedCategory ? "" : category;
    setSelectedCategory(newCategory);
    const newParams = new URLSearchParams(searchParams);
    if (newCategory) newParams.set("category", newCategory);
    else newParams.delete("category");
    setSearchParams(newParams);
  };

  const { data: services, isLoading, error } = useServices(
    selectedCategory || undefined,
    debouncedQuery || undefined
  );
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Show full-page loader only for the initial category load
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error("Error loading services:", error);
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 text-center">
          <p className="text-xl font-semibold text-destructive mb-2">Error loading services</p>
          <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            {selectedCategory || "All Services"}
          </h1>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search services..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button variant="outline" className="h-12 gap-2 rounded-xl">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => handleCategoryChange("")}
              className={`px-4 py-2 text-sm rounded-full border transition-colors ${!selectedCategory ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
            >
              All
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.name)}
                className={`px-4 py-2 text-sm rounded-full border transition-colors ${selectedCategory === cat.name ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {error ? (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-destructive mb-2">Error loading services</p>
              <p className="text-muted-foreground">{(error as Error).message}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">Reload Page</Button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-foreground mb-2">No services found</p>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServicesPage;
