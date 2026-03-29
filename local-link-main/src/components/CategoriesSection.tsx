import { useCategories } from "@/hooks/use-services";
import { iconMap } from "@/lib/data";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const CategoriesSection = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();

  return (
    <section id="categories" className="py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Browse by Category</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            What do you need help with?
          </h2>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories?.map((cat, i) => {
              const Icon = iconMap[cat.icon] || iconMap.Wrench;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/services?category=${cat.name}`)}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-300"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: cat.color }} />
                  </div>
                  <span className="font-semibold text-foreground">{cat.name}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
