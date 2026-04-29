import { useState, useEffect, useRef } from 'react';
import { FiSend, FiMail, FiCheckCircle, FiXCircle, FiLoader, FiEye } from 'react-icons/fi';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const DEFAULT_SUBJECT = '🎉 Semana do Consumidor — Oferta Exclusiva GreenRush';
const TEMPLATE_URL = `${API_URL}/admin/email-templates/semana-consumidor`;

interface CampaignStatus {
  sending: boolean;
  total: number;
  sent: number;
  failed: number;
  errors: { email: string; error: string }[];
  startedAt: string | null;
  finishedAt: string | null;
}

export const AdminEmailCampaign = () => {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [htmlContent, setHtmlContent] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [sending, setSending] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState<CampaignStatus | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // CORREÇÃO: Usar o store Zustand em vez de localStorage direto
  const { token: adminToken } = useAdminAuthStore();

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetch(TEMPLATE_URL)
      .then(async (r) => {
        const contentType = r.headers.get('content-type') || '';
        if (!r.ok || contentType.includes('application/json')) {
          setHtmlContent('<!-- Erro ao carregar template. Verifique sua conexão. -->');
          setLoadingTemplate(false);
          console.error('Erro ao carregar template de email');
          return;
        }
        const html = await r.text();
        setHtmlContent(html);
        setLoadingTemplate(false);
      })
      .catch(() => { setHtmlContent('<p>Erro ao carregar template.</p>'); setLoadingTemplate(false); });
  }, []);

  useEffect(() => {
    if (sending) {
      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${API_URL}/admin/email-campaign/status`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          const data: CampaignStatus = await r.json();
          setStatus(data);
          if (!data.sending) {
            setSending(false);
            clearInterval(pollRef.current!);
            showToast('success', `Concluido! ${data.sent} enviados, ${data.failed} falhas.`);
          }
        } catch {}
      }, 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [sending, adminToken]);

  const handleTest = async () => {
    if (!testEmail.trim()) return showToast('error', 'Informe um email de teste.');
    setTestSending(true);
    try {
      const r = await fetch(`${API_URL}/admin/email-campaign/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ subject, htmlContent, testEmail }),
      });
      const data = await r.json();
      if (r.ok) showToast('success', `Email de teste enviado para ${testEmail}!`);
      else showToast('error', data.error || 'Erro ao enviar teste.');
    } catch { showToast('error', 'Erro de conexao.'); }
    finally { setTestSending(false); }
  };

  const handleSendAll = async () => {
    if (!window.confirm(`Voce vai enviar para TODOS os leads (787 contatos).\n\nTem certeza?`)) return;
    if (!window.confirm('Ultima confirmacao: Iniciar o disparo para todos os 787 leads?')) return;
    setSending(true);
    setStatus({ sending: true, total: 0, sent: 0, failed: 0, errors: [], startedAt: null, finishedAt: null });
    try {
      const r = await fetch(`${API_URL}/admin/email-campaign/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ subject, htmlContent }),
      });
      const data = await r.json();
      if (!r.ok) { setSending(false); showToast('error', data.error || 'Erro ao iniciar disparo.'); }
      else { setStatus((prev) => ({ ...prev!, total: data.total })); showToast('success', `Disparo iniciado para ${data.total} contatos.`); }
    } catch { setSending(false); showToast('error', 'Erro de conexao.'); }
  };

  const progress = status && status.total > 0
    ? Math.round(((status.sent + status.failed) / status.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-lg shadow-xl text-white text-sm font-semibold ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.type === 'success' ? <FiCheckCircle size={18} /> : <FiXCircle size={18} />}
            {toast.msg}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiMail className="text-green-600" />
            Email Marketing
          </h1>
          <p className="text-gray-500 mt-1">Campanha da Semana do Consumidor — 787 leads cadastrados</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">

            <div className="bg-white rounded-xl shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Assunto do Email</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Assunto do email..." />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Conteudo HTML</label>
                <button onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-semibold">
                  <FiEye size={14} />
                  {showPreview ? 'Fechar Preview' : 'Ver Preview'}
                </button>
              </div>
              {loadingTemplate ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                  <FiLoader className="animate-spin" /> Carregando template...
                </div>
              ) : (
                <textarea value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                  placeholder="Cole o HTML do email aqui..." />
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Enviar Email de Teste</h3>
              <div className="flex gap-2">
                <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button onClick={handleTest} disabled={testSending || !testEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
                  {testSending ? <FiLoader className="animate-spin" size={14} /> : <FiMail size={14} />}
                  Testar
                </button>
              </div>
            </div>

            <button onClick={handleSendAll} disabled={sending || !htmlContent}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-base hover:from-green-700 hover:to-green-800 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg transition-all">
              {sending
                ? <><FiLoader className="animate-spin" size={20} /> Enviando... {status?.sent || 0}/{status?.total || 0}</>
                : <><FiSend size={20} /> Enviar para Todos os Leads</>}
            </button>
          </div>

          <div className="space-y-5">
            {showPreview && htmlContent && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview do Email</h3>
                <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
                  <iframe srcDoc={htmlContent} title="Email Preview" className="w-full h-full" sandbox="allow-same-origin" />
                </div>
              </div>
            )}

            {status && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  {status.sending
                    ? <FiLoader className="animate-spin text-green-600" size={16} />
                    : <FiCheckCircle className="text-green-600" size={16} />}
                  {status.sending ? 'Enviando...' : 'Disparo Concluido'}
                </h3>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{status.sent + status.failed} de {status.total}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-700">{status.total}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{status.sent}</div>
                    <div className="text-xs text-gray-500">Enviados</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-500">{status.failed}</div>
                    <div className="text-xs text-gray-500">Falhas</div>
                  </div>
                </div>
                {status.startedAt && (
                  <p className="text-xs text-gray-400">
                    Iniciado: {new Date(status.startedAt).toLocaleString('pt-BR')}
                    {status.finishedAt && ` · Concluido: ${new Date(status.finishedAt).toLocaleString('pt-BR')}`}
                  </p>
                )}
                {status.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-red-600 mb-2">Emails com falha ({status.errors.length}):</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {status.errors.map((e, i) => (
                        <div key={i} className="text-xs text-gray-500 bg-red-50 px-2 py-1 rounded">{e.email} — {e.error}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!status && !showPreview && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-green-800 mb-3">Como funciona</h3>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>1. Edite o assunto se necessario</li>
                  <li>2. Envie um email de teste primeiro</li>
                  <li>3. Confirme que chegou corretamente</li>
                  <li>4. Clique em "Enviar para Todos"</li>
                  <li>5. Acompanhe o progresso em tempo real</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-xs text-green-600">
                    Envio em lotes: 10 emails por vez, 3 segundos de intervalo<br />
                    Tempo estimado para 787 leads: ~4 minutos
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
