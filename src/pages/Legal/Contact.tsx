import { useState } from 'react';
import { FiMail, FiPhone, FiMessageCircle, FiMapPin, FiClock } from 'react-icons/fi';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
            Entre em Contato
          </h1>
          <p className="text-gray-600 text-lg">
            Estamos aqui para ajudar! Envie sua mensagem ou utilize um dos nossos canais de atendimento.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informações de Contato */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                  <FiMail size={24} style={{ color: '#4a9d4e' }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">E-mail</h3>
                  <p className="text-sm text-gray-500">Resposta em até 24h</p>
                </div>
              </div>
              <a
                href="mailto:contato@greenrushoficial.com"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                contato@greenrushoficial.com
              </a>
            </div>

            {/* WhatsApp */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                  <FiMessageCircle size={24} style={{ color: '#4a9d4e' }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">WhatsApp</h3>
                  <p className="text-sm text-gray-500">Atendimento rápido</p>
                </div>
              </div>
              <a
                href="https://wa.me/5519982284846"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                (19) 98228-4846
              </a>
            </div>

            {/* Telefone */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                  <FiPhone size={24} style={{ color: '#4a9d4e' }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Telefone</h3>
                  <p className="text-sm text-gray-500">Horário comercial</p>
                </div>
              </div>
              <a
                href="tel:+5519982284846"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                (19) 98228-4846
              </a>
            </div>

            {/* Horário */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                  <FiClock size={24} style={{ color: '#4a9d4e' }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Horário</h3>
                  <p className="text-sm text-gray-500">Atendimento</p>
                </div>
              </div>
              <div className="text-gray-700 text-sm space-y-1">
                <p><strong>Segunda a Sexta:</strong> 9h às 18h</p>
                <p><strong>Sábados:</strong> 9h às 13h</p>
                <p><strong>Domingos:</strong> Fechado</p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#4a9d4e' }}>
                Envie sua Mensagem
              </h2>

              {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  ✓ Mensagem enviada com sucesso! Entraremos em contato em breve.
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  ✗ Erro ao enviar mensagem. Tente novamente ou entre em contato pelo WhatsApp.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold mb-2 text-gray-700">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-700">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold mb-2 text-gray-700">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold mb-2 text-gray-700">
                      Assunto *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="duvida">Dúvida sobre Produto</option>
                      <option value="pedido">Status do Pedido</option>
                      <option value="troca">Troca ou Devolução</option>
                      <option value="sugestao">Sugestão</option>
                      <option value="reclamacao">Reclamação</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-2 text-gray-700">
                    Mensagem *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Digite sua mensagem..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#4a9d4e' }}
                >
                  {status === 'sending' ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
              </form>
            </div>

            {/* FAQ Link */}
            <div className="mt-6 text-center p-6 bg-gray-100 rounded-lg">
              <p className="text-gray-600 mb-3">
                Tem uma dúvida rápida? Confira nossas Perguntas Frequentes
              </p>
              <a
                href="/faq"
                className="inline-block px-6 py-2 border-2 rounded-lg font-semibold transition-colors"
                style={{ borderColor: '#4a9d4e', color: '#4a9d4e' }}
              >
                Ver Perguntas Frequentes
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
