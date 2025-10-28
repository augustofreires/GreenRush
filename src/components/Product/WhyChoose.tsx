import { FiCheckCircle } from 'react-icons/fi';

interface WhyChooseProps {
  reasons: string[];
}

export const WhyChoose = ({ reasons }: WhyChooseProps) => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Por que Escolher?</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {reasons.map((reason, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex-shrink-0">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="font-medium text-gray-900">{reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
