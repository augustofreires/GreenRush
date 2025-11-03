import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { useBlogStore } from '../../store/useBlogStore';

export const Blog = () => {
  const { getPublishedPosts, loadPosts } = useBlogStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    loadPosts();
  }, []);

  const allPosts = getPublishedPosts();
  const categories = ['Todos', 'Emagrecimento', 'Saúde', 'Bem-estar', 'Nutrição', 'Dicas'];
  const postsPerPage = 9;

  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(currentPage * postsPerPage, (currentPage + 1) * postsPerPage);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-16 px-4" style={{ background: 'linear-gradient(to bottom, #f8fdf9, #ffffff)' }}>
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
            BLOG DA GREENRUSH
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dicas exclusivas sobre emagrecimento, saúde e bem-estar
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Search and Filter */}
        <div className="mb-12 space-y-6">
          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full px-5 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-transparent text-base"
                style={{ borderColor: searchQuery ? '#4a9d4e' : '' }}
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(0);
              }}
              className={`px-6 py-2 rounded-full font-semibold transition-all text-sm ${
                selectedCategory === 'all'
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedCategory === 'all' ? { backgroundColor: '#4a9d4e' } : {}}
            >
              Todos
            </button>
            {categories.slice(1).map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(0);
                }}
                className={`px-6 py-2 rounded-full font-semibold transition-all text-sm ${
                  selectedCategory === category
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedCategory === category ? { backgroundColor: '#4a9d4e' } : {}}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {currentPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentPosts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Image */}
                  <Link to={`/blog/${post.slug}`} className="relative block overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg" style={{ backgroundColor: '#4a9d4e' }}>
                        {post.category}
                      </span>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-6">
                    {/* Date */}
                    <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                      {formatDate(post.publishedAt)}
                    </p>

                    {/* Title */}
                    <Link to={`/blog/${post.slug}`}>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#4a9d4e] transition-colors leading-tight">
                        {post.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Read More Link */}
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-sm group/link"
                      style={{ color: '#4a9d4e' }}
                    >
                      Ler mais
                      <FiArrowRight className="group-hover/link:translate-x-1 transition-transform" size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentPage(index);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 rounded-full font-semibold transition-all ${
                      currentPage === index
                        ? 'text-white shadow-lg scale-110'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={currentPage === index ? { backgroundColor: '#4a9d4e' } : {}}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum artigo encontrado</h3>
              <p className="text-gray-600">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Tente ajustar seus filtros de busca.'
                  : 'Ainda não há artigos publicados.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <section className="py-16 px-4" style={{ background: 'linear-gradient(to right, #4a9d4e, #2c5f2d)' }}>
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Não perca nenhuma novidade!
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Cadastre-se e receba dicas exclusivas, promoções e lançamentos
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <button className="bg-white px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl whitespace-nowrap" style={{ color: '#4a9d4e' }}>
              Quero receber!
            </button>
          </div>
          <p className="text-sm text-white/75 mt-4">
            🔒 Seus dados estão seguros. Sem spam!
          </p>
        </div>
      </section>
    </div>
  );
};
