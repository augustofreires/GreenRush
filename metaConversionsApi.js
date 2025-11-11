import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Meta Conversions API (CAPI) Service
 * 
 * Este serviço envia eventos de conversão server-side para o Facebook/Meta
 * Garante tracking mesmo com bloqueadores de anúncios, iOS 14+, etc.
 * 
 * IMPORTANTE: Usa try/catch para NUNCA quebrar o checkout se falhar
 */


// Configuração da Meta CAPI
const META_PIXEL_ID = process.env.META_PIXEL_ID;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_API_VERSION = 'v21.0';
const META_API_URL = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`;

/**
 * Hash SHA256 para dados do usuário (requisito da Meta)
 */
function hashData(data) {
  if (!data) return null;
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Normaliza e formata telefone brasileiro
 */
function normalizePhone(phone) {
  if (!phone) return null;
  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, '');
  // Adiciona código do país se não tiver
  return cleaned.startsWith('55') ? cleaned : '55' + cleaned;
}

/**
 * Envia evento Purchase para Meta Conversions API
 * 
 * @param {Object} data - Dados do pedido
 * @param {string} data.event_id - ID único do evento (para deduplicação com Pixel)
 * @param {string} data.order_id - ID do pedido
 * @param {Object} data.customer - Dados do cliente
 * @param {Array} data.items - Itens do pedido
 * @param {number} data.value - Valor total
 * @param {string} data.currency - Moeda (BRL)
 * @param {string} data.user_ip - IP do usuário
 * @param {string} data.user_agent - User agent do navegador
 */
async function trackPurchase(data) {
  try {
    // Validar configuração
    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      console.warn('⚠️  Meta CAPI: Pixel ID ou Access Token não configurados');
      return { success: false, error: 'Not configured' };
    }

    // Validar dados mínimos
    if (!data.order_id || !data.value) {
      console.warn('⚠️  Meta CAPI: Dados insuficientes para enviar evento');
      return { success: false, error: 'Insufficient data' };
    }

    // Preparar user_data (hasheado conforme requisitos da Meta)
    const user_data = {
      client_ip_address: data.user_ip || null,
      client_user_agent: data.user_agent || null,
    };

    // Adicionar dados do cliente (hasheados) se disponíveis
    if (data.customer) {
      if (data.customer.email) {
        user_data.em = hashData(data.customer.email);
      }
      if (data.customer.phone) {
        user_data.ph = hashData(normalizePhone(data.customer.phone));
      }
      if (data.customer.name) {
        const names = data.customer.name.split(' ');
        user_data.fn = hashData(names[0]); // primeiro nome
        if (names.length > 1) {
          user_data.ln = hashData(names[names.length - 1]); // último nome
        }
      }
      if (data.customer.city) {
        user_data.ct = hashData(data.customer.city);
      }
      if (data.customer.state) {
        user_data.st = hashData(data.customer.state);
      }
      if (data.customer.zip) {
        user_data.zp = hashData(data.customer.zip.replace(/\D/g, ''));
      }
      if (data.customer.country) {
        user_data.country = hashData(data.customer.country);
      }
    }

    // Preparar custom_data
    const custom_data = {
      currency: data.currency || 'BRL',
      value: parseFloat(data.value),
    };

    // Adicionar itens se disponíveis
    if (data.items && data.items.length > 0) {
      custom_data.content_ids = data.items.map(item => item.id.toString());
      custom_data.content_type = 'product';
      custom_data.num_items = data.items.reduce((sum, item) => sum + item.quantity, 0);
      custom_data.contents = data.items.map(item => ({
        id: item.id.toString(),
        quantity: item.quantity,
        item_price: item.price,
      }));
    }

    // Preparar payload para Meta API
    const event = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000), // Unix timestamp
      action_source: 'website',
      event_source_url: data.event_source_url || process.env.FRONTEND_URL || 'http://147.93.176.132',
      user_data: user_data,
      custom_data: custom_data,
    };

    // Adicionar event_id para deduplicação com Pixel (se fornecido)
    if (data.event_id) {
      event.event_id = data.event_id;
    }

    const payload = {
      data: [event],
      test_event_code: process.env.META_TEST_EVENT_CODE || undefined, // Para testes
    };

    console.log('📤 Meta CAPI: Enviando evento Purchase...', {
      order_id: data.order_id,
      value: data.value,
      event_id: data.event_id,
      has_email: !!user_data.em,
      has_phone: !!user_data.ph,
    });

    // Enviar para Meta API
    const response = await axios.post(
      META_API_URL,
      payload,
      {
        params: {
          access_token: META_ACCESS_TOKEN,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 segundos timeout
      }
    );

    console.log('✅ Meta CAPI: Purchase enviado com sucesso!', {
      events_received: response.data.events_received,
      fbtrace_id: response.data.fbtrace_id,
    });

    return {
      success: true,
      data: response.data,
    };

  } catch (error) {
    console.error('❌ Meta CAPI: Erro ao enviar evento Purchase:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // NÃO lançar erro - apenas retornar falha
    // Isso garante que o checkout nunca quebre por causa da Meta
    return {
      success: false,
      error: error.message,
      details: error.response?.data,
    };
  }
}

/**
 * Testa a conexão com Meta CAPI (útil para debug)
 */
async function testConnection() {
  try {
    if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
      return { success: false, error: 'Credenciais não configuradas' };
    }

    // Enviar evento de teste PageView
    const testEvent = {
      event_name: 'PageView',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: {
        client_ip_address: '127.0.0.1',
        client_user_agent: 'Meta CAPI Test',
      },
    };

    const response = await axios.post(
      META_API_URL,
      { data: [testEvent] },
      {
        params: { access_token: META_ACCESS_TOKEN },
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );

    return {
      success: true,
      message: 'Conexão com Meta CAPI funcionando!',
      data: response.data,
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: error.response?.data,
    };
  }
}

export default {
  trackPurchase,
  testConnection,
};
