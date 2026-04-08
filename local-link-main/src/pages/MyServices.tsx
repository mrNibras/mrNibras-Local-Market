import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Star, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function MyServices() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");
    
    if (!storedUser || !storedToken) {
      navigate("/login");
      return;
    }
    
    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    if (userData.role !== "provider") {
      toast.error("Access denied. Providers only.");
      navigate("/dashboard");
      return;
    }

    fetchServices(storedToken);
  }, [navigate]);

  const fetchServices = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/services/my-services`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_URL}/services/${serviceId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Service deleted successfully");
        setServices(services.filter(s => s._id !== serviceId));
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error) {
      toast.error("Connection error");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">My Services</h1>
              <p className="text-muted-foreground">Manage your service listings</p>
            </div>
            <Button onClick={() => navigate("/create-service")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Service
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : services.length === 0 ? (
            <Card className="text-center py-20">
              <CardContent>
                <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Services Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first service to start reaching customers</p>
                <Button onClick={() => navigate("/create-service")}>
                  Create Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {services.map((service) => (
                <Card key={service._id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Service Image */}
                      <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        {service.images && service.images.length > 0 ? (
                          <img
                            src={service.images[0]}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl font-bold text-muted-foreground">
                              {service.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Service Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{service.title}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{service.category}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            service.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {service.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-accent text-accent" />
                            <span>{service.averageRating?.toFixed(1) || "0.0"}</span>
                            <span>({service.totalReviews || 0} reviews)</span>
                          </div>
                          <span className="font-semibold text-primary">{service.price} ETB</span>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {service.description}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/services/${service._id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(service._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
