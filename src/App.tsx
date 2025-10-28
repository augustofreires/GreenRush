import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, Outlet, useLocation } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { PopupNewsletter } from './components/Newsletter/PopupNewsletter';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useNewsletterPopup } from './hooks/useNewsletterPopup';
import { useLoadProducts } from './hooks/useLoadProducts';
import { useLoadBanners } from './hooks/useLoadBanners';
import { useLoadBeforeAfter } from './hooks/useLoadBeforeAfter';
import { useLoadVideoTestimonials } from './hooks/useLoadVideoTestimonials';
import { useLoadCarousel } from './hooks/useLoadCarousel';
import { useAdminAuthStore } from './store/useAdminAuthStore';
import { Home } from './pages/Home/Home';
import { CartPage } from './pages/Cart/CartPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { Blog } from './pages/Blog/Blog';
import { BlogPost } from './pages/Blog/BlogPost';
import { LoginPage } from './pages/Auth/LoginPage';
import { AccountPage } from './pages/Account/AccountPage';
import { ProductDetail } from './pages/Product/ProductDetail';
import { AdminLogin } from './pages/Admin/AdminLogin';
import { AdminDashboard } from './pages/Admin/Dashboard';
import { AdminIntegrations } from './pages/Admin/Integrations';
import { AdminProducts } from './pages/Admin/Products';
import { AdminOrders } from './pages/Admin/Orders';
import { AdminCustomers } from './pages/Admin/Customers';
import { AdminBanners } from './pages/Admin/Banners';
import { AdminBlog } from './pages/Admin/Blog';
import { AdminCategories } from './pages/Admin/Categories';
import { AdminBeforeAfter } from './pages/Admin/BeforeAfter';
import { AdminReviews } from './pages/Admin/Reviews';
import { AdminCoupons } from './pages/Admin/Coupons';
import { AdminLeads } from './pages/Admin/Leads';
import { AdminUsers } from './pages/Admin/Users';
import { ChaLanding } from './pages/LandingPages/ChaLanding';
import { CapsulesLanding } from './pages/LandingPages/CapsulesLanding';
import { SlimShotLanding } from './pages/LandingPages/SlimShotLanding';
import { CintaLanding } from './pages/LandingPages/CintaLanding';
import { CombosLanding } from './pages/LandingPages/CombosLanding';
import { CarouselImages } from './pages/Admin/CarouselImages';
import { TestimonialsVideo } from './pages/Admin/TestimonialsVideo';
import { Settings } from './pages/Admin/Settings';
import { OrderTracking } from './pages/Tracking/OrderTracking';
import { ProductsPage } from './pages/Products/ProductsPage';
import { OrderConfirmation } from './pages/Order/OrderConfirmation';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log('🔄 Rota mudou para:', pathname);
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  // Carregar todos os dados do MySQL ao iniciar
  useLoadProducts();
  useLoadBanners();
  useLoadBeforeAfter();
  useLoadVideoTestimonials();
  useLoadCarousel();

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes with Header/Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/conta" element={<AccountPage />} />
          <Route path="/produto/:slug" element={<ProductDetail />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/rastreamento" element={<OrderTracking />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/pedido/:orderId/confirmacao" element={<OrderConfirmation />} />

          {/* Landing Pages */}
          <Route path="/cha" element={<ChaLanding />} />
          <Route path="/capsulas" element={<CapsulesLanding />} />
          <Route path="/slimshot" element={<SlimShotLanding />} />
          <Route path="/cinta-modeladora" element={<CintaLanding />} />
          <Route path="/combos" element={<CombosLanding />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="produtos" element={<AdminProducts />} />
          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="clientes" element={<AdminCustomers />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="categorias" element={<AdminCategories />} />
          <Route path="avaliacoes" element={<AdminReviews />} />
          <Route path="cupons" element={<AdminCoupons />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="antes-depois" element={<AdminBeforeAfter />} />
          <Route path="quem-usou-amou" element={<TestimonialsVideo />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="integracoes" element={<AdminIntegrations />} />
          <Route path="carrossel" element={<CarouselImages />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Public Layout with Header and Footer
function PublicLayout() {
  const location = useLocation();
  const { isOpen, closePopup } = useNewsletterPopup();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet key={location.pathname} />
      </main>
      <Footer />

      {/* Newsletter Popup */}
      <PopupNewsletter isOpen={isOpen} onClose={closePopup} />
    </div>
  );
}

// Admin Layout with Sidebar
function AdminLayout() {
  const location = useLocation();
  const { logout } = useAdminAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold">
            Green<span className="text-primary-green">Rush</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </div>
        <nav className="mt-6">
          <Link
            to="/admin"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/produtos"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Produtos
          </Link>
          <Link
            to="/admin/pedidos"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Pedidos
          </Link>
          <Link
            to="/admin/clientes"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Clientes
          </Link>
          <Link
            to="/admin/usuarios"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Usuários Cadastrados
          </Link>
          <Link
            to="/admin/leads"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Leads Newsletter
          </Link>
          <Link
            to="/admin/categorias"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Categorias
          </Link>
          <Link
            to="/admin/avaliacoes"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Avaliações
          </Link>
          <Link
            to="/admin/cupons"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Cupons
          </Link>
          <Link
            to="/admin/banners"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Banners
          </Link>
          <Link
            to="/admin/antes-depois"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Antes e Depois
          </Link>
          <Link
            to="/admin/quem-usou-amou"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Quem Usou, Amou!
          </Link>
          <Link
            to="/admin/blog"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Blog
          </Link>
          <Link
            to="/admin/carrossel"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Carrossel Landing Pages
          </Link>
          <Link
            to="/admin/configuracoes"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Configurações
          </Link>
          <Link
            to="/admin/integracoes"
            className="block px-6 py-3 hover:bg-gray-800 transition-colors"
          >
            Integrações
          </Link>
          <div className="border-t border-gray-800 mt-6 pt-6">
            <Link
              to="/"
              className="block px-6 py-3 hover:bg-gray-800 transition-colors text-gray-400"
            >
              ← Voltar ao Site
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-6 py-3 hover:bg-gray-800 transition-colors text-red-400 hover:text-red-300"
            >
              🚪 Sair
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}

export default App;
