'use client';

import { useState } from 'react';
import { generateFaqForMunicipality, generateFaqJsonLd, FAQItem } from '@/lib/faqJsonLd';

interface FAQAccordionProps {
  municipalityName: string;
  municipalitySlug: string;
}

export function FAQAccordion({ municipalityName, municipalitySlug }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const faqs = generateFaqForMunicipality(municipalityName, municipalitySlug);

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <>
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFaqJsonLd(municipalityName, municipalitySlug))
        }}
      />
      
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Usein kysytyt kysymykset
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 pr-4">
                    {faq.question}
                  </h3>
                  <div className={`transform transition-transform duration-200 ${
                    openItems.has(index) ? 'rotate-180' : 'rotate-0'
                  }`}>
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openItems.has(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-blue-600 mt-0.5">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Lisätietoja</p>
              <p>
                Jos sinulla on kysymyksiä verotuksesta tai palkanlaskennasta, 
                suosittelemme ottamaan yhteyttä verottajaan tai palkanlaskentaan erikoistuneeseen 
                asiantuntijaan saadaksesi henkilökohtaista neuvontaa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
