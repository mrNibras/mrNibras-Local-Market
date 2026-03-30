import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Calendar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");
    
    if (!storedUser || !storedToken) {
      toast.error("Please log in to view your calendar");
      navigate("/login");
      return;
    }
    
    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    // Fetch bookings from backend
    fetchBookings(userData);
  }, []);

  const fetchBookings = async (userData: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const endpoint = userData.role === "provider" 
        ? "/bookings/provider/my-bookings"
        : "/bookings/my-bookings";
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if not logged in (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Filter upcoming bookings
  const upcomingBookings = bookings
    .filter((booking: any) => new Date(booking.bookingDate) > new Date())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "rejected": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">Calendar</h1>
            <p className="text-muted-foreground">
              Manage your schedule and appointments
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Bookings
                </CardTitle>
                <CardDescription>
                  Your scheduled appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No upcoming bookings</p>
                    {user.role === "customer" && (
                      <Button 
                        className="mt-4"
                        onClick={() => navigate("/services")}
                      >
                        Browse Services
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking: any) => (
                      <div
                        key={booking._id}
                        className="p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">
                            {booking.service?.title || "Service"}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {user.role === "customer" && booking.provider && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>{booking.provider.name}</span>
                            </div>
                          )}
                          {user.role === "provider" && booking.customer && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>{booking.customer.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                          </div>
                          {booking.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{booking.duration} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>
                  Your booking statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">Total Bookings</span>
                  <span className="text-lg font-bold">{bookings.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="text-lg font-bold">
                    {bookings.filter((b: any) => b.status === "pending").length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">Upcoming</span>
                  <span className="text-lg font-bold">{upcomingBookings.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="text-lg font-bold">
                    {bookings.filter((b: any) => b.status === "completed").length}
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
