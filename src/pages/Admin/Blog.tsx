import { useState, useEffect } from 'react';
import { FiFileText, FiPlus, FiEdit2, FiTrash2, FiUpload, FiEye, FiEyeOff } from 'react-icons/fi';
import { useBlogStore, type BlogPost } from '../../store/useBlogStore';

export const AdminBlog = () => {
  const { posts, addPost, updatePost, deletePost, loadPosts, isLoading } = useBlogStore();
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    author: 'BigHair Team',
    category: 'Cabelos',
    published: false,
  });


  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const categories = ['Cabelos', 'Saúde', 'Beleza', 'Suplementação', 'Nutrição', 'Bem-estar'];

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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleOpenModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
        author: post.author,
        category: post.category,
        published: post.published,
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image: '',
        author: 'BigHair Team',
        category: 'Cabelos',
        published: false,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content || !formData.image) {
      alert('Preencha os campos obrigatórios: Título, Conteúdo e Imagem');
      return;
    }

    const slug = formData.slug || generateSlug(formData.title);
    const now = new Date().toISOString();

    const postData: BlogPost = {
      id: editingPost?.id || String(Date.now()),
      title: formData.title,
      slug,
      excerpt: formData.excerpt,
      content: formData.content,
      image: formData.image,
      author: formData.author,
      category: formData.category,
      published: formData.published,
      publishedAt: editingPost?.publishedAt || now,
      createdAt: editingPost?.createdAt || now,
      updatedAt: now,
    };

    if (editingPost) {
      updatePost(editingPost.id, postData);
    } else {
      addPost(postData);
    }

    setShowModal(false);
    setEditingPost(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este artigo?')) {
      deletePost(id);
    }
  };

  const togglePublished = (post: BlogPost) => {
    updatePost(post.id, { published: !post.published });
  };

  const filteredPosts = searchQuery
    ? posts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.published).length,
    draft: posts.filter(p => !p.published).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
            <p className="text-gray-600 mt-2">Gerenciar artigos do blog</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <FiPlus />
            Novo Artigo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total de Artigos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Publicados</p>
            <p className="text-2xl font-bold text-green-600">{stats.published}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Rascunhos</p>
            <p className="text-2xl font-bold text-orange-600">{stats.draft}</p>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lista de Artigos</h2>
              <input
                type="text"
                placeholder="Buscar artigos..."
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
                    Artigo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-16 flex-shrink-0 rounded overflow-hidden">
                          {post.image ? (
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                              <FiFileText className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {post.title}
                          </div>
                          <div className="text-xs text-gray-500">{post.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{post.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{post.author}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePublished(post)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          post.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.published ? (
                          <>
                            <FiEye size={12} />
                            Publicado
                          </>
                        ) : (
                          <>
                            <FiEyeOff size={12} />
                            Rascunho
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(post)}
                        className="text-primary-blue hover:text-primary-pink mr-3"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
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

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <FiFileText size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum artigo encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add/Edit Post */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold">
                {editingPost ? 'Editar Artigo' : 'Novo Artigo'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                  placeholder="Digite o título do artigo"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-2">URL (Slug) *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-do-artigo"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL amigável gerada automaticamente. Edite se necessário.
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Imagem de Capa *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.image ? (
                    <div>
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="max-h-48 mx-auto mb-4 rounded"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, image: '' })}
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
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 mx-auto max-w-xs
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-green-600 file:text-white
                          hover:file:bg-green-700
                          cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-2">800x500px recomendado</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium mb-2">Resumo</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Breve resumo que aparecerá na listagem de artigos..."
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Conteúdo * (Markdown suportado)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite o conteúdo do artigo usando Markdown...

Exemplos:
# Título Principal
## Subtítulo
### Título Menor

**texto em negrito**
- Item de lista
✓ Item com check"
                  rows={15}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue font-mono text-sm"
                />
              </div>

              {/* Category & Author */}
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
                  <label className="block text-sm font-medium mb-2">Autor</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Nome do autor"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>

              {/* Published */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="published" className="text-sm font-medium">
                  Publicar artigo (tornar visível no site)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPost(null);
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
              >
                {editingPost ? 'Salvar Alterações' : 'Criar Artigo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
