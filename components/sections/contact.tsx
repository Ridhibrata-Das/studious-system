"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import { TranslateWrapper } from "@/components/translate-wrapper";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    value: "+91 97733557339",
    href: "tel:+919773357339",
  },
  {
    icon: Mail,
    title: "Email",
    value: "ridhibratadas@gmail.com",
    href: "mailto:ridhibratadas@gmail.com",
  },
  {
    icon: MapPin,
    title: "Address",
    value: "Kolkata, West Bengal, India",
    href: "https://maps.google.com/?q=Kolkata,West+Bengal,India",
  },
];

export function ContactSection() {
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0))]" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 inline-block">
            <TranslateWrapper text="Contact Us" />
          </span>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-200 dark:to-slate-400">
            <TranslateWrapper text="Get in Touch" />
          </h2>
          <p className="text-lg text-muted-foreground">
            <TranslateWrapper text="Have questions about our smart irrigation system? We're here to help you optimize your farming operations." />
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="grid gap-8">
              {contactInfo.map((method) => (
                <Card key={method.title} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                      <method.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1"><TranslateWrapper text={method.title} /></h3>
                      <p className="text-muted-foreground mb-2">
                        {method.value}
                      </p>
                      <a href={method.href} className="font-medium text-primary hover:text-primary/80 transition-colors">
                        {method.value}
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="first-name">
                    <TranslateWrapper text="First name" />
                  </label>
                  <Input
                    id="first-name"
                    placeholder="John"
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="last-name">
                    <TranslateWrapper text="Last name" />
                  </label>
                  <Input
                    id="last-name"
                    placeholder="Doe"
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  <TranslateWrapper text="Email" />
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="phone">
                  <TranslateWrapper text="Phone" />
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="message">
                  <TranslateWrapper text="Message" />
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your farming operation and needs..."
                  rows={4}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button type="submit" className="w-full text-lg py-6 hover:scale-[1.02] transition-transform duration-300">
                <TranslateWrapper text="Send Message" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}