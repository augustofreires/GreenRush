import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SideCart } from '../Cart/SideCart';

export const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsCount = useCartStore((state) => state.getItemsCount());
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const { isAuthenticated, user } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar - Promoção */}
      <div className="bg-primary-green text-white text-center py-2 px-4 text-sm" style={{ backgroundColor: '#4a9d4e', color: '#FFFFFF' }}>
        <p className="font-medium">🎁 Todo o site com Frete GRÁTIS | Primeira compra? Use o cupom BEMVINDO10 e ganhe 10% OFF!</p>
      </div>

      {/* Main Header - Tudo em uma linha */}
      <div className="border-b" style={{ background: 'linear-gradient(to bottom, #ffffff, #f8fdf9)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="/logo-green-rush.webp"
                alt="GreenRush"
                width="75"
                height="40"
                className="h-10 w-auto object-contain"
                fetchPriority="high"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <a
                href="https://www.greenrushoficial.com/"
                className="relative px-4 py-2 rounded-lg font-semibold text-gray-700 hover:text-white transition-all group overflow-hidden text-sm"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" style={{ backgroundColor: '#4a9d4e' }}></span>
                <span className="relative z-10 group-hover:text-white transition-colors">Início</span>
              </a>
              <a
                href="https://www.greenrushoficial.com/cinta-modeladora"
                className="relative px-4 py-2 rounded-lg font-semibold text-gray-700 hover:text-white transition-all group overflow-hidden text-sm"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" style={{ backgroundColor: '#4a9d4e' }}></span>
                <span className="relative z-10 group-hover:text-white transition-colors">Modeladores</span>
              </a>
              <a
                href="https://www.greenrushoficial.com/cha"
                className="relative px-4 py-2 rounded-lg font-semibold text-gray-700 hover:text-white transition-all group overflow-hidden text-sm"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" style={{ backgroundColor: '#4a9d4e' }}></span>
                <span className="relative z-10 group-hover:text-white transition-colors">Chá Detox</span>
              </a>
              <a
                href="https://www.greenrushoficial.com/capsulas"
                className="relative px-4 py-2 rounded-lg font-semibold text-gray-700 hover:text-white transition-all group overflow-hidden text-sm"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" style={{ backgroundColor: '#4a9d4e' }}></span>
                <span className="relative z-10 group-hover:text-white transition-colors">Cápsulas</span>
              </a>
              <a
                href="https://www.greenrushoficial.com/slimshot"
                className="relative px-4 py-2 rounded-lg font-semibold text-gray-700 hover:text-white transition-all group overflow-hidden text-sm"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" style={{ backgroundColor: '#4a9d4e' }}></span>
                <span className="relative z-10 group-hover:text-white transition-colors">Vinagre de maçã</span>
              </a>
              <a
                href="https://www.greenrushoficial.com/blog"
                className="relative px-4 py-2 rounded-lg font-semibold text-gray-700 hover:text-white transition-all group overflow-hidden text-sm"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg" style={{ backgroundColor: '#4a9d4e' }}></span>
                <span className="relative z-10 group-hover:text-white transition-colors">Blog</span>
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hidden md:block text-gray-700 hover:text-primary-green transition-colors"
                style={isSearchOpen ? { color: '#4a9d4e' } : {}}
              >
                <FiSearch size={22} />
              </button>

              {/* User */}
              <Link
                to={isAuthenticated ? '/conta' : '/login'}
                className="hidden md:flex items-center gap-2 hover:text-primary-green transition-colors"
              >
                <FiUser size={22} />
                <span className="text-sm font-medium">
                  {isAuthenticated ? user?.name?.split(' ')[0] : 'Entrar'}
                </span>
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative hover:text-primary-green transition-colors"
              >
                <FiShoppingCart size={24} />
                {itemsCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
                    style={{ backgroundColor: '#4a9d4e', color: '#FFFFFF' }}
                  >
                    {itemsCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-gray-700 hover:text-primary-green"
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Search Bar Expandida - Desktop */}
          {isSearchOpen && (
            <div className="hidden md:block pb-3">
              <form onSubmit={handleSearch}>
                <div className="relative max-w-2xl mx-auto">
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full px-4 py-2.5 pr-10 border-2 rounded-lg focus:outline-none focus:border-transparent"
                    style={{ borderColor: '#4a9d4e' }}
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#4a9d4e' }}
                  >
                    <FiSearch size={20} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="lg:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {/* Search Mobile */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: '#4a9d4e' }}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#4a9d4e' }}
                >
                  <FiSearch size={20} />
                </button>
              </div>
            </form>

            {/* Menu Items */}
            <a
              href="https://www.greenrushoficial.com/"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg font-semibold text-gray-700 hover:text-white transition-all"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a9d4e';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '';
              }}
            >
              Início
            </a>
            <a
              href="https://www.greenrushoficial.com/cinta-modeladora"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg font-semibold text-gray-700 hover:text-white transition-all"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a9d4e';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '';
              }}
            >
              Modeladores
            </a>
            <a
              href="https://www.greenrushoficial.com/cha"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg font-semibold text-gray-700 hover:text-white transition-all"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a9d4e';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '';
              }}
            >
              Chá Detox
            </a>
            <a
              href="https://www.greenrushoficial.com/capsulas"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg font-semibold text-gray-700 hover:text-white transition-all"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a9d4e';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '';
              }}
            >
              Cápsulas
            </a>
            <a
              href="https://www.greenrushoficial.com/slimshot"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg font-semibold text-gray-700 hover:text-white transition-all"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a9d4e';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '';
              }}
            >
              Vinagre de maçã
            </a>
            <a
              href="https://www.greenrushoficial.com/blog"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg font-semibold text-gray-700 hover:text-white transition-all"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a9d4e';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '';
              }}
            >
              Blog
            </a>
            <div className="pt-4 border-t">
              {isAuthenticated ? (
                <Link
                  to="/conta"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 py-3 px-4 rounded-lg font-semibold text-gray-700 hover:text-white transition-all"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4a9d4e';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '';
                  }}
                >
                  <FiUser size={20} />
                  Minha Conta
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 py-3 px-4 rounded-lg font-semibold text-gray-700 hover:text-white transition-all"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4a9d4e';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '';
                  }}
                >
                  <FiUser size={20} />
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Side Cart */}
      <SideCart isOpen={isCartOpen} onClose={closeCart} />
    </header>
  );
};
