import HeroSection from "@/components/landing/HeroSection";
import ProductCategories from "@/components/landing/ProductCategories";
import AboutUsSection from "@/components/landing/AboutUsSection";
import TrustSection from "@/components/landing/TrustSection";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import TestimonialsSection from "@/components/landing/TestimonialsSection";

const Index = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowForm(false);
    toast({
      title: "Inquiry Sent",
      description: "We'll get back to you soon!",
    });
  };

  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProductCategories />
      <TestimonialsSection  />
      <TrustSection />

      {/* Fixed Contact Button */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-4">
        <Button 
          asChild
          className="w-48 bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg rounded-l-lg rounded-r-none transition-all duration-300 hidden md:flex"
        >
          <a href="tel:+18009696295" className="flex items-center justify-center gap-2">
            <Phone className="w-5 h-5 text-emerald-600 animate-pulse" />
            <span>1-800-9RX-HELP</span>
          </a>
        </Button>

        {/* Mobile Contact Button */}
        <Button 
          asChild
          className="fixed bottom-4 right-4 md:hidden shadow-lg rounded-full w-12 h-12 p-0"
        >
          <a href="tel:+17043096277">
            <Phone className="w-6 h-6" />
          </a>
        </Button>

        {/* Inquiry Form Toggle Button */}
        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-48 bg-emerald-600 text-white rounded-l-lg rounded-r-none hover:bg-emerald-700 transition-all duration-300 hidden md:block"
        >
          Quick Inquiry
        </Button>

        {/* Floating Inquiry Form */}
        {showForm && (
          <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-l-lg p-4 w-80 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Your Name"
                  className="w-full"
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="w-full"
                  required
                />
              </div>
              <div>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Your Message"
                  className="w-full"
                  required
                />
              </div>
              <Button 
                type="submit"
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Send Inquiry
              </Button>
            </form>
          </div>
        )}
      </div>

   
    </div>
  );
};

const FooterColumn = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h4 className="text-white font-bold mb-4 md:mb-6">{title}</h4>
    <ul className="space-y-2 md:space-y-3">
      {items.map((item, index) => (
        <li key={index} className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer text-sm md:text-base">
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default Index;