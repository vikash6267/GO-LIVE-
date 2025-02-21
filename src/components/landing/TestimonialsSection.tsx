
import { Users, HeartHandshake, Trophy, PlayCircle } from "lucide-react";

const TestimonialsSection = () => {
  return (
    <section className="relative py-20 bg-[#ecfdf5] overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/5 bg-[size:3rem_3rem] pointer-events-none mix-blend-plus-lighter" />
      
      {/* Top Content */}
      <div className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-emerald-900 mb-4">
              Trusted by Leading Pharmacy Groups
            </h2>
            <p className="text-emerald-700">
              Join hundreds of satisfied pharmacies who have enhanced their operations with our premium pharmacy supplies and packaging solutions.
            </p>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-8">
            <StatsCard 
              icon={<Users className="w-8 h-8 text-emerald-600" />}
              value="150+"
              label="Happy Clients"
            />
            <StatsCard 
              icon={<HeartHandshake className="w-8 h-8 text-emerald-600" />}
              value="98%"
              label="Satisfaction"
            />
            {/* <StatsCard 
              icon={<Trophy className="w-8 h-8 text-emerald-600" />}
              value="150+"
              label="Awards"
            /> */}
          </div>
        </div>
      </div>

      {/* Testimonials Slider */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#ecfdf5] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#ecfdf5] to-transparent z-10" />
        
        <div className="overflow-hidden">
          <div className="flex gap-8 animate-[slide_50s_linear_infinite]">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const StatsCard = ({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) => (
  <div className="text-center transform transition-transform hover:scale-105 duration-300">
    <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-2 mx-auto">
      {icon}
    </div>
    <p className="text-2xl font-bold text-emerald-900">{value}</p>
    <p className="text-emerald-600 text-sm">{label}</p>
  </div>
);

const TestimonialCard = ({ name, title, image, quote }: {
  name: string;
  title: string;
  image: string;
  quote: string;
}) => (
  <div className="min-w-[300px] sm:min-w-[380px] p-6 rounded-2xl backdrop-blur-sm bg-white/50 transform transition-transform duration-300 hover:scale-105">
    <div className="flex items-center gap-4 mb-4">
      <img 
        src={image} 
        alt={name}
        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
        loading="lazy"
      />
      <div>
        <h4 className="text-emerald-900 font-semibold text-lg">{name}</h4>
        <p className="text-emerald-600 text-sm">{title}</p>
      </div>
    </div>
    <p className="text-emerald-800 text-sm mb-4 line-clamp-3">{quote}</p>
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors">
        <PlayCircle className="w-4 h-4 text-emerald-600" />
      </div>
      <span className="text-sm text-emerald-700 font-medium">Watch Story</span>
    </div>
  </div>
);

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    title: "Lead Pharmacist, MediCare Plus",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=300",
    quote: "The quality and reliability of their medical supplies have significantly improved our pharmacy operations. Their service is unmatched.",
  },
  {
    name: "Michael Chang",
    title: "Hospital Operations Director",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&h=300",
    quote: "We've seen a 40% improvement in our supply chain efficiency since partnering with them. Truly exceptional service.",
  },
  {
    name: "Rachel Woods",
    title: "Pharmacy Chain Owner",
    image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=300&h=300",
    quote: "Their commitment to quality and customer service is remarkable. They've become an essential partner in our growth.",
  },
  {
    name: "Dr. James Miller",
    title: "Medical Supply Manager",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=300&h=300",
    quote: "The range of products and their quality control measures have exceeded our expectations. Highly recommended.",
  }
];

export default TestimonialsSection;
