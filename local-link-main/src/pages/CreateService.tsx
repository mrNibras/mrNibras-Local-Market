import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CATEGORIES = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "cleaning", label: "Cleaning" },
  { value: "tutoring", label: "Tutoring" },
  { value: "painting", label: "Painting" },
  { value: "carpentry", label: "Carpentry" },
  { value: "gardening", label: "Gardening" },
  { value: "moving", label: "Moving" }
];

export default function CreateService() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    serviceType: "in-person"
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert images to base64 and store URLs
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const user = localStorage.getItem("user");
      
      if (!token || !user) {
        toast.error("Please log in first");
        navigate("/login");
        return;
      }

      const userData = JSON.parse(user);

      const response = await fetch(`${API_URL}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          serviceType: formData.serviceType,
          images: images
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Service created successfully!");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Failed to create service");
      }
    } catch (error) {
      console.error("Service creation error:", error);
      toast.error("Connection error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Create New Service</CardTitle>
              <CardDescription>
                Add your service to reach thousands of customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Service Images *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                        <img
                          src={image}
                          alt={`Service image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground text-center px-4">
                        {images.length === 0 ? "Upload Image" : "Add More"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        multiple
                      />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload at least 1 image to show your service
                  </p>
                </div>

                {/* Service Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Service Title *</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="title"
                      placeholder="e.g., Professional Plumbing Service"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Category and Price */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (ETB) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="100"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Service Type */}
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your service in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="resize-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Creating Service...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Create Service
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tips for a Great Service Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>📸 <strong>Use high-quality images</strong> - Show your work clearly</li>
                <li>✍️ <strong>Write detailed descriptions</strong> - Explain what's included</li>
                <li>💰 <strong>Set competitive prices</strong> - Research similar services</li>
                <li>🏷️ <strong>Choose the right category</strong> - Helps customers find you</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
