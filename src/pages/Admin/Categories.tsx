import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiSave, FiX } from 'react-icons/fi';
import { useCategoryStore, type Category } from '../../store/useCategoryStore';

export const AdminCategories = () => {
  const { categories, loading, fetchAllCategories, addCategory, updateCategory, deleteCategory } = useCategoryStore();

  // Buscar categorias ao carregar
  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    slug: '',
    description: '',
    color: 'from-green-500 to-green-600',
    image: '',
    isActive: true,
    order: categories.length + 1,
    showOverlay: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateCategory(editingId, formData);
      setEditingId(null);
    } else {
      addCategory(formData);
      setIsAdding(false);
    }

    setFormData({
      name: '',
      slug: '',
      description: '',
      color: 'from-green-500 to-green-600',
      image: '',
      isActive: true,
      order: categories.length + 1,
      showOverlay: true,
    });
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      image: category.image,
      isActive: category.isActive,
      order: category.order,
      showOverlay: category.showOverlay !== false,
    });
    setEditingId(category.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: 'from-green-500 to-green-600',
      image: '',
      isActive: true,
      order: categories.length + 1,
      showOverlay: true,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      deleteCategory(id);
    }
  };

  const handleToggleActive = (category: Category) => {
    updateCategory(category.id, { isActive: !category.isActive });
  };

  const colorOptions = [
    { label: 'Verde Escuro', value: 'from-green-600 to-green-700' },
    { label: 'Verde Médio', value: 'from-green-500 to-green-600' },
    { label: 'Verde Claro', value: 'from-green-400 to-green-500' },
    { label: 'Verde Água', value: 'from-teal-500 to-teal-600' },
    { label: 'Azul', value: 'from-blue-500 to-blue-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias / Objetivos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as categorias exibidas na home
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: '#4a9d4e' }}
          >
            <FiPlus size={20} />
            Nova Categoria
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                  placeholder="Ex: Emagrecimento"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="emagrecimento"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ex: Produtos naturais para perda de peso saudável"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Texto que aparece abaixo do título da categoria
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cor do Card *
                </label>
                <select
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {colorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ordem de Exibição *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL da Imagem *
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 600x400px
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#4a9d4e' }}
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Categoria ativa (visível na home)
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showOverlay !== false}
                    onChange={(e) =>
                      setFormData({ ...formData, showOverlay: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#4a9d4e' }}
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Mostrar camada de cor sobre a imagem
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Se desmarcado, a imagem será exibida sem filtro de cor
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: '#4a9d4e' }}
              >
                <FiSave size={18} />
                {editingId ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                <FiX size={18} />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                  Ordem
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                  Nome
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                  Slug
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                  Descrição
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                  Preview
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Nenhuma categoria cadastrada
                  </td>
                </tr>
              ) : (
                categories
                  .sort((a, b) => a.order - b.order)
                  .map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-700">
                          {category.order}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">
                          {category.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {category.description || '-'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`w-24 h-12 rounded bg-gradient-to-br ${category.color} relative overflow-hidden`}
                        >
                          <img
                            src={category.image}
                            alt={category.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-20"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(category)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            category.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {category.isActive ? (
                            <>
                              <FiEye size={14} />
                              Ativo
                            </>
                          ) : (
                            <>
                              <FiEyeOff size={14} />
                              Inativo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FiEdit2 size={18} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <FiTrash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
