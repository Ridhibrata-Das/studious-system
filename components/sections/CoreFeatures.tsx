"use client";
import { Activity, Brain, Camera, FileBarChart, Shield } from "lucide-react";
import { TranslateWrapper } from "@/components/translate-wrapper";

const coreFeatures = [
  {
    icon: Activity,
    title: "Real-time Field Updates",
    description:
      "Get instant notifications about soil moisture, temperature, humidity, and weather conditions directly on your mobile device.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
  },
  {
    icon: FileBarChart,
    title: "Advanced Sensor Reports",
    description:
      "High-end IoT sensors provide detailed analytics on NPK levels, pH balance, soil conductivity, and crop health metrics.",
    image:
      "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop",
  },
  {
    icon: Shield,
    title: "AI Disease Detection",
    description:
      "Early identification of plant diseases, pest infestations, and nutrient deficiencies using computer vision and machine learning.",
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
  },
  {
    icon: Camera,
    title: "Drone Inspection & Treatment",
    description:
      "Automated drone surveys for field mapping, crop monitoring, and precision pesticide/fertilizer application.",
    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop",
  },
];

export function CoreFeatures() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Simple Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            <TranslateWrapper text="What We Actually Provide" />
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <TranslateWrapper text="Complete agricultural solutions designed to transform your farming operations." />
          </p>
        </div>

        {/* Clean Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {coreFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Image */}
              <div className="h-48">
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
                    <TranslateWrapper text={feature.title} />
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  <TranslateWrapper text={feature.description} />
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Simple Balram AI Section */}
        <div className="bg-green-600 rounded-lg p-8 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-white mr-3" />
              <h3 className="text-2xl font-bold"><TranslateWrapper text="Balram AI" /></h3>
            </div>
            <h4 className="text-xl font-semibold mb-4">
              <TranslateWrapper text="Ask Any Farming Question, Get Expert Answers" />
            </h4>
            <p className="text-green-100 mb-6 leading-relaxed">
              <TranslateWrapper text="24/7 AI assistant trained on agricultural knowledge. Get instant advice on crop diseases, fertilizers, weather impacts, and farming best practices." />
            </p>
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              <TranslateWrapper text="Try Balram AI Free" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}