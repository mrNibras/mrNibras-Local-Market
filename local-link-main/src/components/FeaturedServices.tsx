import { useServices } from "@/hooks/use-services";
import ServiceCard from "./ServiceCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const FeaturedServices = () => {
  const { data: services, isLoading } = useServices();

  return (
    <section className="py-24 bg-muted/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-14"
        >
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Top Rated</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Featured Services
            </h2>
          </div>
          <Link to="/services">
            <Button variant="ghost" className="hidden md:flex gap-2 text-primary hover:text-primary">
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services available yet. Be the first to list one!</p>
          </div>
        )}

        <div className="md:hidden mt-8 text-center">
          <Link to="/services">
            <Button className="gap-2">
              View all services <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
