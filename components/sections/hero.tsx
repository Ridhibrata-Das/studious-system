"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Play, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { TranslateWrapper } from "@/components/translate-wrapper";

export function HeroSection() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    farmSize: "",
  });
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You can add your form submission logic here
    console.log("Form submitted:", formData);
  };

  const handleStartTrial = () => {
    router.push("/dashboard");
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2022&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-10rem)]">
          {/* Left Side - Hero Content */}
          <div className="text-white space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1 bg-green-600 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4 mr-2" />
              <TranslateWrapper text="Trusted by 10,000+ farmers" />
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <TranslateWrapper text="Smart Farming," />
                <br />
                <span className="text-green-400">
                  <TranslateWrapper text="Better Harvest" />
                </span>
              </h1>

              <p className="text-lg text-gray-200 leading-relaxed max-w-lg">
                <TranslateWrapper text="Transform your agricultural operations with AI-powered monitoring, IoT sensors, and intelligent automation. Join thousands of farmers increasing their yields." />
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleStartTrial}
              >
                <TranslateWrapper text="Start Free Trial" />
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-black hover:bg-white hover:text-gray-900"
              >
                <Play className="mr-2 w-4 h-4" />
                <TranslateWrapper text="Watch Demo" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">10k+</div>
                <div className="text-sm text-gray-300">
                  <TranslateWrapper text="Active Farmers" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">95%</div>
                <div className="text-sm text-gray-300">
                  <TranslateWrapper text="Accuracy Rate" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">40%</div>
                <div className="text-sm text-gray-300">
                  <TranslateWrapper text="Yield Increase" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-lg shadow-xl p-8 mt-8 lg:mt-0 mb-16 lg:mb-0">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    <TranslateWrapper text="Book a Free Consultation" />
                  </h3>
                  <p className="text-gray-600">
                    <TranslateWrapper text="Get personalized insights for your farm" />
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />

                  <Input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />

                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />

                  <select
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleInputChange}
                    required
                    className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select Farm Size</option>
                    <option value="1-5">1-5 acres</option>
                    <option value="5-20">5-20 acres</option>
                    <option value="20-50">20-50 acres</option>
                    <option value="50+">50+ acres</option>
                  </select>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-green-600 hover:bg-green-700"
                  >
                    <TranslateWrapper text="Book Free Consultation" />
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>
                        <TranslateWrapper text="Free consultation" />
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>
                        <TranslateWrapper text="No commitment" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}