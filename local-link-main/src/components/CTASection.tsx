import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "var(--hero-gradient)" }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(24,80%,50%,0.15),transparent_60%)]" />
      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary-foreground mb-6">
            Ready to offer your services?
          </h2>
          <p className="text-lg text-secondary-foreground/70 max-w-lg mx-auto mb-10">
            Join hundreds of local professionals already growing their business on Serafix. It's free to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-13 px-8 rounded-xl text-base font-semibold gap-2">
              Become a Provider <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-13 px-8 rounded-xl text-base font-semibold border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
