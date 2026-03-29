import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/services?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-secondary/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-secondary/60" />
      </div>

      <div className="container relative z-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/25 mb-6">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Addis Ababa, Ethiopia</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-secondary-foreground leading-[1.1] mb-6">
            Find trusted{" "}
            <span className="text-primary">local services</span>{" "}
            near you
          </h1>

          <p className="text-lg md:text-xl text-secondary-foreground/70 max-w-xl mb-10">
            Connect with verified plumbers, electricians, tutors, and more. 
            Book instantly. Pay securely. Review honestly.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="What service do you need?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-13 pl-12 pr-4 rounded-xl bg-background text-foreground placeholder:text-muted-foreground border-0 outline-none ring-2 ring-transparent focus:ring-primary/50 transition-all text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-13 px-8 rounded-xl text-base font-semibold">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 mt-6">
            {["Plumbing", "Tutoring", "Cleaning", "Electrical"].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/services?category=${tag}`)}
                className="px-4 py-1.5 text-sm rounded-full border border-secondary-foreground/20 text-secondary-foreground/70 hover:bg-secondary-foreground/10 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="flex gap-12 mt-16 mb-8"
        >
          {[
            { value: "500+", label: "Service Providers" },
            { value: "2,000+", label: "Happy Customers" },
            { value: "4.8★", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-secondary-foreground/60">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
