import { useEffect, lazy, Suspense } from 'react';
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

// Lazy loading para TODAS as páginas - reduz bundle inicial drasticamente
// Como as páginas usam named exports, precisamos fazer o wrapper para default
const Home = lazy(() => import('./pages/Home/Home').then(m => ({ default: m.Home })));
const CartPage = lazy(() => import('./pages/Cart/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/Checkout/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const Blog = lazy(() => import('./pages/Blog/Blog').then(m => ({ default: m.Blog })));
const BlogPost = lazy(() => import('./pages/Blog/BlogPost').then(m => ({ default: m.BlogPost })));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage').then(m => ({ default: m.LoginPage })));
const AccountPage = lazy(() => import('./pages/Account/AccountPage').then(m => ({ default: m.AccountPage })));
const ProductDetail = lazy(() => import('./pages/Product/ProductDetail').then(m => ({ default: m.ProductDetail })));
const OrderTracking = lazy(() => import('./pages/Tracking/OrderTracking').then(m => ({ default: m.OrderTracking })));
const ProductsPage = lazy(() => import('./pages/Products/ProductsPage').then(m => ({ default: m.ProductsPage })));
const OrderConfirmation = lazy(() => import('./pages/Order/OrderConfirmation').then(m => ({ default: m.OrderConfirmation })));

// Landing Pages
const ChaLanding = lazy(() => import('./pages/LandingPages/ChaLanding').then(m => ({ default: m.ChaLanding })));
const CapsulesLanding = lazy(() => import('./pages/LandingPages/CapsulesLanding').then(m => ({ default: m.CapsulesLanding })));
const SlimShotLanding = lazy(() => import('./pages/LandingPages/SlimShotLanding').then(m => ({ default: m.SlimShotLanding })));
const CintaLanding = lazy(() => import('./pages/LandingPages/CintaLanding').then(m => ({ default: m.CintaLanding })));
const CombosLanding = lazy(() => import('./pages/LandingPages/CombosLanding').then(m => ({ default: m.CombosLanding })));

// Admin Pages - só carrega quando acessar admin
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const AdminIntegrations = lazy(() => import('./pages/Admin/Integrations').then(m => ({ default: m.AdminIntegrations })));
const AdminProducts = lazy(() => import('./pages/Admin/Products').then(m => ({ default: m.AdminProducts })));
const AdminOrders = lazy(() => import('./pages/Admin/Orders').then(m => ({ default: m.AdminOrders })));
const AdminCustomers = lazy(() => import('./pages/Admin/Customers').then(m => ({ default: m.AdminCustomers })));
const AdminBanners = lazy(() => import('./pages/Admin/Banners').then(m => ({ default: m.AdminBanners })));
const AdminBlog = lazy(() => import('./pages/Admin/Blog').then(m => ({ default: m.AdminBlog })));
const AdminCategories = lazy(() => import('./pages/Admin/Categories').then(m => ({ default: m.AdminCategories })));
const AdminBeforeAfter = lazy(() => import('./pages/Admin/BeforeAfter').then(m => ({ default: m.AdminBeforeAfter })));
const AdminReviews = lazy(() => import('./pages/Admin/Reviews').then(m => ({ default: m.AdminReviews })));
const AdminCoupons = lazy(() => import('./pages/Admin/Coupons').then(m => ({ default: m.AdminCoupons })));
const AdminLeads = lazy(() => import('./pages/Admin/Leads').then(m => ({ default: m.AdminLeads })));
const AdminUsers = lazy(() => import('./pages/Admin/Users').then(m => ({ default: m.AdminUsers })));
const CarouselImages = lazy(() => import('./pages/Admin/CarouselImages').then(m => ({ default: m.CarouselImages })));
const TestimonialsVideo = lazy(() => import('./pages/Admin/TestimonialsVideo').then(m => ({ default: m.TestimonialsVideo })));
const Settings = lazy(() => import('./pages/Admin/Settings').then(m => ({ default: m.Settings })));

// Loading component para Suspense
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm">Carregando...</p>
      </div>
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
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
        <Suspense fallback={<PageLoader />}>
          <Outlet key={location.pathname} />
        </Suspense>
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
        <Suspense fallback={<PageLoader />}>
          <Outlet key={location.pathname} />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
