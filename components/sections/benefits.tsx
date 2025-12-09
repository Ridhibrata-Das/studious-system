"use client";
import { CheckCircle, Users, Award, TrendingUp, Shield } from "lucide-react";
import { TranslateWrapper } from "@/components/translate-wrapper";

const benefits = [
  {
    icon: Users,
    title: "Expert Support Team",
    description:
      "24/7 agricultural experts ready to help you maximize your farm's potential",
  },
  {
    icon: Award,
    title: "Proven Results",
    description: "95% of farmers see improved yields within the first season",
  },
  {
    icon: TrendingUp,
    title: "Data-Driven Insights",
    description: "Make informed decisions based on real-time agricultural data",
  },
  {
    icon: Shield,
    title: "Reliable Technology",
    description: "Enterprise-grade security and 99.9% uptime guarantee",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop"
              alt="Modern farming technology"
              className="rounded-lg shadow-lg w-full h-96 object-cover"
            />

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-xl p-6 border">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  40%
                </div>
                <div className="text-sm text-gray-600">
                  <TranslateWrapper text="Average yield increase" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                <TranslateWrapper text="We believe in turning your farm into your" />
                <span className="text-green-600"> <TranslateWrapper text="success story" /></span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                <TranslateWrapper text="Our advanced agricultural technology platform combines the power of AI, IoT sensors, and data analytics to help farmers make smarter decisions, reduce costs, and maximize their harvest potential." />
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={benefit.title} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <benefit.icon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      <TranslateWrapper text={benefit.title} />
                    </h4>
                    <p className="text-gray-600 text-sm">
                      <TranslateWrapper text={benefit.description} />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                <TranslateWrapper text="Learn More About Us" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}