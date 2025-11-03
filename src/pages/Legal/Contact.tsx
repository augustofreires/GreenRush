import { FiMail, FiPhone, FiMessageCircle, FiClock } from 'react-icons/fi';

export const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
            Entre em Contato
          </h1>
          <p className="text-gray-600 text-lg">
            Estamos aqui para ajudar! Utilize um dos nossos canais de atendimento.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Email */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                <FiMail size={32} style={{ color: '#4a9d4e' }} />
              </div>
              <div>
                <h3 className="font-bold text-xl">E-mail</h3>
                <p className="text-sm text-gray-500">Resposta em até 24h</p>
              </div>
            </div>
            <a
              href="mailto:contato@greenrushoficial.com"
              className="text-lg font-semibold hover:underline"
              style={{ color: '#4a9d4e' }}
            >
              contato@greenrushoficial.com
            </a>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                <FiMessageCircle size={32} style={{ color: '#4a9d4e' }} />
              </div>
              <div>
                <h3 className="font-bold text-xl">WhatsApp</h3>
                <p className="text-sm text-gray-500">Atendimento rápido</p>
              </div>
            </div>
            <a
              href="https://wa.me/5519982284846"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold hover:underline"
              style={{ color: '#4a9d4e' }}
            >
              (19) 98228-4846
            </a>
          </div>

          {/* Telefone */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                <FiPhone size={32} style={{ color: '#4a9d4e' }} />
              </div>
              <div>
                <h3 className="font-bold text-xl">Telefone</h3>
                <p className="text-sm text-gray-500">Horário comercial</p>
              </div>
            </div>
            <a
              href="tel:+5519982284846"
              className="text-lg font-semibold hover:underline"
              style={{ color: '#4a9d4e' }}
            >
              (19) 98228-4846
            </a>
          </div>

          {/* Horário */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                <FiClock size={32} style={{ color: '#4a9d4e' }} />
              </div>
              <div>
                <h3 className="font-bold text-xl">Horário</h3>
                <p className="text-sm text-gray-500">Atendimento</p>
              </div>
            </div>
            <div className="text-gray-700 space-y-2">
              <p><strong>Segunda a Sexta:</strong> 9h às 18h</p>
              <p><strong>Sábados:</strong> 9h às 13h</p>
              <p><strong>Domingos:</strong> Fechado</p>
            </div>
          </div>
        </div>

        {/* CTA para FAQ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
            Tem uma dúvida rápida?
          </h3>
          <p className="text-gray-600 mb-6">
            Confira nossas Perguntas Frequentes, a resposta pode estar lá!
          </p>
          <a
            href="/faq"
            className="inline-block px-8 py-3 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: '#4a9d4e' }}
          >
            Ver Perguntas Frequentes
          </a>
        </div>
      </div>
    </div>
  );
};
