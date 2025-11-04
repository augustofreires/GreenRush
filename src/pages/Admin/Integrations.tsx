import { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAppmaxStore } from '../../store/useAppmaxStore';
import { appmaxService } from '../../services/appmaxService';
import type { AppMaxConfig } from '../../types';

export const AdminIntegrations = () => {
  const appmaxStore = useAppmaxStore();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // AppMax Config - usar dados do store
  // AppMax Config - carregado do backend
  const [appmaxConfig, setAppmaxConfig] = useState<AppMaxConfig>({
    accessToken: '',
    publicKey: '',
    apiUrl: 'https://admin.appmax.com.br/api/v3',
    enabled: false,
    trackingEnabled: true,
    conversionPixel: '',
  });

  // Tracking Pixels Config
  const [trackingPixels, setTrackingPixels] = useState({
    meta_pixel_id: '',
    meta_pixel_enabled: false,
    google_analytics_id: '',
    google_analytics_enabled: false,
    google_tag_manager_id: '',
    google_tag_manager_enabled: false
  });
  const [savingPixels, setSavingPixels] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      // Carregar configuração do backend
      const appmax = await appmaxService.getConfig();
      console.log('Configuração carregada do backend:', appmax);
      setAppmaxConfig(appmax);
      
      // Atualizar store apenas se tiver dados
      if (appmax.accessToken) {
        appmaxStore.setAccessToken(appmax.accessToken);
        appmaxStore.setPublicKey(appmax.publicKey);
        appmaxStore.setEnabled(appmax.enabled);
      }

      // Carregar tracking pixels
      const pixelsResponse = await fetch('/api/tracking-pixels');
      if (pixelsResponse.ok) {
        const pixels = await pixelsResponse.json();
        setTrackingPixels({
          meta_pixel_id: pixels.meta_pixel_id || '',
          meta_pixel_enabled: pixels.meta_pixel_enabled || false,
          google_analytics_id: pixels.google_analytics_id || '',
          google_analytics_enabled: pixels.google_analytics_enabled || false,
          google_tag_manager_id: pixels.google_tag_manager_id || '',
          google_tag_manager_enabled: pixels.google_tag_manager_enabled || false
        });
      }
    } catch (error) {
      console.error('Error loading configs:', error);
    }
  };

  const handleSaveAppMax = async () => {
    setLoading(true);
    try {
      console.log('Salvando configuração Appmax:', appmaxConfig);

      // Salvar no backend
      await appmaxService.updateConfig(appmaxConfig);

      // Salvar no store local
      appmaxStore.setAccessToken(appmaxConfig.accessToken);
      appmaxStore.setPublicKey(appmaxConfig.publicKey);
      appmaxStore.setApiUrl(appmaxConfig.apiUrl);
      appmaxStore.setEnabled(appmaxConfig.enabled);
      appmaxStore.setTrackingEnabled(appmaxConfig.trackingEnabled);
      appmaxStore.setConversionPixel(appmaxConfig.conversionPixel);

      alert('Configurações do AppMax salvas com sucesso!');
      console.log('Configuração salva com sucesso');
    } catch (error: any) {
      console.error('Error saving AppMax config:', error);
      alert('Erro ao salvar configurações do AppMax: ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleTestAppMax = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      console.log('Testando conexão Appmax:', {
        apiUrl: appmaxConfig.apiUrl,
        accessToken: appmaxConfig.accessToken ? '***' : 'vazio',
        publicKey: appmaxConfig.publicKey ? '***' : 'vazio',
      });

      const success = await appmaxService.testConnection(appmaxConfig);

      if (success) {
        appmaxStore.setConnected(true);
      }

      setTestResult({
        success,
        message: success
          ? 'Conexão estabelecida com sucesso!'
          : 'Falha ao conectar. Verifique as credenciais.',
      });
      console.log('Resultado do teste:', success);
    } catch (error: any) {
      console.error('Erro ao testar conexão:', error);
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão: ' + (error.message || 'Verifique as credenciais'),
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveTrackingPixels = async () => {
    setSavingPixels(true);
    try {
      const response = await fetch('/api/tracking-pixels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingPixels)
      });

      if (response.ok) {
        alert('Configurações de pixels salvas com sucesso! A página será recarregada para aplicar as mudanças.');
        window.location.reload();
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar tracking pixels:', error);
      alert('Erro ao salvar configurações de pixels');
    } finally {
      setSavingPixels(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integrações AppMax</h1>
          <p className="text-gray-600 mt-2">Configure a integração com AppMax</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* Connection Status */}
            {appmaxStore.isConnected && (
              <div className="p-4 bg-green-50 border border-green-200 rounded flex items-center gap-3">
                <FiCheckCircle className="text-green-600" size={24} />
                <div>
                  <p className="font-semibold text-green-900">Conectado ao AppMax</p>
                  <p className="text-sm text-green-700">Integração ativa e funcionando</p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <p className="font-semibold">Status da Integração</p>
                <p className="text-sm text-gray-600">
                  {appmaxConfig.enabled ? 'Ativa' : 'Inativa'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appmaxConfig.enabled}
                  onChange={(e) =>
                    setAppmaxConfig({ ...appmaxConfig, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
              </label>
            </div>

            {/* API URL */}
            <div>
              <label className="block text-sm font-medium mb-2">API URL</label>
              <input
                type="text"
                value={appmaxConfig.apiUrl}
                onChange={(e) =>
                  setAppmaxConfig({ ...appmaxConfig, apiUrl: e.target.value })
                }
                placeholder="https://admin.appmax.com.br/api/v3"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            {/* Access Token */}
            <div>
              <label className="block text-sm font-medium mb-2">Access Token</label>
              <input
                type="text"
                value={appmaxConfig.accessToken}
                onChange={(e) =>
                  setAppmaxConfig({ ...appmaxConfig, accessToken: e.target.value })
                }
                placeholder="Seu Access Token do AppMax"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-blue font-mono text-sm"
              />
            </div>

            {/* Public Key */}
            <div>
              <label className="block text-sm font-medium mb-2">Public Key</label>
              <input
                type="password"
                value={appmaxConfig.publicKey}
                onChange={(e) =>
                  setAppmaxConfig({ ...appmaxConfig, publicKey: e.target.value })
                }
                placeholder="Sua Public Key do AppMax"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-blue font-mono text-sm"
              />
            </div>

            {/* Conversion Pixel */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Pixel de Conversão (Opcional)
              </label>
              <textarea
                value={appmaxConfig.conversionPixel}
                onChange={(e) =>
                  setAppmaxConfig({
                    ...appmaxConfig,
                    conversionPixel: e.target.value,
                  })
                }
                placeholder="Cole aqui o código do pixel de conversão"
                rows={4}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-blue font-mono text-sm"
              />
            </div>

            {/* Tracking Options */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={appmaxConfig.trackingEnabled}
                  onChange={(e) =>
                    setAppmaxConfig({
                      ...appmaxConfig,
                      trackingEnabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span>Habilitar tracking de conversões</span>
              </label>
            </div>

            {/* Test Result */}
            {testResult && (
              <div
                className={`p-4 rounded flex items-center gap-3 ${
                  testResult.success
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {testResult.success ? (
                  <FiCheckCircle size={24} />
                ) : (
                  <FiXCircle size={24} />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleTestAppMax}
                disabled={testing || !appmaxConfig.accessToken || !appmaxConfig.publicKey}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                <FiRefreshCw className={testing ? 'animate-spin' : ''} />
                Testar Conexão
              </button>

              <button
                onClick={handleSaveAppMax}
                disabled={loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <FiSave />
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>

      {/* Tracking Pixels Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pixels de Rastreamento</h2>
          <p className="text-gray-600 mt-1">Configure seus pixels de conversão e análise</p>
        </div>

        <div className="space-y-6">
          {/* Meta Pixel */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Meta Pixel (Facebook)</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackingPixels.meta_pixel_enabled}
                  onChange={(e) => setTrackingPixels({ ...trackingPixels, meta_pixel_enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Ativado</span>
              </label>
            </div>
            <input
              type="text"
              value={trackingPixels.meta_pixel_id}
              onChange={(e) => setTrackingPixels({ ...trackingPixels, meta_pixel_id: e.target.value })}
              placeholder="Cole aqui seu Pixel ID (ex: 1234567890)"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">Encontre seu Pixel ID em: Meta Business Suite → Eventos → Pixels de Dados</p>
          </div>

          {/* Google Analytics */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Google Analytics</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackingPixels.google_analytics_enabled}
                  onChange={(e) => setTrackingPixels({ ...trackingPixels, google_analytics_enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Ativado</span>
              </label>
            </div>
            <input
              type="text"
              value={trackingPixels.google_analytics_id}
              onChange={(e) => setTrackingPixels({ ...trackingPixels, google_analytics_id: e.target.value })}
              placeholder="Cole aqui seu ID de medição (ex: G-XXXXXXXXXX)"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">Encontre seu ID em: Google Analytics → Admin → Fluxos de dados → ID de medição</p>
          </div>

          {/* Google Tag Manager */}
          <div className="pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Google Tag Manager</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackingPixels.google_tag_manager_enabled}
                  onChange={(e) => setTrackingPixels({ ...trackingPixels, google_tag_manager_enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Ativado</span>
              </label>
            </div>
            <input
              type="text"
              value={trackingPixels.google_tag_manager_id}
              onChange={(e) => setTrackingPixels({ ...trackingPixels, google_tag_manager_id: e.target.value })}
              placeholder="Cole aqui seu Container ID (ex: GTM-XXXXXXX)"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">Encontre seu ID em: Google Tag Manager → Workspace → Container ID</p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveTrackingPixels}
              disabled={savingPixels}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <FiSave />
              {savingPixels ? 'Salvando...' : 'Salvar Pixels'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
