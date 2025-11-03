import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Como faço um pedido?',
    answer: 'Navegue pelos nossos produtos, adicione ao carrinho os itens desejados e clique no ícone do carrinho para finalizar a compra. Preencha seus dados e escolha a forma de pagamento.'
  },
  {
    question: 'Quais são as formas de pagamento?',
    answer: 'Aceitamos Pix e cartão de crédito (até 12x). O pagamento é 100% seguro e processado através da plataforma AppMax.'
  },
  {
    question: 'Qual o prazo de entrega?',
    answer: 'O prazo varia de acordo com sua região. Geralmente, as entregas são realizadas entre 7 a 15 dias úteis após a confirmação do pagamento. Você receberá o código de rastreamento por e-mail.'
  },
  {
    question: 'O frete é grátis?',
    answer: 'Sim! Todo o site tem frete GRÁTIS para todas as regiões do Brasil.'
  },
  {
    question: 'Como faço para rastrear meu pedido?',
    answer: 'Após a confirmação do pagamento, você receberá um código de rastreamento por e-mail. Você também pode acompanhar seu pedido na área "Minha Conta" em "Meus Pedidos".'
  },
  {
    question: 'Os produtos são naturais?',
    answer: 'Sim! Todos os nossos produtos são compostos por ingredientes naturais, selecionados para promover o emagrecimento saudável e o bem-estar.'
  },
  {
    question: 'Posso trocar ou devolver um produto?',
    answer: 'Sim. Você tem 7 dias a partir do recebimento para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor. O produto deve estar lacrado e sem uso. Consulte nossa política de trocas e devoluções para mais detalhes.'
  },
  {
    question: 'Como funciona o cupom de desconto?',
    answer: 'Ao adicionar produtos ao carrinho, você verá um campo para inserir o cupom. Digite o código e clique em "Aplicar". O desconto será aplicado automaticamente no total da compra. Primeira compra? Use o cupom BEMVINDO10 e ganhe 10% OFF!'
  },
  {
    question: 'Os produtos têm contraindicação?',
    answer: 'Nossos produtos são naturais, mas recomendamos consultar um médico antes de iniciar o uso, especialmente se você estiver grávida, amamentando, ou fazendo uso de medicamentos contínuos.'
  },
  {
    question: 'Como entro em contato com o suporte?',
    answer: 'Você pode nos contatar pelo e-mail contato@greenrushoficial.com ou pelo WhatsApp (19) 98228-4846. Estamos prontos para ajudar!'
  },
  {
    question: 'Posso parcelar minha compra?',
    answer: 'Sim! Aceitamos parcelamento em até 12x no cartão de crédito. As parcelas de 1x a 3x são sem juros. De 4x a 12x há incidência de juros.'
  },
  {
    question: 'Vocês vendem em lojas físicas?',
    answer: 'No momento, trabalhamos apenas com vendas online através do nosso site oficial. Isso nos permite oferecer preços mais competitivos e frete grátis.'
  },
  {
    question: 'Quanto tempo leva para ver resultados?',
    answer: 'Os resultados variam de pessoa para pessoa, mas geralmente começam a ser percebidos nas primeiras 2 a 4 semanas de uso contínuo, aliado a uma alimentação equilibrada e atividades físicas.'
  },
  {
    question: 'Posso usar mais de um produto ao mesmo tempo?',
    answer: 'Sim! Nossos produtos podem ser combinados para potencializar os resultados. Recomendamos seguir as instruções de uso de cada produto.'
  }
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
            Perguntas Frequentes
          </h1>
          <p className="text-gray-600 text-lg">
            Encontre respostas para as dúvidas mais comuns sobre nossos produtos e serviços
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                {openIndex === index ? (
                  <FiChevronUp size={24} style={{ color: '#4a9d4e' }} className="flex-shrink-0" />
                ) : (
                  <FiChevronDown size={24} className="text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
            Não encontrou sua resposta?
          </h3>
          <p className="text-gray-600 mb-6">
            Entre em contato conosco que teremos prazer em ajudar!
          </p>
          <div className="flex justify-center">
            <a
              href="https://wa.me/5519982284846"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg font-semibold transition-colors text-white"
              style={{ backgroundColor: '#4a9d4e' }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
