import { Header } from "@/components/navigation/header";
import { HeroSection } from "@/components/sections/hero";
import { FeaturesSection } from "@/components/sections/features";
import { BenefitsSection } from "@/components/sections/benefits";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { PricingSection } from "@/components/sections/pricing";
import { FAQSection } from "@/components/sections/faq";
import { ContactSection } from "@/components/sections/contact";

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <ContactSection />
    </main>
  );
}