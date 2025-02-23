
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

// const testimonials = [
//   {
//     name: "Dr. Sarah Johnson",
//     title: "Lead Pharmacist, MediCare Plus",
//     image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=300",
//     quote: "The quality and reliability of their medical supplies have significantly improved our pharmacy operations. Their service is unmatched.",
//   },
//   {
//     name: "Michael Chang",
//     title: "Hospital Operations Director",
//     image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&h=300",
//     quote: "We've seen a 40% improvement in our supply chain efficiency since partnering with them. Truly exceptional service.",
//   },
//   {
//     name: "Rachel Woods",
//     title: "Pharmacy Chain Owner",
//     image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=300&h=300",
//     quote: "Their commitment to quality and customer service is remarkable. They've become an essential partner in our growth.",
//   },
//   {
//     name: "Dr. James Miller",
//     title: "Medical Supply Manager",
//     image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=300&h=300",
//     quote: "The range of products and their quality control measures have exceeded our expectations. Highly recommended.",
//   }
// ];


const testimonials = [
  {
    name: "Ryan Yanicko",
    title: "Cannon Pharmacy Mooresville",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=300",
    quote: "Snehal and 9Rx have been excellent to work with getting our pharmacy bags and labels designed and delivered. They took the time to address our concerns and make sure the product was exactly to our specifications. The product quality is excellent and they are very reliable with ordering and delivery of the products.",
  },
  {
    name: "Mark Cantrell",
    title: "Operations Manager, Cannon Pharmacy Main",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=300",
    quote: "It has been a pleasure and wonderful experience working with 9rx. The products are wonderful and are customized to our exact specifications perfectly. The service and customer service are unparalleled and unmatched by any vendor that I have or currently work with. We are extremely pleased and lucky to have the amazing opportunity to do business with 9rx. We HIGHLY recommend this company and its services. Extremely Impressed and Pleased.",
  },
  {
    name: "Khristina, PharmD",
    title: "Valley Health Pharmacy , Director of Pharmacy Operations",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&h=300",
    quote: "I am incredibly impressed with the service I have received from 9RX when purchasing our pharmacy supplies (prescription labels, custom bags and medication droppers/adaptors). 9RX is truly reliable, offering high-quality items that meet all of our needs. The ordering process was straightforward, and the products arrived on time and in excellent condition. What stood out the most, however, was the excellent customer service. Snehal and the team have been responsive, knowledgeable, and always available to assist with any questions or concerns. I can confidently recommend 9RX to anyone looking for top-notch pharmacy supplies and reliable service.",
  },
  {
    name: "",
    title: "",
    image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=300&h=300",
    quote: "I'm extremely satisfied with my purchases of pharmacy vials and other supplies from 9-Rx.com past 8 months and more  The quality of the products is very good and the service was fast and reliable.What helped my all businesses the most was the affordability of the pharmacy supplies when reimbursement rate is very challenging now a days. But what truly sets then apart is the trustworthiness of the team. They're knowledgeable, responsive, and genuinely care about their customers.Overall, I highly recommend for all your pharmacy needs. Thanks Much Snehal and Rajesh.",
  },
];

export default TestimonialsSection;
