import { useState } from 'react';
import { FiImage, FiUpload, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { useBeforeAfterStore } from '../../store/useBeforeAfterStore';
import type { BeforeAfter } from '../../store/useBeforeAfterStore';

export const AdminBeforeAfter = () => {
  const { items, addItem, updateItem, deleteItem } = useBeforeAfterStore();
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    beforeImage: '',
    afterImage: '',
    description: '',
    active: true,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'before') {
          setNewItem({ ...newItem, beforeImage: reader.result as string });
        } else {
          setNewItem({ ...newItem, afterImage: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (newItem.title && newItem.beforeImage && newItem.afterImage) {
      const item: BeforeAfter = {
        id: String(Date.now()),
        ...newItem,
        order: items.length + 1,
      };
      addItem(item);
      setNewItem({ title: '', beforeImage: '', afterImage: '', description: '', active: true });
      setShowModal(false);
    }
  };

  const toggleItemStatus = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      updateItem(id, { active: !item.active });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este antes/depois?')) {
      deleteItem(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Antes e Depois</h1>
            <p className="text-gray-600 mt-2">Gerenciar fotos de transformação dos clientes</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiUpload />
            Adicionar Antes/Depois
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Images Comparison */}
              <div className="grid grid-cols-2 gap-0.5 bg-gray-200">
                <div className="relative">
                  <img
                    src={item.beforeImage}
                    alt={`${item.title} - Antes`}
                    className="w-full h-48 object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                    ANTES
                  </span>
                </div>
                <div className="relative">
                  <img
                    src={item.afterImage}
                    alt={`${item.title} - Depois`}
                    className="w-full h-48 object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                    DEPOIS
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${
                      item.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => toggleItemStatus(item.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition-colors flex-1 justify-center"
                  >
                    {item.active ? (
                      <>
                        <FiEyeOff size={16} />
                        Desativar
                      </>
                    ) : (
                      <>
                        <FiEye size={16} />
                        Ativar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
              <FiImage size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum antes/depois cadastrado</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 btn-primary"
              >
                Adicionar Primeiro Antes/Depois
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Item */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Adicionar Antes/Depois</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Ex: Transformação em 90 dias"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Ex: Cliente perdeu 15kg em 3 meses"
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Images Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Foto ANTES *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {newItem.beforeImage ? (
                      <div>
                        <img
                          src={newItem.beforeImage}
                          alt="Preview Antes"
                          className="max-h-48 mx-auto mb-3 rounded"
                        />
                        <button
                          onClick={() => setNewItem({ ...newItem, beforeImage: '' })}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remover Imagem
                        </button>
                      </div>
                    ) : (
                      <div>
                        <FiUpload size={32} className="mx-auto text-gray-400 mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'before')}
                          className="block w-full text-sm text-gray-500 mx-auto
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-red-600 file:text-white
                            hover:file:bg-red-700
                            cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* After Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Foto DEPOIS *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {newItem.afterImage ? (
                      <div>
                        <img
                          src={newItem.afterImage}
                          alt="Preview Depois"
                          className="max-h-48 mx-auto mb-3 rounded"
                        />
                        <button
                          onClick={() => setNewItem({ ...newItem, afterImage: '' })}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remover Imagem
                        </button>
                      </div>
                    ) : (
                      <div>
                        <FiUpload size={32} className="mx-auto text-gray-400 mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'after')}
                          className="block w-full text-sm text-gray-500 mx-auto
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
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={newItem.active}
                  onChange={(e) => setNewItem({ ...newItem, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Ativo (visível no site)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewItem({ title: '', beforeImage: '', afterImage: '', description: '', active: true });
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItem.title || !newItem.beforeImage || !newItem.afterImage}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
