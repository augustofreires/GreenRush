import { useState, useEffect } from 'react';
import { FiImage, FiUpload, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { useBannerStore } from '../../store/useBannerStore';
import type { Banner } from '../../store/useBannerStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const AdminBanners = () => {
  const { banners, setBanners, addBanner, updateBanner, deleteBanner } = useBannerStore();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    image: '',
    mobileImage: '',
    link: '',
    buttonText: '',
    active: true,
  });

  // Carregar banners da API ao montar
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/banners`);
        const data = await response.json();

        // Converter is_active para active e position para order
        const formattedBanners = data.map((banner: any) => ({
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle,
          image: banner.image,
          mobileImage: banner.mobile_image,
          link: banner.link,
          buttonText: banner.button_text,
          order: banner.position,
          active: Boolean(banner.is_active)
        }));

        setBanners(formattedBanners);
      } catch (error) {
        console.error('Erro ao carregar banners:', error);
      }
    };

    fetchBanners();
  }, [setBanners]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        console.log(`📤 Fazendo upload da imagem ${type}...`);

        // Criar FormData para enviar arquivo
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', 'greenrush/banners');

        // Fazer upload para Cloudinary via API
        const response = await fetch(`${API_URL}/upload/image`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Erro no upload da imagem');
        }

        const result = await response.json();
        console.log('✅ Upload concluído:', result.url);

        // Salvar URL do Cloudinary no estado
        if (type === 'desktop') {
          setNewBanner({ ...newBanner, image: result.url });
        } else {
          setNewBanner({ ...newBanner, mobileImage: result.url });
        }
      } catch (error) {
        console.error('❌ Erro no upload:', error);
        alert('Erro ao fazer upload da imagem. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddBanner = async () => {
    if (newBanner.title && newBanner.image) {
      setLoading(true);
      try {
        console.log('📤 Enviando banner para API...', { title: newBanner.title });

        // Salvar na API
        const response = await fetch(`${API_URL}/banners`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newBanner.title,
            subtitle: newBanner.subtitle,
            image: newBanner.image,
            mobileImage: newBanner.mobileImage,
            link: newBanner.link,
            buttonText: newBanner.buttonText,
            position: banners.length + 1
          })
        });

        let result;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.error('❌ Resposta não é JSON:', text.substring(0, 200));
          throw new Error('Servidor retornou resposta inválida');
        }

        console.log('📥 Resposta da API:', result);

        if (response.ok) {
          // Atualizar localStorage também
          const banner: Banner = {
            id: result.id,
            title: newBanner.title,
            subtitle: newBanner.subtitle,
            image: newBanner.image,
            link: newBanner.link,
            buttonText: newBanner.buttonText,
            order: banners.length + 1,
            active: newBanner.active
          };
          addBanner(banner);

          setNewBanner({ title: '', subtitle: '', image: '', mobileImage: '', link: '', buttonText: '', active: true });
          setShowModal(false);
          alert('✅ Banner adicionado e salvo no banco de dados!');

          // Recarregar página para sincronizar com MySQL
          window.location.reload();
        } else {
          console.error('❌ Erro na resposta:', result);
          alert('Erro ao adicionar banner: ' + (result.error?.message || 'Erro desconhecido'));
        }
      } catch (error) {
        console.error('❌ Erro ao adicionar banner:', error);
        alert('Erro ao adicionar banner: ' + error);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleBannerStatus = async (id: string) => {
    const banner = banners.find(b => b.id === id);
    if (banner) {
      try {
        console.log('🔄 Atualizando status do banner...', id);

        // Atualizar na API
        const response = await fetch(`${API_URL}/banners/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: banner.title,
            subtitle: banner.subtitle || '',
            image: banner.image,
            mobileImage: banner.mobileImage || '',
            link: banner.link || '',
            buttonText: banner.buttonText || '',
            position: banner.order,
            isActive: !banner.active
          })
        });

        const result = await response.json();
        console.log('📥 Resposta da API:', result);

        if (response.ok) {
          // Atualizar localStorage
          updateBanner(id, { active: !banner.active });

          // Recarregar página para sincronizar
          window.location.reload();
        } else {
          console.error('❌ Erro ao atualizar:', result);
          alert('Erro ao atualizar banner');
        }
      } catch (error) {
        console.error('❌ Erro ao atualizar banner:', error);
        alert('Erro ao atualizar banner: ' + error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este banner?')) {
      try {
        console.log('🗑️ Deletando banner da API...', id);

        // Deletar da API
        const response = await fetch(`${API_URL}/banners/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();
        console.log('📥 Resposta da API:', result);

        if (response.ok) {
          // Deletar do localStorage
          deleteBanner(id);
          alert('✅ Banner deletado do banco de dados!');

          // Recarregar página para sincronizar com MySQL
          window.location.reload();
        } else {
          console.error('❌ Erro ao deletar:', result);
          alert('Erro ao deletar banner: ' + (result.error?.message || 'Erro desconhecido'));
        }
      } catch (error) {
        console.error('❌ Erro ao deletar banner:', error);
        alert('Erro ao deletar banner: ' + error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
            <p className="text-gray-600 mt-2">Gerenciar banners da página inicial</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiUpload />
            Adicionar Banner
          </button>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image Preview */}
                <div className="md:w-1/3 bg-gray-100 relative">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                  {!banner.active && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">Inativo</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{banner.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">Ordem: {banner.order}</p>
                      {banner.link && (
                        <p className="text-sm text-primary-blue mt-1">
                          Link: {banner.link}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        banner.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {banner.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleBannerStatus(banner.id)}
                      className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
                    >
                      {banner.active ? (
                        <>
                          <FiEyeOff size={18} />
                          Desativar
                        </>
                      ) : (
                        <>
                          <FiEye size={18} />
                          Ativar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 size={18} />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {banners.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FiImage size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum banner cadastrado</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 btn-primary"
              >
                Adicionar Primeiro Banner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Banner */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Adicionar Novo Banner</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Título do Banner *
                </label>
                <input
                  type="text"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  placeholder="Ex: Emagreça com Saúde"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                  placeholder="Ex: Produtos 100% naturais"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Desktop Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Imagem Desktop * (1920x600px recomendado)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {newBanner.image ? (
                    <div>
                      <img
                        src={newBanner.image}
                        alt="Preview Desktop"
                        className="max-h-48 mx-auto mb-4 rounded"
                      />
                      <button
                        onClick={() => setNewBanner({ ...newBanner, image: '' })}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remover Imagem
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FiUpload size={40} className="mx-auto text-gray-400 mb-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'desktop')}
                        className="block w-full text-sm text-gray-500 mx-auto max-w-xs
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-green-600 file:text-white
                          hover:file:bg-green-700
                          cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Imagem Mobile (768x800px recomendado)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {newBanner.mobileImage ? (
                    <div>
                      <img
                        src={newBanner.mobileImage}
                        alt="Preview Mobile"
                        className="max-h-48 mx-auto mb-4 rounded"
                      />
                      <button
                        onClick={() => setNewBanner({ ...newBanner, mobileImage: '' })}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remover Imagem
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FiUpload size={40} className="mx-auto text-gray-400 mb-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'mobile')}
                        className="block w-full text-sm text-gray-500 mx-auto max-w-xs
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-600 file:text-white
                          hover:file:bg-blue-700
                          cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Link de Destino
                </label>
                <input
                  type="text"
                  value={newBanner.link}
                  onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                  placeholder="/produtos ou https://..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Button Text */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={newBanner.buttonText}
                  onChange={(e) => setNewBanner({ ...newBanner, buttonText: e.target.value })}
                  placeholder="Ex: Ver Produtos"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={newBanner.active}
                  onChange={(e) => setNewBanner({ ...newBanner, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Banner ativo (visível no site)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewBanner({ title: '', subtitle: '', image: '', mobileImage: '', link: '', buttonText: '', active: true });
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddBanner}
                disabled={!newBanner.title || !newBanner.image || loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Adicionar Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
