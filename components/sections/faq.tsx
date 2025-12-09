"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TranslateWrapper } from "@/components/translate-wrapper";

const faqs = [
  {
    question: "How does E-Bhoomi's AI technology work?",
    answer:
      "Our AI analyzes data from IoT sensors, weather stations, and satellite imagery to provide personalized recommendations for your farm. It considers factors like soil conditions, crop type, weather patterns, and historical data to optimize farming decisions.",
  },
  {
    question: "What equipment do I need to get started?",
    answer:
      "E-Bhoomi provides a complete IoT sensor kit including soil moisture sensors, weather stations, and pH monitors. We also include a central hub that connects to your internet. Our team handles the complete installation and setup.",
  },
  {
    question: "Is there a mobile app available?",
    answer:
      "Yes! Our mobile app is available for both Android and iOS devices. You can monitor your farm, receive alerts, view reports, and control irrigation systems directly from your smartphone.",
  },
  {
    question: "How accurate is the disease detection feature?",
    answer:
      "Our disease detection system has a 95% accuracy rate using advanced computer vision and machine learning. It can identify early signs of diseases and pest infestations before they become visible to the naked eye.",
  },
  {
    question: "What kind of support do you provide?",
    answer:
      "We offer 24/7 technical support, regular maintenance visits, training sessions for farmers, and a dedicated agricultural expert assigned to each customer. Our support team includes agronomists and technical specialists.",
  },
  {
    question: "Can E-Bhoomi work with different crop types?",
    answer:
      "Absolutely! E-Bhoomi supports over 50 different crop types including wheat, rice, cotton, sugarcane, vegetables, and fruits. Our AI is trained on diverse agricultural data from across India.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            <TranslateWrapper text="Frequently Asked Questions" />
          </h2>
          <p className="text-lg text-gray-600">
            <TranslateWrapper text="Everything you need to know about E-Bhoomi" />
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-medium text-gray-900 pr-4">
                  <TranslateWrapper text={faq.question} />
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">
                    <TranslateWrapper text={faq.answer} />
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            <TranslateWrapper text="Still have questions? We're here to help." />
          </p>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
            <TranslateWrapper text="Contact Support" />
          </button>
        </div>
      </div>
    </section>
  );
}