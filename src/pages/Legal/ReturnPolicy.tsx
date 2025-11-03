import { FiPackage, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-6" style={{ color: '#4a9d4e' }}>
            Política de Trocas e Devoluções
          </h1>
          
          <p className="text-gray-600 mb-8">
            Na GreenRush, sua satisfação é nossa prioridade. Confira nossa política de trocas e devoluções.
          </p>

          {/* Cards informativos */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="border-2 rounded-lg p-6" style={{ borderColor: '#4a9d4e' }}>
              <FiClock size={32} style={{ color: '#4a9d4e' }} className="mb-3" />
              <h3 className="font-bold text-lg mb-2">Prazo de 7 Dias</h3>
              <p className="text-gray-600 text-sm">
                Você tem 7 dias a partir do recebimento para solicitar troca ou devolução
              </p>
            </div>
            <div className="border-2 rounded-lg p-6" style={{ borderColor: '#4a9d4e' }}>
              <FiPackage size={32} style={{ color: '#4a9d4e' }} className="mb-3" />
              <h3 className="font-bold text-lg mb-2">Produto Lacrado</h3>
              <p className="text-gray-600 text-sm">
                O produto deve estar na embalagem original, lacrado e sem sinais de uso
              </p>
            </div>
          </div>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
                Direito de Arrependimento
              </h2>
              <p>
                De acordo com o Código de Defesa do Consumidor (Art. 49), você tem o direito de desistir da compra no prazo de 7 (sete) dias corridos a contar da data de recebimento do produto, sem necessidade de justificativa.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
                Condições para Troca ou Devolução
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiCheckCircle size={24} style={{ color: '#4a9d4e' }} className="flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Produto Lacrado</h4>
                    <p className="text-gray-600">
                      O produto deve estar em sua embalagem original, lacrado e sem sinais de violação ou uso.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiCheckCircle size={24} style={{ color: '#4a9d4e' }} className="flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Nota Fiscal</h4>
                    <p className="text-gray-600">
                      A nota fiscal ou comprovante de compra deve acompanhar o produto.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiCheckCircle size={24} style={{ color: '#4a9d4e' }} className="flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Prazo</h4>
                    <p className="text-gray-600">
                      A solicitação deve ser feita dentro de 7 dias corridos após o recebimento.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiCheckCircle size={24} style={{ color: '#4a9d4e' }} className="flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Produtos de Higiene Pessoal</h4>
                    <p className="text-gray-600">
                      Por questões de higiene e segurança, produtos abertos não podem ser trocados ou devolvidos.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
                Como Solicitar Troca ou Devolução
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#4a9d4e' }}>
                      1
                    </div>
                    <h4 className="font-semibold">Entre em Contato</h4>
                  </div>
                  <p className="text-gray-600 ml-11">
                    Envie um e-mail para contato@greenrushoficial.com ou WhatsApp (19) 98228-4846 informando:
                  </p>
                  <ul className="list-disc list-inside ml-11 mt-2 text-gray-600 text-sm space-y-1">
                    <li>Número do pedido</li>
                    <li>Nome completo</li>
                    <li>Motivo da troca/devolução</li>
                    <li>Fotos do produto (se aplicável)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#4a9d4e' }}>
                      2
                    </div>
                    <h4 className="font-semibold">Aguarde Análise</h4>
                  </div>
                  <p className="text-gray-600 ml-11">
                    Nossa equipe analisará sua solicitação em até 48 horas úteis e enviará as instruções de devolução ou troca.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#4a9d4e' }}>
                      3
                    </div>
                    <h4 className="font-semibold">Envie o Produto</h4>
                  </div>
                  <p className="text-gray-600 ml-11">
                    Após a aprovação, você receberá uma etiqueta de postagem ou instruções para devolver o produto. Embale bem o produto com a nota fiscal.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#4a9d4e' }}>
                      4
                    </div>
                    <h4 className="font-semibold">Receba o Reembolso ou Novo Produto</h4>
                  </div>
                  <p className="text-gray-600 ml-11">
                    Após recebermos e analisarmos o produto devolvido, processaremos o reembolso ou enviaremos o novo produto em até 7 dias úteis.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
                Produtos com Defeito ou Avarias
              </h2>
              <p className="mb-4">
                Se você recebeu um produto com defeito, avariado ou diferente do pedido:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Entre em contato imediatamente conosco</li>
                <li>Envie fotos do produto e da embalagem</li>
                <li>Providenciaremos a troca ou reembolso sem custo adicional</li>
                <li>Não é necessário que o produto esteja lacrado neste caso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
                Reembolso
              </h2>
              <p className="mb-4">
                O reembolso será realizado da seguinte forma:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Cartão de Crédito:</strong> Estorno na fatura em até 2 faturas subsequentes</li>
                <li><strong>Pix/Boleto:</strong> Depósito bancário em até 7 dias úteis após análise</li>
              </ul>
              <p className="mt-4">
                O valor do frete não será reembolsado, exceto em casos de defeito ou erro nosso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
                Casos Não Cobertos
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle size={24} className="text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-600">
                      Produtos abertos, usados ou com embalagem violada (exceto se apresentarem defeito)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiAlertCircle size={24} className="text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-600">
                      Solicitações feitas após o prazo de 7 dias
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiAlertCircle size={24} className="text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-600">
                      Produtos danificados por uso inadequado ou negligência do cliente
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiAlertCircle size={24} className="text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-600">
                      Produtos sem nota fiscal ou comprovante de compra
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
                Custos de Envio
              </h2>
              <p>
                O custo de envio para devolução é de responsabilidade do cliente, exceto em casos de produto com defeito, avaria ou erro no envio. Nestes casos, forneceremos uma etiqueta de postagem pré-paga.
              </p>
            </section>

            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
                Dúvidas?
              </h2>
              <p className="mb-4">
                Se tiver qualquer dúvida sobre nossa política de trocas e devoluções, entre em contato:
              </p>
              <ul className="space-y-2">
                <li><strong>E-mail:</strong> contato@greenrushoficial.com</li>
                <li><strong>WhatsApp:</strong> (19) 98228-4846</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
