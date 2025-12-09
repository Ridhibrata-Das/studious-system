"use client";
import {
  Brain,
  Camera,
  Droplets,
  Shield,
  BarChart,
  Smartphone,
  Zap,
  Leaf,
  Cloud,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Smart crop recommendations using machine learning and data analytics to optimize your farming decisions.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
  },
  {
    icon: Camera,
    title: "Drone Monitoring",
    description:
      "Aerial surveillance and field analysis using advanced drone technology for comprehensive crop monitoring.",
    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop",
  },
  {
    icon: Droplets,
    title: "Smart Irrigation",
    description:
      "Automated water management systems that optimize irrigation timing and quantity based on real-time data.",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
  },
  {
    icon: Shield,
    title: "Disease Detection",
    description:
      "Early identification of plant diseases and pest infestations using advanced imaging and AI analysis.",
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
  },
  {
    icon: BarChart,
    title: "Yield Forecasting",
    description:
      "Predictive analytics for accurate yield estimation and harvest planning to maximize your farm's productivity.",
    image:
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop",
  },
  {
    icon: Smartphone,
    title: "Mobile Control",
    description:
      "Complete farm management from your mobile device with real-time monitoring and remote control capabilities.",
    image:
      "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=300&fit=crop",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete agricultural solutions designed to transform your farming
            operations with cutting-edge technology and data-driven insights.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Image */}
              <div className="h-48 bg-gray-200">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <feature.icon className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}