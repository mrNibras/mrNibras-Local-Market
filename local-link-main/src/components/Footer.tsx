import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground/70 py-16">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-secondary-foreground">Serafix</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Connecting local service providers with customers across Ethiopia. Quality services at your fingertips.
            </p>
          </div>

          {[
            { title: "Services", links: ["Plumbing", "Electrical", "Tutoring", "Cleaning"] },
            { title: "Company", links: ["About Us", "Careers", "Blog", "Contact"] },
            { title: "Support", links: ["Help Center", "Safety", "Terms", "Privacy"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-secondary-foreground mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-secondary-foreground transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-secondary-foreground/10 pt-8 text-sm text-center">
          © {new Date().getFullYear()} Serafix. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
