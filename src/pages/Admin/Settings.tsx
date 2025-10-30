import { useState, useEffect } from "react";
import { FiSave } from "react-icons/fi";
import { useSettingsStore } from "../../store/useSettingsStore";

export const Settings = () => {
  const { settings, loading, fetchSettings, updateSettings } = useSettingsStore();
  const [whatsappLink, setWhatsappLink] = useState(settings.whatsappCommunityLink);
  const [whatsappImage, setWhatsappImage] = useState(settings.whatsappCommunityImage);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Buscar configurações ao carregar
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Atualizar campos quando settings mudar
  useEffect(() => {
    setWhatsappLink(settings.whatsappCommunityLink);
    setWhatsappImage(settings.whatsappCommunityImage);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateSettings({
        whatsappCommunityLink: whatsappLink,
        whatsappCommunityImage: whatsappImage,
      });
      setMessage({ type: "success", text: "Configurações salvas com sucesso!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao salvar configurações. Tente novamente." });
      console.error("Erro:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações Gerais</h1>
        <p className="text-gray-600">Configure os links e informações globais do site</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? "✅" : "❌"}
          <span>{message.text}</span>
        </div>
      )}

      {/* WhatsApp Community */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          💬 Comunidade no WhatsApp
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link da Comunidade no WhatsApp
            </label>
            <input
              type="text"
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/CODIGO_DA_COMUNIDADE"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600">💡 Para obter o link da comunidade:</p>
              <ol className="text-xs text-gray-600 list-decimal list-inside ml-2 space-y-1">
                <li>Abra a comunidade no WhatsApp</li>
                <li>Toque no nome da comunidade no topo</li>
                <li>Toque em "Convidar via link"</li>
                <li>Copie o link e cole aqui</li>
              </ol>
              <p className="text-xs text-blue-600 font-medium mt-2">
                📌 Se deixar vazio, a seção da comunidade não aparecerá na landing page
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem da Comunidade (Prints do WhatsApp)
            </label>
            <input
              type="text"
              value={whatsappImage}
              onChange={(e) => setWhatsappImage(e.target.value)}
              placeholder="https://exemplo.com/prints-whatsapp.png"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600">
                💡 Use uma imagem com prints de conversas do WhatsApp da sua comunidade
              </p>
              <p className="text-xs text-gray-600">
                📐 Recomendado: 800x600px ou superior (formato horizontal ou quadrado)
              </p>
              <p className="text-xs text-blue-600 font-medium mt-2">
                📌 Se deixar vazio, apenas o texto aparecerá (sem a imagem na direita)
              </p>
            </div>

            {/* Preview da imagem */}
            {whatsappImage && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Preview da imagem:</p>
                <img
                  src={whatsappImage}
                  alt="Preview"
                  className="max-w-xs rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x300?text=Imagem+não+encontrada";
                  }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave size={20} />
            {saving ? "Salvando..." : "Salvar Configurações"}
          </button>
        </form>
      </div>

      {/* Preview */}
      {whatsappLink && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">👀 Preview</h3>
          <p className="text-sm text-blue-800 mb-3">Assim ficará a seção na landing page:</p>
          <div className="bg-white rounded-lg p-6 border-2 border-green-500">
            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Faça Parte da Nossa Comunidade
              </h3>
              <p className="text-gray-600 mb-4">
                Junte-se a milhares de pessoas que compartilham dicas, resultados e motivação!
              </p>
              <button className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all transform hover:scale-105">
                Entrar na Comunidade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
