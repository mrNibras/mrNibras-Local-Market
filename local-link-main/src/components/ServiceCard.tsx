import { Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { ServiceWithRating } from "@/hooks/use-services";

const ServiceCard = ({ service }: { service: ServiceWithRating }) => {
  return (
    <Link
      to={`/services/${service.id}`}
      className="group block rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      <div className="h-44 bg-muted flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
        <span className="relative text-4xl font-display font-bold text-primary/30">
          {service.title.charAt(0)}
        </span>
        <span className="absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full bg-card/90 backdrop-blur text-foreground">
          {service.category_name}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
          {service.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{service.provider_name}</p>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="text-sm font-semibold text-foreground">{Number(service.avg_rating).toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({service.review_count})</span>
          </div>
          {service.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">{service.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <p className="text-lg font-bold text-primary">{service.price} ETB</p>
          <span className="text-xs font-medium text-muted-foreground">per service</span>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
