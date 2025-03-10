import { Package2, Syringe, ShoppingBag, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ProductCategories = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-emerald-600 font-semibold tracking-wider uppercase text-sm">
            Product Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
            Your Trusted Pharmacy Supply Partner
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            We provide high-quality products that enable pharmacies to deliver
            exceptional care to their patients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <ProductCard
            imageSrc="/lovable-uploads/e9408ea3-9050-4323-a89d-40caa8f41d24.png"
            title="RX VIALS"
            description="Premium prescription vials and containers in various sizes for secure medication dispensing"
            price="Starting from $27/case"
          />
          <ProductCard
            imageSrc="/LIQUID.png"
            title="LIQUID OVAL "
            description="Our Oral Syringes ensure accurate, Safe dosing of Liquid Medications, Ideal for Pharmacies and Patients."
            price="Starting from $29/case"
          />
          <ProductCard
            imageSrc="/922.png"
            title="RX LABELS"
            description="High-quality prescription labels in various sizes and formats for all pharmacy needs"
            price="Starting from $10/Roll"
          />
          <ProductCard
            imageSrc="/public/lovable-uploads/rxpaper.png"
            title="RX PAPER BAGS"
            description="Premium prescription paper bags for pharmacies, available in various sizes and styles"
            price="Starting from $55/case"
          />
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <Button
            onClick={() =>
              navigate("/login", { state: { defaultTab: "signup" } })
            }
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-6 sm:px-8 py-5 sm:py-6 h-auto text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Sign Up Now
          </Button>
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({
  imageSrc,
  title,
  description,
  price,
}: {
  imageSrc: string;
  title: string;
  description: string;
  price: string;
}) => (
  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg relative group overflow-hidden hover:shadow-xl transition-all duration-300">
    <div className="mb-6">
      <div
        className="relative w-full h-40 sm:h-48 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center 
        before:absolute before:inset-0 before:bg-emerald-500/5 before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100
        group-hover:shadow-lg transition-all duration-500 ease-in-out"
      >
        <img
          src={imageSrc}
          alt={title}
          className="h-full  object-contain transform transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-105"
        />
      </div>
    </div>
    <h3 className="text-xl font-semibold mb-2 sm:mb-3 text-gray-800">
      {title}
    </h3>
    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
      {description}
    </p>
    <div className="pt-4 border-t border-gray-100">
      <span className="text-emerald-600 font-medium">{price}</span>
    </div>
  </div>
);

export default ProductCategories;
