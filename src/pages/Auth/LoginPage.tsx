import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

      if (isLogin) {
        // Login
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          alert(data.message || 'Erro ao fazer login');
          setLoading(false);
          return;
        }

        // Login bem-sucedido
        login(data.user);
        navigate('/conta');
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          alert('As senhas não coincidem');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          alert('A senha deve ter no mínimo 6 caracteres');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          alert(data.message || 'Erro ao fazer cadastro');
          setLoading(false);
          return;
        }

        // Cadastro bem-sucedido - fazer login automaticamente
        login(data.user);
        alert('Cadastro realizado com sucesso! Bem-vindo(a)!');
        navigate('/conta');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar sua solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(to bottom right, #e8f5e8, #ffffff)' }}>
      <div className="container mx-auto max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold" style={{ color: '#4a9d4e' }}>
              Green<span style={{ color: '#2c5f2d' }}>Rush</span>
            </h1>
          </Link>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              style={isLogin ? { backgroundColor: '#4a9d4e', color: '#ffffff' } : {}}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                isLogin
                  ? 'shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={!isLogin ? { backgroundColor: '#4a9d4e', color: '#ffffff' } : {}}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                !isLogin
                  ? 'shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name - Only for Register */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder="Seu nome completo"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent"
                />
              </div>
            </div>

            {/* Phone - Only for Register */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder="(00) 00000-0000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent"
                />
              </div>
            </div>

            {/* Confirm Password - Only for Register */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Forgot Password Link - Only for Login */}
            {isLogin && (
              <div className="text-right">
                <Link
                  to="/recuperar-senha"
                  className="text-sm font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: '#4a9d4e' }}
                >
                  Esqueceu a senha?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
              className="w-full py-3 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </button>

            {/* Benefits - Only for Register */}
            {!isLogin && (
              <div className="mt-6 pt-6 border-t space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: '#4a9d4e' }}>✓</span>
                  <span className="text-gray-600">
                    Cupom de 10% de desconto na primeira compra
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: '#4a9d4e' }}>✓</span>
                  <span className="text-gray-600">Acesso a ofertas exclusivas</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: '#4a9d4e' }}>✓</span>
                  <span className="text-gray-600">
                    Acompanhe seus pedidos em tempo real
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Welcome Discount */}
        {!isLogin && (
          <div className="mt-6 p-6 rounded-xl text-center shadow-lg" style={{ background: 'linear-gradient(to right, #4a9d4e, #2c5f2d)', color: '#ffffff' }}>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>🎉 Bem-vindo(a)!</h3>
            <p className="text-sm mb-3" style={{ color: '#ffffff' }}>
              Ganhe 10% OFF na sua primeira compra com o cupom:
            </p>
            <div className="font-bold text-lg py-3 px-6 rounded-lg inline-block shadow-md" style={{ backgroundColor: '#ffffff', color: '#4a9d4e' }}>
              BEMVINDO10
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm transition-colors hover:opacity-70"
            style={{ color: '#6b7280' }}
          >
            ← Voltar para a loja
          </Link>
        </div>
      </div>
    </div>
  );
};
