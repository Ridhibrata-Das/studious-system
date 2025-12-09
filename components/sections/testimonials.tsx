"use client";
import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { TranslateWrapper } from "@/components/translate-wrapper";

const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Punjab, India",
    content:
      "E-Bhoomi transformed my 50-acre wheat farm. The AI recommendations helped me reduce water usage by 30% while increasing yield by 40%. Best investment I've made for my family's future.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Priya Sharma",
    location: "Maharashtra, India",
    content:
      "The drone monitoring feature is incredible. I can track my entire 25-acre organic farm from my phone. Early disease detection saved my tomato crop and increased profits by ₹2 lakhs.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b882?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Mohammed Ali",
    location: "Gujarat, India",
    content:
      "Smart irrigation system has been a game-changer for my cotton farm. Water costs reduced by 25% and cotton quality improved significantly. My children are proud of our modern farm.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Lakshmi Devi",
    location: "Tamil Nadu, India",
    content:
      "Being a woman farmer, E-Bhoomi gave me confidence with data-driven decisions. My rice yield increased by 35% and I'm now a role model for other women in my village.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Suresh Patel",
    location: "Uttar Pradesh, India",
    content:
      "The weather intelligence feature helped me save my sugarcane crop during unexpected rainfall. Predictive alerts are so accurate, it's like having a meteorologist on my farm.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  // Get testimonials for desktop (center + sides)
  const getDesktopTestimonials = () => {
    const visible = [];
    for (let i = -1; i <= 1; i++) {
      const index =
        (currentIndex + i + testimonials.length) % testimonials.length;
      visible.push({
        ...testimonials[index],
        position: i,
      });
    }
    return visible;
  };

  return (
    <section className="py-16 bg-green-600 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            <TranslateWrapper text="Trusted by 10,000+ farmers" />
          </h2>
          <div className="flex items-center justify-center space-x-1 mb-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-white ml-2">4.9</span>
          </div>
          <p className="text-green-100">
            <TranslateWrapper text="Real stories from farmers across India" />
          </p>
        </div>

        {/* Desktop Carousel (hidden on mobile) */}
        <div className="hidden md:block relative">
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="flex items-center justify-center space-x-6 py-8">
            {getDesktopTestimonials().map((testimonial, index) => {
              const isCenter = testimonial.position === 0;

              return (
                <div
                  key={`${testimonial.name}-${currentIndex}-${index}`}
                  className={`transition-all duration-700 ease-in-out ${isCenter ? "scale-105 z-10" : "scale-95 opacity-80"
                    }`}
                >
                  <div
                    className={`bg-white rounded-lg p-6 shadow-xl ${isCenter ? "w-96 min-h-[320px]" : "w-80 min-h-[320px]"
                      } flex flex-col`}
                  >
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>

                    <div className="text-gray-600 mb-6 leading-relaxed flex-1 text-sm">
                      "<TranslateWrapper text={testimonial.content} />"
                    </div>

                    <div className="flex items-center space-x-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          <TranslateWrapper text={testimonial.name} />
                        </h4>
                        <p className="text-green-600 font-medium text-xs">
                          <TranslateWrapper text={testimonial.location} />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Single Card (visible on mobile only) */}
        <div className="md:hidden">
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm min-h-[320px] flex flex-col">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <div className="text-gray-600 mb-6 leading-relaxed flex-1 text-sm">
                "<TranslateWrapper text={testimonials[currentIndex].content} />"
              </div>

              <div className="flex items-center space-x-4">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    <TranslateWrapper text={testimonials[currentIndex].name} />
                  </h4>
                  <p className="text-green-600 font-medium text-xs">
                    <TranslateWrapper text={testimonials[currentIndex].location} />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center space-x-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? "bg-white" : "bg-white/30"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}