import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface PopupNewsletterProps {
  isOpen: boolean;
  onClose: () => void;
}

const COUNTRIES = [
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+1', flag: '🇺🇸', name: 'EUA' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+34', flag: '🇪🇸', name: 'Espanha' },
  { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
  { code: '+49', flag: '🇩🇪', name: 'Alemanha' },
  { code: '+33', flag: '🇫🇷', name: 'França' },
  { code: '+39', flag: '🇮🇹', name: 'Itália' },
];

export const PopupNewsletter = ({ isOpen, onClose }: PopupNewsletterProps) => {
  const [countryCode, setCountryCode] = useState('+55');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format phone number
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !email) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setIsSubmitting(true);

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `${countryCode} ${phone}`,
          email,
          acceptMarketing,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar lead');
      }

      const data = await response.json();
      console.log('[Newsletter] Lead salvo com sucesso:', data);

      // Close popup and save to localStorage
      localStorage.setItem('newsletter-popup-submitted', 'true');
      onClose();

      // Show success message
      alert('Cadastro realizado! Você ganhou 10% OFF na primeira compra!');
    } catch (error) {
      console.error('[Newsletter] Erro ao salvar:', error);
      alert('Erro ao processar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scaleIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <FiX size={28} />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Left side - Form */}
          <div className="p-6 md:p-8 flex flex-col justify-center bg-gradient-to-br from-green-50 to-white">
            {/* Logo */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-primary-green">GreenRush</h2>
            </div>

            {/* Title */}
            <h3 className="text-3xl md:text-4xl font-bold text-primary-green mb-1">
              GANHE 10% OFF
            </h3>
            <p className="text-base text-gray-600 mb-6">
              Na sua primeira compra
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Phone input */}
              <div className="relative flex gap-2">
                {/* Country selector */}
                <div className="relative">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-3 rounded-full border-2 border-green-200 focus:border-primary-green focus:outline-none text-sm bg-white cursor-pointer"
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>

                {/* Phone number */}
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Digite seu melhor número"
                  className="flex-1 px-4 py-3 rounded-full border-2 border-green-200 focus:border-primary-green focus:outline-none text-sm"
                  maxLength={15}
                />
              </div>

              {/* Email input */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu melhor e-mail"
                  className="w-full px-5 py-3 rounded-full border-2 border-green-200 focus:border-primary-green focus:outline-none text-sm"
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={acceptMarketing}
                  onChange={(e) => setAcceptMarketing(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green"
                />
                <label htmlFor="marketing" className="text-xs text-gray-700 leading-tight">
                  Marque esta caixa para receber mensagens de marketing promocional.
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-green hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md"
                style={{ backgroundColor: '#84cc16', color: '#ffffff' }}
              >
                {isSubmitting ? (
                  'PROCESSANDO...'
                ) : (
                  <>
                    → CONFIRMAR
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right side - Image */}
          <div className="hidden md:block relative overflow-hidden">
            <img
              src="/newsletter-cinta.png"
              alt="Cinta Modeladora GreenRush"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
