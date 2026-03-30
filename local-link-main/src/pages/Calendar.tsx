import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Users, CheckCircle, XCircle } from "lucide-react";

export default function Calendar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) return null;

  const upcomingBookings = [
    {
      id: 1,
      service: "Plumbing Service",
      customer: "John Doe",
      date: "2026-04-01",
      time: "10:00 AM",
      status: "confirmed"
    },
    {
      id: 2,
      service: "Electrical Repair",
      customer: "Jane Smith",
      date: "2026-04-02",
      time: "2:00 PM",
      status: "pending"
    }
  ];

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

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
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
                {upcomingBookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No upcoming bookings
                  </p>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{booking.service}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{booking.customer}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reschedule
                          </Button>
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
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="text-lg font-bold">0 bookings</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="text-lg font-bold">0 bookings</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="text-lg font-bold">0 bookings</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="text-lg font-bold">0 bookings</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
