import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Calendar, MessageSquare, Star, TrendingUp, Users } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    services: 0,
    bookings: 0,
    reviews: 0,
    messages: 0
  });
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
    
    // Fetch user stats
    fetchStats(userData);
  }, []);

  const fetchStats = async (userData: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      // Fetch bookings
      const bookingsEndpoint = userData.role === "provider"
        ? "/bookings/provider/my-bookings"
        : "/bookings/my-bookings";
      
      const bookingsRes = await fetch(`${API_URL}${bookingsEndpoint}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setStats(prev => ({
          ...prev,
          bookings: bookingsData.data?.length || 0
        }));
      }
      
      // If provider, fetch services
      if (userData.role === "provider") {
        const servicesRes = await fetch(`${API_URL}/services/my-services`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setStats(prev => ({
            ...prev,
            services: servicesData.data?.length || 0
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const dashboardStats = [
    {
      title: "Total Services",
      value: stats.services.toString(),
      icon: Wrench,
      description: "Services listed"
    },
    {
      title: "Active Bookings",
      value: stats.bookings.toString(),
      icon: Calendar,
      description: "Total bookings"
    },
    {
      title: "Total Reviews",
      value: stats.reviews.toString(),
      icon: Star,
      description: "Customer reviews"
    },
    {
      title: "Messages",
      value: stats.messages.toString(),
      icon: MessageSquare,
      description: "Unread messages"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-muted-foreground">
              Manage your {user.role === "provider" ? "services" : "bookings"} from here
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {dashboardStats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-8 flex items-center">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your {user.role === "provider" ? "provider" : "customer"} activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={() => navigate("/services")}>
                  <Wrench className="mr-2 h-4 w-4" />
                  {user.role === "provider" ? "Manage Services" : "Browse Services"}
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate("/calendar")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate("/messages")}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
                <CardDescription>
                  Your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium capitalize">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since:</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
