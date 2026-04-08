import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Wrench, Calendar, DollarSign, MessageSquare, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
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
    
    // Check if user is admin
    if (userData.role !== "admin") {
      toast.error("Access denied. Admin only.");
      navigate("/dashboard");
      return;
    }

    // Fetch platform stats
    fetchStats(storedToken);
  }, [navigate]);

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/analytics/platform`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your platform and monitor activity</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.users?.total || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.users?.customer || 0} customers, {stats?.users?.provider || 0} providers
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.services?.total || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Avg rating: {stats?.services?.avgRating?.toFixed(1) || "0.0"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.bookings?.total || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.bookings?.pending || 0} pending
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.payments?.revenue || 0} ETB</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.payments?.completed || 0} completed payments
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage users and roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => toast.info("User management coming soon!")}>
                      Manage Users
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Disputes
                    </CardTitle>
                    <CardDescription>Resolve customer disputes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => toast.info("Dispute resolution coming soon!")}>
                      View Disputes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Messages
                    </CardTitle>
                    <CardDescription>Monitor platform messages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => navigate("/messages")}>
                      View Messages
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Stats */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Reviews Overview
                    </CardTitle>
                    <CardDescription>Platform review statistics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Reviews</span>
                      <span className="font-semibold">{stats?.reviews?.count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Rating</span>
                      <span className="font-semibold">{stats?.reviews?.avgRating?.toFixed(1) || "0.0"} ⭐</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Health</CardTitle>
                    <CardDescription>System status overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Backend Status</span>
                      <span className="text-green-600 font-semibold">● Running</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Database Status</span>
                      <span className="text-green-600 font-semibold">● Connected</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
