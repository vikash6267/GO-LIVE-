import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/landing/HeroSection";
import ProductCategories from "@/components/landing/ProductCategories";
import AboutUsSection from "@/components/landing/AboutUsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import TrustSection from "@/components/landing/TrustSection";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const userType = sessionStorage.getItem("userType");

    if (isLoggedIn && userType) {
      const dashboardRoutes: Record<string, string> = {
        admin: "/admin/dashboard",
        pharmacy: "/pharmacy/products",
        hospital: "/hospital/dashboard",
        group: "/group/dashboard",
      };

      const route = dashboardRoutes[userType];
      if (route) {
        navigate(route, { replace: true });
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProductCategories />
      {/* <AboutUsSection /> */}
      <TestimonialsSection />
      <br />
      <br />
      <TrustSection />
    </div>
  );
};

export default Index;
