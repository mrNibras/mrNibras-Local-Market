import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, MapPin, ArrowLeft, Clock, Shield, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useService } from "@/hooks/use-services";
import { toast } from "sonner";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: service, isLoading } = useService(id || "");

  const handleBookNow = () => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    
    if (!user || !token) {
      toast.error("Please log in to book a service");
      navigate("/login");
      return;
    }
    
    // Navigate to booking page or show booking modal
    toast.info("Booking feature coming soon!");
    // TODO: Navigate to booking page: navigate(`/bookings/new?service=${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 text-center">
          <p className="text-xl text-foreground">Service not found</p>
          <Link to="/services"><Button className="mt-4">Back to Services</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <Link to="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Services
          </Link>

          <div className="grid md:grid-cols-[1fr,340px] gap-8">
            <div>
              <div className="h-64 rounded-2xl bg-muted flex items-center justify-center mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                <span className="relative text-7xl font-display font-bold text-primary/20">{service.title.charAt(0)}</span>
              </div>

              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-4">
                {service.category_name}
              </span>

              <h1 className="font-display text-3xl font-bold text-foreground mb-2">{service.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <span className="font-semibold text-foreground">
                    {service.averageRating ? Number(service.averageRating).toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-muted-foreground">({service.review_count} reviews)</span>
                </div>
                {service.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {service.location}
                  </div>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8">{service.description}</p>

              <h2 className="font-semibold text-foreground text-lg mb-4">What's Included</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Clock, label: "Flexible Hours" },
                  { icon: Shield, label: "Verified Provider" },
                  { icon: Calendar, label: "Easy Scheduling" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:sticky md:top-24 h-fit">
              <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{service.provider_name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{service.provider_name}</p>
                    <p className="text-sm text-muted-foreground">Service Provider</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-primary">{service.price}</span>
                  <span className="text-muted-foreground">ETB / service</span>
                </div>

                <Button onClick={handleBookNow} className="w-full h-12 rounded-xl text-base font-semibold mb-3">
                  Book Now
                </Button>
                <Button onClick={() => toast.info("Contact feature coming soon!")} variant="outline" className="w-full h-12 rounded-xl text-base">
                  Contact Provider
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
