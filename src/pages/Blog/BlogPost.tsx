import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { FiCalendar, FiUser, FiTag, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useBlogStore } from '../../store/useBlogStore';

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug, getPublishedPosts, loadPosts } = useBlogStore();

  useEffect(() => {
    loadPosts();
  }, []);

  if (!slug) {
    return <Navigate to="/blog" replace />;
  }

  const post = getPostBySlug(slug);
  const allPosts = getPublishedPosts();

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Artigo não encontrado</h1>
          <p className="text-gray-600 mb-8">O artigo que você procura não existe ou foi removido.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-primary-pink text-white px-6 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-colors"
          >
            <FiArrowLeft />
            Voltar ao Blog
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get related posts (same category, excluding current post)
  const relatedPosts = allPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  // Simple markdown-like parser for basic formatting
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.JSX.Element[] = [];
    let listItems: string[] = [];
    let key = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key++}`} className="list-disc list-inside space-y-2 mb-6 ml-4">
            {listItems.map((item, i) => (
              <li key={i} className="text-gray-700">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      // Heading 1
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`h1-${index}`} className="text-4xl font-bold text-gray-900 mb-6 mt-8">
            {line.substring(2)}
          </h1>
        );
      }
      // Heading 2
      else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${index}`} className="text-3xl font-bold text-gray-900 mb-4 mt-8">
            {line.substring(3)}
          </h2>
        );
      }
      // Heading 3
      else if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${index}`} className="text-2xl font-bold text-gray-900 mb-3 mt-6">
            {line.substring(4)}
          </h3>
        );
      }
      // List item
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        listItems.push(line.substring(2));
      }
      // Checkmark item
      else if (line.startsWith('✓ ')) {
        flushList();
        elements.push(
          <p key={`check-${index}`} className="text-gray-700 mb-2 flex items-start gap-2">
            <span className="text-accent-green text-xl">✓</span>
            <span>{line.substring(2)}</span>
          </p>
        );
      }
      // Bold text
      else if (line.includes('**')) {
        flushList();
        const parts = line.split('**');
        const formatted = parts.map((part, i) =>
          i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
        );
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 mb-4 leading-relaxed">
            {formatted}
          </p>
        );
      }
      // Empty line
      else if (line.trim() === '') {
        flushList();
      }
      // Regular paragraph
      else if (line.trim() !== '') {
        flushList();
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 mb-4 leading-relaxed">
            {line}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {/* Breadcrumb */}
        <div className="absolute top-8 left-0 right-0">
          <div className="container mx-auto px-4">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-white hover:text-primary-pink transition-colors"
            >
              <FiArrowLeft />
              Voltar ao Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Article */}
      <article className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            {/* Category */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-pink bg-pink-50 px-4 py-2 rounded-full">
                <FiTag size={14} />
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 pb-6 border-b">
              <span className="flex items-center gap-2">
                <FiUser size={18} />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <FiCalendar size={18} />
                {formatDate(post.publishedAt)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 mb-8">
            <div className="prose prose-lg max-w-none">
              {renderContent(post.content)}
            </div>
          </div>

          {/* Share */}
          <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compartilhe este artigo</h3>
            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Facebook
              </button>
              <button className="flex-1 bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 transition-colors font-medium">
                Twitter
              </button>
              <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                WhatsApp
              </button>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Artigos Relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                  >
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-pink transition-colors">
                        {relatedPost.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-primary-pink font-semibold text-sm">
                        Ler mais <FiArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* CTA Section */}
      <section className="bg-primary-pink text-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Gostou do conteúdo?</h2>
          <p className="text-lg mb-6 opacity-90">
            Confira nossos produtos e transforme sua rotina de cuidados
          </p>
          <Link
            to="/produtos"
            className="inline-block bg-white text-primary-pink px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Ver Produtos
          </Link>
        </div>
      </section>
    </div>
  );
};
