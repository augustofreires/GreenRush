import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiMail, FiPhone } from 'react-icons/fi';

export const Footer = () => {
  return (
    <footer className="text-gray-300" style={{ backgroundColor: '#2c5f2d' }}>
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sobre */}
          <div>
            <div className="mb-4">
              <img
                src="/logo-green-rush.webp"
                alt="GreenRush"
                width="75"
                height="40"
                className="h-10 w-auto object-contain"
                loading="lazy"
              />
            </div>
            <p className="text-sm mb-4">
              Produtos naturais para emagrecimento saudável e bem-estar.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-green transition-colors"
              >
                <FiInstagram size={24} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-green transition-colors"
              >
                <FiFacebook size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-green transition-colors"
              >
                <FiTwitter size={24} />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/sobre" className="hover:text-primary-green transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/produtos" className="hover:text-primary-green transition-colors">
                  Produtos
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary-green transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-primary-green transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h4 className="text-white font-semibold mb-4">Atendimento</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="hover:text-primary-green transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidade" className="hover:text-primary-green transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos-uso" className="hover:text-primary-green transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/trocas-devolucoes" className="hover:text-primary-green transition-colors">
                  Trocas e Devoluções
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <FiMail size={18} />
                <a
                  href="mailto:contato@greenrush.com.br"
                  className="hover:text-primary-green transition-colors"
                >
                  contato@greenrush.com.br
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone size={18} />
                <a
                  href="tel:+5511999999999"
                  className="hover:text-primary-green transition-colors"
                >
                  (11) 99999-9999
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h5 className="text-white font-semibold mb-2">Newsletter</h5>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-primary-green text-sm"
                />
                <button className="btn-primary text-sm">
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; 2025 GreenRush. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <img
                src="/images/payment-methods.png"
                alt="Formas de pagamento"
                width="160"
                height="32"
                className="h-8"
                loading="lazy"
              />
              <span className="text-primary-green font-semibold">
                🔒 Compra 100% Segura
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
