import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Serafix
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Browse Services
          </Link>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Categories
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm">Log In</Button>
          <Button size="sm">Get Started</Button>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          <Link to="/services" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Browse Services</Link>
          <a href="#how-it-works" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>How It Works</a>
          <a href="#categories" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Categories</a>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" size="sm" className="flex-1">Log In</Button>
            <Button size="sm" className="flex-1">Get Started</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
