"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { TranslateWrapper } from "@/components/translate-wrapper";

const plans = [
  {
    name: "Basic",
    price: "₹20",
    description: "Perfect for getting started with smart irrigation",
    features: [
      "Real-time soil moisture monitoring",
      "Basic irrigation control",
      "SMS alerts for moisture levels",
      "Mobile app access",
      "24/7 system monitoring"
    ],
  },
  {
    name: "Pro",
    price: "₹100",
    description: "Great for advanced irrigation needs",
    features: [
      "All Basic features",
      "AI-powered chat assistance",
      "Advanced analytics",
      "Weather integration",
      "Multiple sensor support",
      "Custom alert thresholds"
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "₹350",
    description: "Complete solution for large scale operations",
    features: [
      "All Pro features",
      "All functionalities included",
      "Priority support",
      "Custom integrations",
      "Advanced reporting",
      "Multi-location support",
      "API access"
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-muted/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 inline-block">
            <TranslateWrapper text="Pricing Plans" />
          </span>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-200 dark:to-slate-400">
            <TranslateWrapper text="Simple, Transparent Pricing" />
          </h2>
          <p className="text-lg text-muted-foreground">
            <TranslateWrapper text="Choose the perfect plan for your farming needs. All plans include our core smart irrigation technology." />
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 hover:shadow-xl transition-all duration-300 ${plan.popular
                  ? "ring-2 ring-primary relative scale-105 bg-card/50 backdrop-blur-sm"
                  : "hover:-translate-y-1"
                }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full shadow-lg">
                  <TranslateWrapper text="Most Popular" />
                </span>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2"><TranslateWrapper text={plan.name} /></h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground"><TranslateWrapper text="/month" /></span>
                </div>
                <p className="text-muted-foreground"><TranslateWrapper text={plan.description} /></p>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="rounded-full p-1 bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span><TranslateWrapper text={feature} /></span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full text-lg py-6 ${plan.popular
                    ? "bg-primary hover:bg-primary/90 hover:scale-[1.02] transition-all duration-300"
                    : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                variant={plan.popular ? "default" : "outline"}
              >
                <TranslateWrapper text="Get Started" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}