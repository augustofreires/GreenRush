import { FiTarget, FiHeart, FiAward, FiShield } from 'react-icons/fi';

export const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#4a9d4e' }}>
            Sobre a GreenRush
          </h1>
          <p className="text-xl text-gray-600">
            Transformando vidas através do emagrecimento natural e saudável
          </p>
        </div>

        {/* Nossa História */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 mb-8">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#4a9d4e' }}>
            Nossa História
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              A <strong>GreenRush</strong> nasceu da paixão por promover saúde, bem-estar e autoestima através de produtos naturais de alta qualidade. Acreditamos que o emagrecimento saudável vai muito além de números na balança – é sobre sentir-se bem consigo mesmo, ter mais energia e viver com mais qualidade de vida.
            </p>
            <p>
              Nossa missão é oferecer soluções naturais, eficazes e acessíveis para quem busca transformar o corpo e a mente. Cada produto em nosso catálogo é cuidadosamente selecionado, testado e aprovado, garantindo que você receba apenas o melhor.
            </p>
            <p>
              Trabalhamos com ingredientes 100% naturais, seguindo todas as normas da ANVISA e mantendo os mais altos padrões de qualidade. Mais do que vender produtos, queremos fazer parte da sua jornada de transformação.
            </p>
          </div>
        </div>

        {/* Valores */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                <FiTarget size={24} style={{ color: '#4a9d4e' }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: '#4a9d4e' }}>Nossa Missão</h3>
            </div>
            <p className="text-gray-700">
              Proporcionar soluções naturais e eficazes para o emagrecimento saudável, ajudando pessoas a alcançarem seus objetivos com qualidade, segurança e confiança.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                <FiHeart size={24} style={{ color: '#4a9d4e' }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: '#4a9d4e' }}>Nossa Visão</h3>
            </div>
            <p className="text-gray-700">
              Ser referência nacional em produtos naturais para emagrecimento, reconhecida pela qualidade, inovação e compromisso com o bem-estar dos nossos clientes.
            </p>
          </div>
        </div>

        {/* Diferenciais */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 mb-8">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#4a9d4e' }}>
            Por que Escolher a GreenRush?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                  <FiShield size={24} style={{ color: '#4a9d4e' }} />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2" style={{ color: '#4a9d4e' }}>
                  Produtos 100% Naturais
                </h4>
                <p className="text-gray-700">
                  Todos os nossos produtos são compostos por ingredientes naturais, livres de substâncias prejudiciais à saúde.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                  <FiAward size={24} style={{ color: '#4a9d4e' }} />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2" style={{ color: '#4a9d4e' }}>
                  Qualidade Garantida
                </h4>
                <p className="text-gray-700">
                  Seguimos rigorosamente as normas da ANVISA e trabalhamos apenas com fornecedores certificados.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                  <FiHeart size={24} style={{ color: '#4a9d4e' }} />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2" style={{ color: '#4a9d4e' }}>
                  Atendimento Humanizado
                </h4>
                <p className="text-gray-700">
                  Nossa equipe está pronta para ajudar você em cada etapa da sua jornada de transformação.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                  <FiTarget size={24} style={{ color: '#4a9d4e' }} />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2" style={{ color: '#4a9d4e' }}>
                  Resultados Reais
                </h4>
                <p className="text-gray-700">
                  Milhares de clientes satisfeitos que alcançaram seus objetivos com nossos produtos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nossos Produtos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 mb-8">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#4a9d4e' }}>
            Nossos Produtos
          </h2>
          <div className="space-y-6 text-gray-700">
            <div>
              <h4 className="font-bold text-lg mb-2" style={{ color: '#4a9d4e' }}>
                Cintas Modeladoras
              </h4>
              <p>
                Tecnologia e conforto para modelar o corpo, melhorar a postura e proporcionar autoconfiança no dia a dia.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2" style={{ color: '#4a9d4e' }}>
                Vinagre de Maçã (SlimShot)
              </h4>
              <p>
                Potente aliado para acelerar o metabolismo, controlar o apetite e promover o emagrecimento saudável.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2" style={{ color: '#4a9d4e' }}>
                Chás Detox
              </h4>
              <p>
                Blends naturais que ajudam a eliminar toxinas, reduzir o inchaço e promover o bem-estar digestivo.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2" style={{ color: '#4a9d4e' }}>
                Cápsulas GreenRush
              </h4>
              <p>
                Fórmulas exclusivas com ingredientes naturais para potencializar a queima de gordura e aumentar a energia.
              </p>
            </div>
          </div>
        </div>

        {/* Compromisso */}
        <div className="rounded-lg p-8 md:p-12 text-center text-white" style={{ background: 'linear-gradient(135deg, #4a9d4e 0%, #2d7a3d 100%)' }}>
          <h2 className="text-3xl font-bold mb-4">
            Nosso Compromisso com Você
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Na GreenRush, seu sucesso é o nosso sucesso. Estamos comprometidos em oferecer não apenas produtos de qualidade, mas também suporte, informação e inspiração para sua jornada de transformação.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/produtos"
              className="px-8 py-3 bg-white rounded-lg font-semibold transition-colors hover:bg-gray-100"
              style={{ color: '#4a9d4e' }}
            >
              Conheça Nossos Produtos
            </a>
            <a
              href="/contato"
              className="px-8 py-3 border-2 border-white rounded-lg font-semibold transition-colors hover:bg-white hover:bg-opacity-10"
            >
              Entre em Contato
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
