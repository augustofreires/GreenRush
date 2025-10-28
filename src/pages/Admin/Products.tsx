import { useState } from 'react';
import { FiPackage, FiPlus, FiEdit2, FiTrash2, FiUpload, FiEye, FiEyeOff } from 'react-icons/fi';
import { useProductStore } from '../../store/useProductStore';
import type { Product } from '../../types';

export const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    category: 'Emagrecimento',
    stock: '',
    badge: '' as 'new' | 'sale' | 'bestseller' | 'combo' | '',
    rating: '',
    reviews: '',
    customLandingPage: '',
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-'); // Substitui espaços por hífens
  };

  const categories = ['Emagrecimento', 'Modeladores', 'Suplementos', 'Bem-Estar', 'Combos'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        image: product.image,
        category: product.category,
        stock: product.stock.toString(),
        badge: product.badge || '',
        rating: product.rating?.toString() || '',
        reviews: product.reviews?.toString() || '',
        customLandingPage: product.customLandingPage || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        originalPrice: '',
        image: '',
        category: 'Emagrecimento',
        stock: '',
        badge: '',
        rating: '',
        reviews: '',
        customLandingPage: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.image) {
      alert('Preencha os campos obrigatórios: Nome, Preço e Imagem');
      return;
    }

    const slug = formData.slug || generateSlug(formData.name);

    const productData: Product = {
      id: editingProduct?.id || String(Date.now()),
      slug: slug,
      name: formData.name,
      description: formData.description,
      shortDescription: formData.description?.substring(0, 150),
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      image: formData.image, // Mantém para compatibilidade com o tipo
      images: formData.image ? [formData.image] : [],
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      badge: formData.badge || undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      reviews: formData.reviews ? parseInt(formData.reviews) : undefined,
      customLandingPage: formData.customLandingPage || undefined,
    };

    console.log('📦 Dados do produto a ser salvo:', productData);
    console.log('📷 Imagem que será salva:', productData.images);

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    setShowModal(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  const handleToggleVisibility = (product: Product) => {
    updateProduct(product.id, { hidden: !product.hidden });
  };

  const filteredProducts = searchQuery
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  const stats = {
    total: products.length,
    visible: products.filter(p => !p.hidden).length,
    hidden: products.filter(p => p.hidden).length,
    inStock: products.filter(p => p.stock > 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600 mt-2">Gerenciar catálogo de produtos</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <FiPlus />
            Novo Produto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Visíveis</p>
            <p className="text-2xl font-bold text-green-600">{stats.visible}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Ocultos</p>
            <p className="text-2xl font-bold text-gray-600">{stats.hidden}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Em Estoque</p>
            <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Baixo</p>
            <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Esgotados</p>
            <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lista de Produtos</h2>
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visível
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                              <FiPackage className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">ID: #{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </div>
                      {product.originalPrice && (
                        <div className="text-xs text-gray-500 line-through">
                          R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock} unid.</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : product.stock < 10
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {product.stock === 0 ? 'Esgotado' : product.stock < 10 ? 'Baixo' : 'Em Estoque'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleVisibility(product)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          product.hidden
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={product.hidden ? 'Produto oculto no site' : 'Produto visível no site'}
                      >
                        {product.hidden ? (
                          <>
                            <FiEyeOff size={14} />
                            Oculto
                          </>
                        ) : (
                          <>
                            <FiEye size={14} />
                            Visível
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="text-primary-blue hover:text-primary-pink mr-3"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <FiPackage size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add/Edit Product */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Produto *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Vitamina Capilar Premium"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o produto..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Imagem do Produto *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.image ? (
                    <div>
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="max-h-48 mx-auto mb-4 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        style={{ color: '#dc2626', fontWeight: 600 }}
                      >
                        Remover Imagem
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FiUpload size={48} className="mx-auto text-gray-400 mb-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
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

              {/* Price & Original Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Preço *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="89.90"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preço Original (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="129.90"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>

              {/* Category & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estoque</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="45"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>

              {/* Badge */}
              <div>
                <label className="block text-sm font-medium mb-2">Badge (Opcional)</label>
                <select
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value as any })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">Nenhum</option>
                  <option value="new">Novo</option>
                  <option value="sale">Promoção</option>
                  <option value="bestseller">Mais Vendido</option>
                  <option value="combo">Combo</option>
                </select>
              </div>

              {/* Landing Page Customizada */}
              <div>
                <label className="block text-sm font-medium mb-2">Landing Page Customizada (Opcional)</label>
                <select
                  value={formData.customLandingPage || ''}
                  onChange={(e) => setFormData({ ...formData, customLandingPage: e.target.value || undefined })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">Usar página padrão</option>
                  <option value="/cha">Chá - /cha</option>
                  <option value="/capsulas">Cápsulas - /capsulas</option>
                  <option value="/slimshot">SlimShot - /slimshot</option>
                  <option value="/cinta-modeladora">Cinta Modeladora - /cinta-modeladora</option>
                  <option value="/combos">Combos - /combos</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Se selecionado, o produto redirecionará para a landing page customizada ao invés da página padrão
                </p>
              </div>

              {/* Rating & Reviews */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Avaliação (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="4.8"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Número de Avaliações</label>
                  <input
                    type="number"
                    value={formData.reviews}
                    onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                    placeholder="234"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
              >
                {editingProduct ? 'Salvar Alterações' : 'Adicionar Produto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
