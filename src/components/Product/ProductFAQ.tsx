import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { ProductFAQ as FAQ } from '../../types';

interface ProductFAQProps {
  faqs: FAQ[];
}

export const ProductFAQ = ({ faqs }: ProductFAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Perguntas Frequentes</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-semibold text-gray-900 text-left">
                {faq.question}
              </span>
              {openIndex === index ? (
                <FiChevronUp className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <FiChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 py-4 bg-white">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
