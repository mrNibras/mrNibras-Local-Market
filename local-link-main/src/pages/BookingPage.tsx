import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useService } from "@/hooks/use-services";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: service, isLoading: serviceLoading } = useService(id || "");
  const [user, setUser] = useState<any>(null);
  const [bookingData, setBookingData] = useState({
    bookingDate: "",
    duration: 60,
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");
    
    if (!storedUser || !storedToken) {
      toast.error("Please log in to book a service");
      navigate("/login");
      return;
    }
    
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service || !user) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: service.provider._id,
          service: service._id,
          bookingDate: new Date(bookingData.bookingDate).toISOString(),
          duration: bookingData.duration,
          note: bookingData.notes
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Booking created successfully!");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Booking error:", error);
      if (error instanceof Error) {
        toast.error(`Booking failed: ${error.message}`);
      } else {
        toast.error("Connection error. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  if (serviceLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
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

  // Get tomorrow's date for minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container max-w-4xl">
          <Link to={`/services/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Service
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription>Fill in your booking information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bookingDate">Preferred Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          id="bookingDate"
                          type="date"
                          min={minDate}
                          value={bookingData.bookingDate}
                          onChange={(e) => setBookingData({ ...bookingData, bookingDate: e.target.value })}
                          className="w-full h-10 pl-10 pr-4 rounded-md border border-border bg-background text-foreground"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <select
                          id="duration"
                          value={bookingData.duration}
                          onChange={(e) => setBookingData({ ...bookingData, duration: Number(e.target.value) })}
                          className="w-full h-10 pl-10 pr-4 rounded-md border border-border bg-background text-foreground"
                        >
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={90}>1.5 hours</option>
                          <option value={120}>2 hours</option>
                          <option value={180}>3 hours</option>
                          <option value={240}>4 hours</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special requirements or instructions..."
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div className="p-4 rounded-lg bg-muted">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Service Price</span>
                        <span className="font-medium">{service.price} ETB</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{bookingData.duration} min</span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-primary">{service.price} ETB</span>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Booking...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Service Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{service.title.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{service.title}</p>
                      <p className="text-sm text-muted-foreground">{service.category_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{service.provider_name}</p>
                      <p className="text-sm text-muted-foreground">Service Provider</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-card border border-border">
                    <h4 className="font-semibold mb-2">What's Included</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Professional service</li>
                      <li>• Quality guarantee</li>
                      <li>• Flexible scheduling</li>
                      <li>• Secure payment</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Booking Policy</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Free cancellation up to 24h before</li>
                      <li>• Payment after service completion</li>
                      <li>• 100% satisfaction guarantee</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
