import { useState } from 'react';
import { FiVideo, FiTrash2, FiPlus, FiEdit2, FiChevronUp, FiChevronDown, FiX } from 'react-icons/fi';
import { useTestimonialsVideoStore } from '../../store/useTestimonialsVideoStore';

type ProductKey = 'cha' | 'greenrush' | 'slimshot' | 'cinta';

const products: { key: ProductKey; label: string }[] = [
  { key: 'cha', label: 'Chá Emagrecedor' },
  { key: 'greenrush', label: 'Greenrush Cápsulas' },
  { key: 'slimshot', label: 'Slimshot' },
  { key: 'cinta', label: 'Cinta Modeladora' },
];

export const TestimonialsVideo = () => {
  const { videos, addVideo, removeVideo, updateVideo, reorderVideos } = useTestimonialsVideoStore();
  const [selectedProduct, setSelectedProduct] = useState<ProductKey>('cha');
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    videoUrl: '',
    thumbnailUrl: '',
    customerName: '',
    customerLocation: '',
    title: '',
  });

  const currentVideos = videos[selectedProduct] || [];

  const resetForm = () => {
    setFormData({
      videoUrl: '',
      thumbnailUrl: '',
      customerName: '',
      customerLocation: '',
      title: '',
    });
    setShowForm(false);
    setEditingVideo(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.videoUrl.trim() || !formData.customerName.trim() || !formData.title.trim()) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios' });
      return;
    }

    if (editingVideo) {
      updateVideo(selectedProduct, editingVideo, formData);
      setMessage({ type: 'success', text: 'Depoimento atualizado com sucesso!' });
    } else {
      const newVideo = {
        id: Date.now().toString(),
        ...formData,
      };
      addVideo(selectedProduct, newVideo);
      setMessage({ type: 'success', text: 'Depoimento adicionado com sucesso!' });
    }

    resetForm();
    setTimeout(() => setMessage(null), 3000);
  };

  const handleEdit = (videoId: string) => {
    const video = currentVideos.find((v) => v.id === videoId);
    if (video) {
      setFormData({
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl || '',
        customerName: video.customerName,
        customerLocation: video.customerLocation,
        title: video.title,
      });
      setEditingVideo(videoId);
      setShowForm(true);
    }
  };

  const handleRemove = (videoId: string) => {
    if (window.confirm('Tem certeza que deseja remover este depoimento?')) {
      removeVideo(selectedProduct, videoId);
      setMessage({ type: 'success', text: 'Depoimento removido com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderVideos(selectedProduct, index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < currentVideos.length - 1) {
      reorderVideos(selectedProduct, index, index + 1);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Depoimentos em Vídeo</h1>
        <p className="text-gray-600">
          Adicione vídeos de depoimentos de clientes para as landing pages
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? '✅' : '❌'}
          <span>{message.text}</span>
        </div>
      )}

      {/* Product Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Selecione o Produto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <button
              key={product.key}
              onClick={() => setSelectedProduct(product.key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedProduct === product.key
                  ? 'border-green-500 bg-green-50 text-green-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <FiVideo className="w-6 h-6 mb-2 mx-auto" />
              <p className="font-semibold text-center">{product.label}</p>
              <p className="text-xs text-center mt-1 opacity-75">
                {videos[product.key]?.length || 0} {videos[product.key]?.length === 1 ? 'vídeo' : 'vídeos'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          {showForm ? <FiX size={20} /> : <FiPlus size={20} />}
          {showForm ? 'Cancelar' : 'Adicionar Novo Depoimento'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingVideo ? 'Editar Depoimento' : 'Novo Depoimento'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Vídeo *
              </label>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://i.imgur.com/VIDEO_ID.mp4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <div className="mt-2 space-y-1">
                <p className="text-xs text-green-600 font-medium">
                  ✅ Recomendado: Vídeo direto (.mp4, .webm) - Interface 100% limpa
                </p>
                <p className="text-xs text-blue-700 font-semibold">
                  🌟 Imgur: https://i.imgur.com/VIDEO_ID.mp4 (100% gratuito até 200MB)
                </p>
                <p className="text-xs text-gray-500">
                  Google Drive ou YouTube também funcionam (veja instruções abaixo)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Thumbnail (opcional)
              </label>
              <input
                type="text"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="https://exemplo.com/thumbnail.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Maria Silva"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localização do Cliente
                </label>
                <input
                  type="text"
                  value={formData.customerLocation}
                  onChange={(e) => setFormData({ ...formData, customerLocation: e.target.value })}
                  placeholder="São Paulo, SP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Depoimento *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Perdi 10kg em 2 meses!"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                {editingVideo ? 'Atualizar' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Instruções para Vídeos Maiores */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          ☁️ Como hospedar vídeos maiores que 5MB (100% Gratuito)
        </h3>

        {/* Opção 1: Imgur */}
        <div className="mb-4 p-4 bg-white rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            ✅ Opção 1: Imgur (Recomendado)
          </h4>
          <p className="text-sm text-blue-800 mb-2">100% gratuito, aceita vídeos até 200MB</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 ml-2">
            <li>Acesse <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-600">imgur.com</a></li>
            <li>Clique em "New post" e faça upload do seu vídeo</li>
            <li>Após o upload, clique com botão direito no vídeo → "Copiar endereço do vídeo"</li>
            <li>Cole a URL no campo "Usar URL Externa" acima</li>
          </ol>
        </div>

        {/* Opção 2: Google Drive */}
        <div className="mb-4 p-4 bg-white rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-2">
            📁 Opção 2: Google Drive
          </h4>
          <p className="text-sm text-blue-800 mb-2">Se você já tem o vídeo no Google Drive</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 ml-2">
            <li>Faça upload do vídeo no Google Drive</li>
            <li>Clique com botão direito → "Compartilhar" → "Qualquer pessoa com o link"</li>
            <li>Copie o ID do vídeo da URL (entre /d/ e /view)</li>
            <li>Use: https://drive.google.com/uc?export=download&id=SEU_ID_AQUI</li>
          </ol>
        </div>

        {/* Opção 3: Host próprio */}
        <div className="p-4 bg-white rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-900 mb-2">
            🖥️ Opção 3: Servidor Próprio
          </h4>
          <p className="text-sm text-blue-800">
            Se você tiver hospedagem web, pode fazer upload do vídeo .mp4 e usar a URL direta
          </p>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded border border-green-300">
          <p className="text-xs font-semibold text-green-900 mb-1">💡 Dica:</p>
          <p className="text-xs text-green-800">
            Vídeos hospedados via URL direta (.mp4) ficam 100% limpos, sem logo, sem interface,
            sem anúncios - muito melhor que YouTube!
          </p>
        </div>
      </div>

      {/* Videos List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Depoimentos - {products.find((p) => p.key === selectedProduct)?.label}
        </h2>

        {currentVideos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiVideo className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum depoimento adicionado ainda</p>
            <p className="text-sm">Clique em "Adicionar Novo Depoimento" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentVideos.map((video, index) => (
              <div
                key={video.id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 transition-all"
              >
                <div className="flex gap-4">
                  {/* Video Preview */}
                  <div className="w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FiVideo size={48} />
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{video.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>{video.customerName}</strong>
                          {video.customerLocation && ` - ${video.customerLocation}`}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-md">{video.videoUrl}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover para cima"
                        >
                          <FiChevronUp size={18} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === currentVideos.length - 1}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover para baixo"
                        >
                          <FiChevronDown size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(video.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleRemove(video.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentVideos.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Dica:</strong> Os vídeos aparecerão na landing page na ordem mostrada acima.
              Use os botões de seta para reordenar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
