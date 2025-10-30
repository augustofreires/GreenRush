import express from 'express';
import cors from 'cors';
import compression from 'compression';
import axios from 'axios';
import QRCode from 'qrcode';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getReviewStats
} from './backend/src/controllers/reviewController.js';

dotenv.config();
import { sendEmail, emailBoasVindas, emailConfirmacaoPedido, addContact, emailConfirmacaoNewsletter } from './reportana.js';


const app = express();
const PORT = 3001;

// Pool de conexões MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'greenrushapp',
  password: 'greenrush2024app',
  database: 'greenrush',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

console.log('✅ Pool de conexões MySQL criado!');

// Compressão gzip para todas as respostas - melhora performance drasticamente!
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Nível de compressão (0-9, 6 é um bom equilíbrio)
}));

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}));

// Endpoint para trocar código por token
app.post('/api/bling/token', async (req, res) => {
  try {
    const { code, clientId, clientSecret } = req.body;

    console.log('Trocando código por token...');

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);

    const response = await axios.post(
      'https://www.bling.com.br/Api/v3/oauth/token',
      params,
      {
        auth: {
          username: clientId,
          password: clientSecret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('Token obtido com sucesso!');
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao trocar código por token:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Endpoint para atualizar token
app.post('/api/bling/refresh-token', async (req, res) => {
  try {
    const { refreshToken, clientId, clientSecret } = req.body;

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const response = await axios.post(
      'https://www.bling.com.br/Api/v3/oauth/token',
      params,
      {
        auth: {
          username: clientId,
          password: clientSecret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao atualizar token:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Proxy para API do Bling
app.use('/api/bling/v3', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios({
      method: req.method,
      url: `https://www.bling.com.br/Api/v3${req.path}`,
      data: req.body,
      params: req.query,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    // Log detalhado para detalhes de produto (para debug de imagens)
    if (req.path.match(/^\/produtos\/\d+$/)) {
      console.log('=== RESPOSTA COMPLETA DO BLING (detalhes produto) ===');
      console.log('Path:', req.path);
      console.log('Data completo:', JSON.stringify(response.data, null, 2));
      console.log('====================================================');
    }

    res.json(response.data);
  } catch (error) {
    console.error('Erro na API do Bling:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// ==================== APPMAX API ====================

// Configuração de armazenamento em memória (em produção, usar banco de dados)
let appmaxConfig = {
  accessToken: '',
  publicKey: '',
  apiUrl: 'https://admin.appmax.com.br/api/v3',
  enabled: false,
  trackingEnabled: true,
  conversionPixel: '',
};

// Endpoint para teste de conexão com Appmax
app.post('/api/appmax/test-connection', async (req, res) => {
  try {
    const { accessToken, publicKey, apiUrl } = req.body;

    if (!accessToken || !publicKey) {
      return res.status(400).json({
        success: false,
        message: 'Access Token e Public Key são obrigatórios',
      });
    }

    const baseUrl = apiUrl || 'https://admin.appmax.com.br/api/v3';

    console.log('🔍 Testando conexão Appmax:', {
      baseUrl,
      hasToken: !!accessToken,
      hasKey: !!publicKey,
    });

    // Testar conexão com API da Appmax - tentar diferentes endpoints
    let response;
    let endpoint = '/orders'; // Endpoint mais comum

    try {
      response = await axios.get(`${baseUrl}${endpoint}`, {
        headers: {
          'Access-Token': accessToken,
          'Public-Key': publicKey,
          'Content-Type': 'application/json',
        },
        params: {
          limit: 1,
        },
      });
    } catch (error) {
      // Se falhar, tentar outro endpoint
      console.log('Tentando endpoint alternativo...');
      endpoint = '/products';
      response = await axios.get(`${baseUrl}${endpoint}`, {
        headers: {
          'Access-Token': accessToken,
          'Public-Key': publicKey,
          'Content-Type': 'application/json',
        },
        params: {
          limit: 1,
        },
      });
    }

    console.log('✅ Conexão Appmax bem-sucedida!', response.status);

    // Se recebeu status 200, considerar sucesso mesmo que o endpoint retorne "Not Found"
    // Isso significa que a autenticação está funcionando
    const isSuccess = response.status === 200;

    res.json({
      success: isSuccess,
      message: isSuccess
        ? 'Conexão estabelecida com sucesso! Credenciais válidas.'
        : 'Falha ao conectar com Appmax.',
      data: response.data,
      note: 'A API respondeu corretamente. As credenciais estão válidas.',
    });
  } catch (error) {
    console.error('❌ Erro ao testar conexão Appmax:', error.response?.data || error.message);
    res.status(200).json({
      success: false,
      message: 'Falha ao conectar com Appmax. Verifique suas credenciais.',
      error: error.response?.data || error.message,
    });
  }
});

// Obter configuração do Appmax
app.get('/api/appmax/config', (req, res) => {
  res.json(appmaxConfig);
});

// Atualizar configuração do Appmax
app.put('/api/appmax/config', (req, res) => {
  appmaxConfig = { ...appmaxConfig, ...req.body };
  res.json(appmaxConfig);
});

// Criar pedido no Appmax
app.post('/api/appmax/orders', async (req, res) => {
  try {
    if (!appmaxConfig.enabled || !appmaxConfig.accessToken) {
      return res.status(400).json({
        error: 'Appmax não está configurado ou habilitado',
      });
    }

    const response = await axios.post(
      `${appmaxConfig.apiUrl}/orders`,
      req.body,
      {
        headers: {
          'Access-Token': appmaxConfig.accessToken,
          'Public-Key': appmaxConfig.publicKey,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao criar pedido no Appmax:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Track de conversão
app.post('/api/appmax/track/conversion', async (req, res) => {
  try {
    if (!appmaxConfig.trackingEnabled) {
      return res.json({ success: true, message: 'Tracking desabilitado' });
    }

    const { orderId, total, items } = req.body;

    const response = await axios.post(
      `${appmaxConfig.apiUrl}/conversions`,
      {
        order_id: orderId,
        value: total,
        items: items,
      },
      {
        headers: {
          'Access-Token': appmaxConfig.accessToken,
          'Public-Key': appmaxConfig.publicKey,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao trackear conversão:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Track de pageview
app.post('/api/appmax/track/pageview', async (req, res) => {
  try {
    if (!appmaxConfig.trackingEnabled) {
      return res.json({ success: true, message: 'Tracking desabilitado' });
    }

    const { page } = req.body;

    // Log do pageview (em produção, enviar para Appmax ou analytics)
    console.log(`📊 Pageview: ${page}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao trackear pageview:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// Track de evento customizado
app.post('/api/appmax/track/event', async (req, res) => {
  try {
    if (!appmaxConfig.trackingEnabled) {
      return res.json({ success: true, message: 'Tracking desabilitado' });
    }

    const { event, data } = req.body;

    // Log do evento (em produção, enviar para Appmax ou analytics)
    console.log(`📊 Event: ${event}`, data);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao trackear evento:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// Obter link de afiliado
app.get('/api/appmax/affiliate/link/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const response = await axios.get(
      `${appmaxConfig.apiUrl}/affiliates/products/${productId}/link`,
      {
        headers: {
          'Access-Token': appmaxConfig.accessToken,
          'Public-Key': appmaxConfig.publicKey,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao obter link de afiliado:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Obter estatísticas de afiliados
app.get('/api/appmax/affiliate/stats', async (req, res) => {
  try {
    const response = await axios.get(
      `${appmaxConfig.apiUrl}/affiliates/stats`,
      {
        headers: {
          'Access-Token': appmaxConfig.accessToken,
          'Public-Key': appmaxConfig.publicKey,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Obter comissões
app.get('/api/appmax/commissions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const response = await axios.get(
      `${appmaxConfig.apiUrl}/commissions`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
        headers: {
          'Access-Token': appmaxConfig.accessToken,
          'Public-Key': appmaxConfig.publicKey,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao obter comissões:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Webhook do Appmax
app.post('/api/appmax/webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log('📥 Webhook Appmax recebido:', payload);

    // Processar webhook (implementar lógica de negócio)
    // Por exemplo: atualizar status de pedido, comissão de afiliado, etc.

    res.json({ success: true, message: 'Webhook processado' });
  } catch (error) {
    console.error('Erro ao processar webhook Appmax:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// ==================== DASHBOARD API ====================

// Armazenar token do Bling (em produção, usar banco de dados)
let blingAccessToken = '';

// Endpoint para configurar token do Bling
app.post('/api/dashboard/config/bling-token', (req, res) => {
  const { accessToken } = req.body;
  blingAccessToken = accessToken;
  res.json({ success: true, message: 'Token configurado com sucesso' });
});

// Obter estatísticas gerais do dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    let totalOrders = 0;
    let totalRevenue = 0;
    let totalCustomers = 0;
    let pendingOrders = 0;

    // ========== DADOS DO BLING ==========
    if (blingAccessToken) {
      try {
        // Buscar pedidos do Bling
        const pedidosResponse = await axios.get(
          'https://www.bling.com.br/Api/v3/pedidos/vendas',
          {
            headers: {
              'Authorization': `Bearer ${blingAccessToken}`,
              'Content-Type': 'application/json',
            },
            params: {
              limite: 100,
            },
          }
        );

        const pedidos = pedidosResponse.data.data || [];

        totalOrders += pedidos.length;
        totalRevenue += pedidos.reduce((sum, pedido) => {
          return sum + (parseFloat(pedido.total) || 0);
        }, 0);

        // Contar pedidos pendentes
        pendingOrders += pedidos.filter(pedido => {
          const situacao = pedido.situacao?.valor || '';
          return !['Atendido', 'Cancelado', 'Faturado'].includes(situacao);
        }).length;

        // Buscar contatos (clientes) do Bling
        try {
          const contatosResponse = await axios.get(
            'https://www.bling.com.br/Api/v3/contatos',
            {
              headers: {
                'Authorization': `Bearer ${blingAccessToken}`,
                'Content-Type': 'application/json',
              },
              params: {
                limite: 1,
              },
            }
          );

          totalCustomers += contatosResponse.data.total || 0;
        } catch (error) {
          console.warn('Erro ao buscar contatos do Bling:', error.message);
        }
      } catch (error) {
        console.warn('Erro ao buscar dados do Bling:', error.message);
      }
    }

    // ========== DADOS DA APPMAX ==========
    if (appmaxConfig.enabled && appmaxConfig.accessToken) {
      try {
        // Buscar pedidos da Appmax
        const appmaxOrdersResponse = await axios.get(
          `${appmaxConfig.apiUrl}/orders`,
          {
            headers: {
              'Access-Token': appmaxConfig.accessToken,
              'Public-Key': appmaxConfig.publicKey,
              'Content-Type': 'application/json',
            },
            params: {
              limit: 100,
            },
          }
        );

        const appmaxOrders = appmaxOrdersResponse.data.data || appmaxOrdersResponse.data || [];

        totalOrders += appmaxOrders.length;
        totalRevenue += appmaxOrders.reduce((sum, order) => {
          return sum + (parseFloat(order.value || order.total || order.amount) || 0);
        }, 0);

        // Contar pedidos pendentes da Appmax
        pendingOrders += appmaxOrders.filter(order => {
          const status = order.status?.toLowerCase() || '';
          return !['approved', 'completed', 'cancelled'].includes(status);
        }).length;

        // Buscar clientes da Appmax
        try {
          const appmaxCustomersResponse = await axios.get(
            `${appmaxConfig.apiUrl}/customers`,
            {
              headers: {
                'Access-Token': appmaxConfig.accessToken,
                'Public-Key': appmaxConfig.publicKey,
                'Content-Type': 'application/json',
              },
              params: {
                limit: 1,
              },
            }
          );

          totalCustomers += appmaxCustomersResponse.data.total || appmaxCustomersResponse.data.length || 0;
        } catch (error) {
          console.warn('Erro ao buscar clientes da Appmax:', error.message);
        }
      } catch (error) {
        console.warn('Erro ao buscar dados da Appmax:', error.message);
      }
    }

    res.json({
      totalOrders,
      totalRevenue,
      totalCustomers,
      pendingOrders,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Obter pedidos recentes
app.get('/api/dashboard/recent-orders', async (req, res) => {
  try {
    let allOrders = [];

    // ========== PEDIDOS DO BLING ==========
    if (blingAccessToken) {
      try {
        const response = await axios.get(
          'https://www.bling.com.br/Api/v3/pedidos/vendas',
          {
            headers: {
              'Authorization': `Bearer ${blingAccessToken}`,
              'Content-Type': 'application/json',
            },
            params: {
              limite: 10,
              ordenarPor: 'data',
            },
          }
        );

        const pedidos = response.data.data || [];

        // Formatar pedidos do Bling
        const blingOrders = pedidos.map(pedido => ({
          id: pedido.id,
          numero: pedido.numero,
          data: pedido.data,
          cliente: pedido.contato?.nome || 'Cliente não identificado',
          total: parseFloat(pedido.total) || 0,
          situacao: pedido.situacao?.valor || 'Pendente',
          itens: pedido.itens?.length || 0,
          origem: 'Bling',
        }));

        allOrders.push(...blingOrders);
      } catch (error) {
        console.warn('Erro ao buscar pedidos do Bling:', error.message);
      }
    }

    // ========== PEDIDOS DA APPMAX ==========
    if (appmaxConfig.enabled && appmaxConfig.accessToken) {
      try {
        const response = await axios.get(
          `${appmaxConfig.apiUrl}/orders`,
          {
            headers: {
              'Access-Token': appmaxConfig.accessToken,
              'Public-Key': appmaxConfig.publicKey,
              'Content-Type': 'application/json',
            },
            params: {
              limit: 10,
              order_by: 'created_at',
              order_dir: 'desc',
            },
          }
        );

        const appmaxOrders = response.data.data || response.data || [];

        // Formatar pedidos da Appmax
        const formattedAppmax = appmaxOrders.map(order => ({
          id: order.id,
          numero: order.order_number || order.code || `#${order.id}`,
          data: order.created_at || order.date,
          cliente: order.customer?.name || order.customer_name || 'Cliente não identificado',
          total: parseFloat(order.value || order.total || order.amount) || 0,
          situacao: order.status || 'Pendente',
          itens: order.items?.length || 0,
          origem: 'Appmax',
        }));

        allOrders.push(...formattedAppmax);
      } catch (error) {
        console.warn('Erro ao buscar pedidos da Appmax:', error.message);
      }
    }

    // Ordenar todos os pedidos por data (mais recente primeiro)
    allOrders.sort((a, b) => {
      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      return dateB - dateA;
    });

    // Retornar apenas os 10 mais recentes
    res.json(allOrders.slice(0, 10));
  } catch (error) {
    console.error('Erro ao buscar pedidos recentes:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Obter alertas de estoque baixo
app.get('/api/dashboard/stock-alerts', async (req, res) => {
  try {
    if (!blingAccessToken) {
      return res.status(400).json({
        error: 'Token do Bling não configurado',
      });
    }

    const response = await axios.get(
      'https://www.bling.com.br/Api/v3/produtos',
      {
        headers: {
          'Authorization': `Bearer ${blingAccessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          limite: 100,
        },
      }
    );

    const produtos = response.data.data || [];

    // Filtrar produtos com estoque baixo (menos de 10 unidades)
    const lowStockProducts = [];

    for (const produto of produtos) {
      try {
        // Buscar estoque de cada produto
        const estoqueResponse = await axios.get(
          `https://www.bling.com.br/Api/v3/estoques/${produto.id}`,
          {
            headers: {
              'Authorization': `Bearer ${blingAccessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const estoques = estoqueResponse.data.data || [];
        const totalEstoque = estoques.reduce((sum, e) => sum + (parseFloat(e.saldoFisico) || 0), 0);

        if (totalEstoque < 10) {
          lowStockProducts.push({
            id: produto.id,
            nome: produto.nome,
            codigo: produto.codigo,
            estoque: totalEstoque,
            preco: parseFloat(produto.preco) || 0,
          });
        }

        // Limitar a 10 produtos para não sobrecarregar
        if (lowStockProducts.length >= 10) break;
      } catch (error) {
        console.warn(`Erro ao buscar estoque do produto ${produto.id}:`, error.message);
      }
    }

    res.json(lowStockProducts);
  } catch (error) {
    console.error('Erro ao buscar alertas de estoque:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Obter dados para gráfico de vendas (últimos 30 dias)
app.get('/api/dashboard/sales-chart', async (req, res) => {
  try {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 30);
    const salesByDay = {};

    // ========== DADOS DO BLING ==========
    if (blingAccessToken) {
      try {
        const response = await axios.get(
          'https://www.bling.com.br/Api/v3/pedidos/vendas',
          {
            headers: {
              'Authorization': `Bearer ${blingAccessToken}`,
              'Content-Type': 'application/json',
            },
            params: {
              limite: 100,
              dataInicial: dataInicio.toISOString().split('T')[0],
            },
          }
        );

        const pedidos = response.data.data || [];

        // Agrupar vendas por dia
        pedidos.forEach(pedido => {
          const data = pedido.data?.split(' ')[0]; // Pegar só a data (YYYY-MM-DD)
          if (data) {
            if (!salesByDay[data]) {
              salesByDay[data] = {
                data,
                vendas: 0,
                receita: 0,
              };
            }
            salesByDay[data].vendas += 1;
            salesByDay[data].receita += parseFloat(pedido.total) || 0;
          }
        });
      } catch (error) {
        console.warn('Erro ao buscar dados do Bling para gráfico:', error.message);
      }
    }

    // ========== DADOS DA APPMAX ==========
    if (appmaxConfig.enabled && appmaxConfig.accessToken) {
      try {
        const response = await axios.get(
          `${appmaxConfig.apiUrl}/orders`,
          {
            headers: {
              'Access-Token': appmaxConfig.accessToken,
              'Public-Key': appmaxConfig.publicKey,
              'Content-Type': 'application/json',
            },
            params: {
              limit: 100,
              created_after: dataInicio.toISOString().split('T')[0],
            },
          }
        );

        const appmaxOrders = response.data.data || response.data || [];

        // Agrupar vendas da Appmax por dia
        appmaxOrders.forEach(order => {
          const dataStr = order.created_at || order.date;
          const data = dataStr?.split('T')[0] || dataStr?.split(' ')[0];
          if (data) {
            if (!salesByDay[data]) {
              salesByDay[data] = {
                data,
                vendas: 0,
                receita: 0,
              };
            }
            salesByDay[data].vendas += 1;
            salesByDay[data].receita += parseFloat(order.value || order.total || order.amount) || 0;
          }
        });
      } catch (error) {
        console.warn('Erro ao buscar dados da Appmax para gráfico:', error.message);
      }
    }

    // Converter para array e ordenar por data
    const chartData = Object.values(salesByDay).sort((a, b) => {
      return new Date(a.data) - new Date(b.data);
    });

    res.json(chartData);
  } catch (error) {
    console.error('Erro ao buscar dados do gráfico:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// ==================== ORDER TRACKING API ====================

// Buscar pedido por ID (busca primeiro localmente, depois em Bling e Appmax)
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let foundOrder = null;

    // Buscar primeiro nos pedidos locais (criados no site)
    foundOrder = orders.find(o => o.id === id);

    if (foundOrder) {
      console.log(`✅ Pedido encontrado localmente: ${id}`);
      return res.json(foundOrder);
    }

    // Se não encontrou localmente, buscar no Bling
    if (blingAccessToken) {
      try {
        const blingResponse = await axios.get(
          `https://www.bling.com.br/Api/v3/pedidos/vendas/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${blingAccessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const pedido = blingResponse.data.data;
        if (pedido) {
          foundOrder = {
            id: pedido.id,
            userId: pedido.contato?.id || '',
            items: pedido.itens?.map(item => ({
              id: item.produto?.id || '',
              name: item.descricao || '',
              price: parseFloat(item.valor) || 0,
              quantity: parseFloat(item.quantidade) || 1,
              image: item.produto?.imageThumbnail || '/placeholder.png',
            })) || [],
            total: parseFloat(pedido.total) || 0,
            status: mapBlingStatus(pedido.situacao?.valor),
            shippingAddress: {
              street: pedido.transporte?.endereco?.rua || '',
              number: pedido.transporte?.endereco?.numero || '',
              complement: pedido.transporte?.endereco?.complemento || '',
              neighborhood: pedido.transporte?.endereco?.bairro || '',
              city: pedido.transporte?.endereco?.municipio || '',
              state: pedido.transporte?.endereco?.uf || '',
              zipCode: pedido.transporte?.endereco?.cep || '',
              country: 'Brasil',
            },
            billingAddress: {
              street: pedido.transporte?.endereco?.rua || '',
              number: pedido.transporte?.endereco?.numero || '',
              complement: pedido.transporte?.endereco?.complemento || '',
              neighborhood: pedido.transporte?.endereco?.bairro || '',
              city: pedido.transporte?.endereco?.municipio || '',
              state: pedido.transporte?.endereco?.uf || '',
              zipCode: pedido.transporte?.endereco?.cep || '',
              country: 'Brasil',
            },
            paymentMethod: 'Não especificado',
            createdAt: new Date(pedido.data),
            updatedAt: new Date(pedido.data),
          };
        }
      } catch (error) {
        console.warn('Pedido não encontrado no Bling:', error.message);
      }
    }

    // Se não encontrou no Bling, buscar na Appmax
    if (!foundOrder && appmaxConfig.enabled && appmaxConfig.accessToken) {
      try {
        const appmaxResponse = await axios.get(
          `${appmaxConfig.apiUrl}/orders/${id}`,
          {
            headers: {
              'Access-Token': appmaxConfig.accessToken,
              'Public-Key': appmaxConfig.publicKey,
              'Content-Type': 'application/json',
            },
          }
        );

        const order = appmaxResponse.data.data || appmaxResponse.data;
        if (order) {
          foundOrder = {
            id: order.id,
            userId: order.customer?.id || order.customer_id || '',
            items: order.items?.map(item => ({
              id: item.id || item.product_id,
              name: item.name || item.product_name,
              price: parseFloat(item.price || item.value) || 0,
              quantity: parseInt(item.quantity) || 1,
              image: item.image || '/placeholder.png',
            })) || [],
            total: parseFloat(order.value || order.total || order.amount) || 0,
            status: mapAppmaxStatus(order.status),
            shippingAddress: {
              street: order.shipping_address?.street || '',
              number: order.shipping_address?.number || '',
              complement: order.shipping_address?.complement || '',
              neighborhood: order.shipping_address?.neighborhood || '',
              city: order.shipping_address?.city || '',
              state: order.shipping_address?.state || '',
              zipCode: order.shipping_address?.zipcode || '',
              country: 'Brasil',
            },
            billingAddress: {
              street: order.billing_address?.street || order.shipping_address?.street || '',
              number: order.billing_address?.number || order.shipping_address?.number || '',
              complement: order.billing_address?.complement || '',
              neighborhood: order.billing_address?.neighborhood || '',
              city: order.billing_address?.city || '',
              state: order.billing_address?.state || '',
              zipCode: order.billing_address?.zipcode || '',
              country: 'Brasil',
            },
            paymentMethod: order.payment_method || 'Não especificado',
            createdAt: new Date(order.created_at || order.date),
            updatedAt: new Date(order.updated_at || order.date),
          };
        }
      } catch (error) {
        console.warn('Pedido não encontrado na Appmax:', error.message);
      }
    }

    if (!foundOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(foundOrder);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error.message);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

// Buscar pedidos por CPF
app.get('/api/orders/customer/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;
    let allOrders = [];

    // Buscar no Bling por CPF
    if (blingAccessToken) {
      try {
        // Primeiro, buscar contato pelo CPF
        const contatosResponse = await axios.get(
          'https://www.bling.com.br/Api/v3/contatos',
          {
            headers: {
              'Authorization': `Bearer ${blingAccessToken}`,
              'Content-Type': 'application/json',
            },
            params: {
              criterio: 2, // Buscar por CPF/CNPJ
              numeroDocumento: cpf.replace(/\D/g, ''),
            },
          }
        );

        const contatos = contatosResponse.data.data || [];

        // Para cada contato encontrado, buscar seus pedidos
        for (const contato of contatos) {
          const pedidosResponse = await axios.get(
            'https://www.bling.com.br/Api/v3/pedidos/vendas',
            {
              headers: {
                'Authorization': `Bearer ${blingAccessToken}`,
                'Content-Type': 'application/json',
              },
              params: {
                idContato: contato.id,
                limite: 10,
              },
            }
          );

          const pedidos = pedidosResponse.data.data || [];
          allOrders.push(...pedidos.map(p => ({ ...p, origem: 'Bling' })));
        }
      } catch (error) {
        console.warn('Erro ao buscar pedidos no Bling:', error.message);
      }
    }

    // Buscar na Appmax por CPF
    if (appmaxConfig.enabled && appmaxConfig.accessToken) {
      try {
        const appmaxResponse = await axios.get(
          `${appmaxConfig.apiUrl}/orders`,
          {
            headers: {
              'Access-Token': appmaxConfig.accessToken,
              'Public-Key': appmaxConfig.publicKey,
              'Content-Type': 'application/json',
            },
            params: {
              customer_document: cpf.replace(/\D/g, ''),
              limit: 10,
            },
          }
        );

        const appmaxOrders = appmaxResponse.data.data || appmaxResponse.data || [];
        allOrders.push(...appmaxOrders.map(o => ({ ...o, origem: 'Appmax' })));
      } catch (error) {
        console.warn('Erro ao buscar pedidos na Appmax:', error.message);
      }
    }

    res.json(allOrders);
  } catch (error) {
    console.error('Erro ao buscar pedidos por CPF:', error.message);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// Função auxiliar para mapear status do Bling
function mapBlingStatus(status) {
  const statusMap = {
    'Em aberto': 'pending',
    'Em andamento': 'processing',
    'Atendido': 'shipped',
    'Faturado': 'delivered',
    'Cancelado': 'cancelled',
  };
  return statusMap[status] || 'pending';
}

// Função auxiliar para mapear status da Appmax
function mapAppmaxStatus(status) {
  const statusLower = (status || '').toLowerCase();
  const statusMap = {
    'pending': 'pending',
    'processing': 'processing',
    'approved': 'processing',
    'shipped': 'shipped',
    'delivered': 'delivered',
    'completed': 'delivered',
    'cancelled': 'cancelled',
  };
  return statusMap[statusLower] || 'pending';
}

// ==================== LEADS/NEWSLETTER API ====================

// Armazenamento em memória dos leads (em produção, usar banco de dados)
// Salvar novo lead
app.post('/api/leads', async (req, res) => {
  try {
    const { phone, email, acceptMarketing, source = "popup" } = req.body;

    if (!phone || !email) {
      return res.status(400).json({
        error: 'Telefone e email são obrigatórios',
      });
    }

    const leadId = Date.now().toString();
    const createdAt = new Date();

    // Verificar se já existe contato com esse email
    const [existing] = await db.execute('SELECT id, type FROM contacts WHERE email = ?', [email]);

    if (existing.length > 0) {
      // Atualizar contato existente se necessário
      if (existing[0].type === 'lead') {
        await db.execute(
          'UPDATE contacts SET phone = ?, accept_marketing = ?, updated_at = ? WHERE email = ?',
          [phone, acceptMarketing || true, createdAt, email]
        );
      }

      console.log(`📧 Lead atualizado: ${email} - ${phone}`);

      return res.json({
        success: true,
        lead: { id: existing[0].id, email, phone, acceptMarketing: acceptMarketing || true, createdAt },
      });
    }

    // Criar novo lead
    await db.execute(
      'INSERT INTO contacts (id, name, email, phone, type, source, accept_marketing, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [leadId, email.split('@')[0], email, phone, 'lead', 'popup', acceptMarketing || true, createdAt]
    );

    console.log(`📧 Novo lead capturado: ${email} - ${phone}`);
    // Adicionar ao Reportana e enviar email de confirmação
    try {
      // Adicionar contato ao Reportana
      await addContact({
        email: email,
        phone: phone,
        name: email.split('@')[0]
      });
      // Email será enviado pela automação do Reportana
      
    } catch (reportanaError) {
      console.error('⚠️ Erro ao processar Reportana:', reportanaError);
      // Não falha a captura do lead se Reportana falhar
    }


    res.json({
      success: true,
      lead: { id: leadId, email, phone, acceptMarketing: acceptMarketing || true, createdAt },
    });
  } catch (error) {
    console.error('Erro ao salvar lead:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// Buscar todos os leads
app.get('/api/leads', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM contacts WHERE type = 'lead' ORDER BY created_at DESC");

    const leads = rows.map(row => ({
      id: row.id,
      phone: row.phone,
      email: row.email,
      acceptMarketing: Boolean(row.accept_marketing),
      createdAt: row.created_at
    }));

    res.json(leads);
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// Endpoint para buscar clientes
app.get('/api/dashboard/customers', async (req, res) => {
  try {
    const allCustomers = [];

    // Buscar clientes do Bling
    if (blingAccessToken) {
      try {
        const blingResponse = await axios.get(
          'https://www.bling.com.br/Api/v3/contatos',
          {
            headers: {
              'Authorization': `Bearer ${blingAccessToken}`,
              'Content-Type': 'application/json',
            },
            params: {
              limite: 50,
            },
          }
        );

        const blingContatos = blingResponse.data.data || [];

        const formattedBling = blingContatos.map(contato => ({
          id: contato.id,
          nome: contato.nome || 'Sem nome',
          email: contato.email || 'Não informado',
          telefone: contato.telefone || contato.celular || 'Não informado',
          numeroContato: contato.numeroContato || '',
          origem: 'Bling',
        }));

        allCustomers.push(...formattedBling);
      } catch (error) {
        console.warn('Erro ao buscar clientes do Bling:', error.message);
      }
    }

    // Buscar clientes da Appmax
    if (appmaxConfig.enabled && appmaxConfig.accessToken) {
      try {
        const appmaxResponse = await axios.get(
          `${appmaxConfig.apiUrl}/customers`,
          {
            headers: {
              'Access-Token': appmaxConfig.accessToken,
              'Public-Key': appmaxConfig.publicKey,
              'Content-Type': 'application/json',
            },
            params: {
              limit: 50,
            },
          }
        );

        const appmaxCustomers = appmaxResponse.data.data || appmaxResponse.data || [];

        const formattedAppmax = appmaxCustomers.map(customer => ({
          id: customer.id,
          nome: customer.name || customer.customer_name || 'Sem nome',
          email: customer.email || 'Não informado',
          telefone: customer.phone || customer.telephone || 'Não informado',
          numeroContato: customer.document || '',
          origem: 'Appmax',
        }));

        allCustomers.push(...formattedAppmax);
      } catch (error) {
        console.warn('Erro ao buscar clientes da Appmax:', error.message);
      }
    }

    res.json(allCustomers);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error.message);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// ==================== USER AUTH API ====================

// Registro de novo usuário
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validar campos obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, e-mail e senha são obrigatórios',
      });
    }

    // Verificar se o email já está cadastrado
    const [existing] = await db.execute('SELECT id, type, password FROM contacts WHERE email = ?', [email]);

    if (existing.length > 0 && existing[0].password) {
      return res.status(400).json({
        success: false,
        message: 'Este e-mail já está cadastrado',
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString();
    const createdAt = new Date();

    if (existing.length > 0) {
      // Atualizar lead existente para customer com senha
      await db.execute(
        'UPDATE contacts SET name = ?, phone = ?, password = ?, type = ?, source = ?, updated_at = ? WHERE email = ?',
        [name, phone || '', hashedPassword, 'customer', 'site', createdAt, email]
      );

      console.log(`👤 Lead convertido para customer: ${email}`);

    // Adicionar cliente convertido à lista do Reportana
    try {
      await addContact({
        email: email,
        phone: phone || "",
        name: name,
        segmentId: process.env.REPORTANA_SEGMENT_CLIENTES
      });
      console.log(`✅ Cliente convertido adicionado ao Reportana: ${email}`);
    } catch (reportanaError) {
      console.error("⚠️ Erro ao adicionar cliente ao Reportana:", reportanaError);
    }
    // Enviar email de boas-vindas
    if (email) {
      try {
        const htmlContent = emailBoasVindas(name, email);
        await sendEmail({
          to: email,
          subject: 'Bem-vindo à Green Rush! 🌿',
          html: htmlContent
        });
        console.log(`📧 Email de boas-vindas enviado para: ${email}`);
      } catch (emailError) {
        console.error('⚠️ Erro ao enviar email de boas-vindas:', emailError);
      }
    }


      return res.json({
        success: true,
        message: 'Cadastro realizado com sucesso!',
        user: {
          id: existing[0].id,
          name,
          email,
          phone: phone || '',
          role: 'customer',
          createdAt: existing[0].created_at
        },
      });
    }

    // Criar novo customer
    await db.execute(
      'INSERT INTO contacts (id, name, email, phone, password, type, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email, phone || '', hashedPassword, 'customer', 'site', createdAt]
    );

    console.log(`👤 Novo customer cadastrado: ${email}`);

    // Adicionar cliente à lista do Reportana
    try {
      await addContact({
        email: email,
        phone: phone || "",
        name: name,
        segmentId: process.env.REPORTANA_SEGMENT_CLIENTES
      });
      console.log(`✅ Cliente adicionado ao Reportana: ${email}`);
    } catch (reportanaError) {
      console.error("⚠️ Erro ao adicionar cliente ao Reportana:", reportanaError);
    }
    // Enviar email de boas-vindas
    if (email) {
      try {
        const htmlContent = emailBoasVindas(name, email);
        await sendEmail({
          to: email,
          subject: 'Bem-vindo à Green Rush! 🌿',
          html: htmlContent
        });
        console.log(`📧 Email de boas-vindas enviado para: ${email}`);
      } catch (emailError) {
        console.error('⚠️ Erro ao enviar email de boas-vindas:', emailError);
      }
    }


    res.json({
      success: true,
      message: 'Cadastro realizado com sucesso!',
      user: {
        id: userId,
        name,
        email,
        phone: phone || '',
        role: 'customer',
        createdAt
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar cadastro',
    });
  }
});

// Login de usuário
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-mail e senha são obrigatórios',
      });
    }

    // Buscar usuário (apenas customers e admins têm senha)
    const [contacts] = await db.execute("SELECT * FROM contacts WHERE email = ? AND type IN ('customer', 'admin')", [email]);

    if (contacts.length === 0 || !contacts[0].password) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou senha incorretos',
      });
    }

    const contact = contacts[0];

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, contact.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou senha incorretos',
      });
    }

    console.log(`✅ Login bem-sucedido: ${email}`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        role: contact.type,
        createdAt: contact.created_at
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar login',
    });
  }
});

// Listar todos os usuários (customers) - para admin
app.get('/api/users', async (req, res) => {
  try {
    const [contacts] = await db.execute("SELECT id, name, email, phone, type, source, total_spent, last_purchase, created_at FROM contacts WHERE type IN ('customer', 'admin') ORDER BY created_at DESC");

    const usersFormatted = contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      role: contact.type,
      source: contact.source,
      totalSpent: parseFloat(contact.total_spent),
      lastPurchase: contact.last_purchase,
      createdAt: contact.created_at
    }));

    res.json(usersFormatted);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários',
    });
  }
});

// ==================== ADMIN AUTH API ====================

// Tokens de sessão (em produção, usar Redis ou banco de dados)
let adminSessions = new Map();

// Login de admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuário e senha são obrigatórios',
      });
    }

    // Verificar credenciais usando bcrypt
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

    if (!ADMIN_PASSWORD_HASH) {
      console.error('❌ ADMIN_PASSWORD_HASH não configurado no .env');
      return res.status(500).json({
        success: false,
        message: 'Configuração do servidor incorreta',
      });
    }

    if (username === ADMIN_USERNAME) {
      const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      
      if (passwordMatch) {
        // Gerar token de sessão
        const token = Buffer.from(`${username}:${Date.now()}:${Math.random()}`).toString('base64');

        // Armazenar sessão (expira em 24 horas)
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
        adminSessions.set(token, {
          username,
          expiresAt,
        });

        console.log(`🔐 Admin login bem-sucedido: ${username}`);

        return res.json({
          success: true,
          token,
          message: 'Login realizado com sucesso',
        });
      }
    }

    console.log(`❌ Tentativa de login falhou: ${username}`);

    // Delay para prevenir ataques de força bruta
    setTimeout(() => {
      res.status(401).json({
        success: false,
        message: 'Usuário ou senha incorretos',
      });
    }, 1000);

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar login',
    });
  }
});
// Verificar sessão
app.get('/api/admin/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido',
      });
    }

    const session = adminSessions.get(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Sessão inválida',
      });
    }

    // Verificar se expirou
    if (Date.now() > session.expiresAt) {
      adminSessions.delete(token);
      return res.status(401).json({
        success: false,
        message: 'Sessão expirada',
      });
    }

    res.json({
      success: true,
      username: session.username,
    });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar sessão',
    });
  }
});

// Logout
app.post('/api/admin/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      adminSessions.delete(token);
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar logout',
    });
  }
});

// Middleware para proteger rotas de admin
function requireAdminAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação necessária',
    });
  }

  const session = adminSessions.get(token);

  if (!session || Date.now() > session.expiresAt) {
    if (session) adminSessions.delete(token);
    return res.status(401).json({
      success: false,
      message: 'Sessão inválida ou expirada',
    });
  }

  req.adminUser = session.username;
  next();
}

// ==================== ORDERS API ====================

// Criar novo pedido
app.post('/api/orders', async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: 'Carrinho vazio',
      });
    }

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        error: 'Dados de envio ou pagamento faltando',
      });
    }

    // Calcular total
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 350 ? 0 : 29.90;
    const pixDiscount = paymentMethod === 'pix' ? subtotal * 0.05 : 0;
    const total = subtotal + shipping - pixDiscount;

    const orderId = `ORD-${Date.now()}`;
    const createdAt = new Date();

    const itemsJSON = JSON.stringify(items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || item.images?.[0] || '',
    })));

    const shippingJSON = JSON.stringify(shippingAddress);

    await db.execute(
      'INSERT INTO orders (id, customer_name, customer_email, customer_phone, customer_cpf, items, total, payment_method, shipping_address, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        orderId,
        shippingAddress.name || 'Cliente',
        shippingAddress.email || '',
        shippingAddress.phone || '',
        shippingAddress.cpf || '',
        itemsJSON,
        total,
        paymentMethod,
        shippingJSON,
        'pending',
        createdAt
      ]
    );

    const newOrder = {
      id: orderId,
      userId: req.body.userId || 'guest',
      items: JSON.parse(itemsJSON),
      total,
      subtotal,
      shipping,
      discount: pixDiscount,
      status: 'pending',
      paymentMethod,
      paymentStatus: 'pending',
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };

    console.log(`🛒 Novo pedido criado: ${orderId} - R$ ${total.toFixed(2)}`);


    res.json(newOrder);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// Gerar código PIX para um pedido
app.post('/api/orders/:id/generate-pix', async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);

    if (orders.length === 0) {
      return res.status(404).json({
        error: 'Pedido não encontrado',
      });
    }

    const order = orders[0];

    // Gerar código PIX (simulado - em produção, usar gateway de pagamento real)
    const pixData = {
      pixType: 'static',
      merchant: {
        name: 'GREEN RUSH',
        city: 'Campinas',
      },
      amount: order.total.toFixed(2),
      transactionId: order.id,
    };

    // Gerar código PIX copia e cola (formato simplificado)
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${order.id}520400005303986540${order.total.toFixed(2)}5802BR5913GREEN RUSH6009Campinas62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Gerar QR Code
    const qrCodeDataURL = await QRCode.toDataURL(pixCode);

    console.log(`💳 PIX gerado para pedido: ${order.id}`);

    res.json({
      pixCode,
      qrCodeDataURL,
      amount: order.total,
      orderId: order.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
    });
  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// Buscar todos os pedidos
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM orders ORDER BY created_at DESC');

    // Parsear JSON dos itens e endereço
    const orders = rows.map(order => ({
      id: order.id,
      userId: 'guest', // Pode adicionar userId na tabela futuramente
      items: JSON.parse(order.items),
      total: parseFloat(order.total),
      status: order.status,
      paymentMethod: order.payment_method,
      shippingAddress: JSON.parse(order.shipping_address),
      createdAt: order.created_at,
    }));

    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// Buscar pedidos por usuário
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.execute('SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC', [userId]);

    const orders = rows.map(order => ({
      id: order.id,
      userId,
      items: JSON.parse(order.items),
      total: parseFloat(order.total),
      status: order.status,
      paymentMethod: order.payment_method,
      shippingAddress: JSON.parse(order.shipping_address),
      createdAt: order.created_at,
    }));

    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// Atualizar status do pedido
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Pedido não encontrado',
      });
    }

    const [orders] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);
    const order = orders[0];

    console.log(`📦 Pedido ${id} atualizado para: ${status}`);

    res.json({
      id: order.id,
      items: JSON.parse(order.items),
      total: parseFloat(order.total),
      status: order.status,
      paymentMethod: order.payment_method,
      shippingAddress: JSON.parse(order.shipping_address),
      createdAt: order.created_at,
    });
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// ==================== REVIEWS API ====================

// Criar nova avaliação
app.post('/api/reviews', async (req, res) => {
  try {
    const { productId, userId, userName, userEmail, rating, title, comment, isVerifiedPurchase } = req.body;

    if (!productId || !userId || !userName || !userEmail || !rating || !comment) {
      return res.status(400).json({
        error: 'Campos obrigatórios faltando',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating deve ser entre 1 e 5' });
    }

    const reviewId = uuidv4();

    // Inserir avaliação na tabela reviews
    await db.execute(
      `INSERT INTO reviews (id, product_id, user_id, user_name, user_email, rating, title, comment, is_verified_purchase, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [reviewId, productId, userId, userName, userEmail, rating, title || '', comment, isVerifiedPurchase ? 1 : 0]
    );

    // Upload de imagens se houver
    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      for (const image of images) {
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: 'greenrush/reviews',
          resource_type: 'image'
        });

        await db.execute(
          'INSERT INTO review_images (review_id, image_url, cloudinary_public_id) VALUES (?, ?, ?)',
          [reviewId, result.secure_url, result.public_id]
        );
      }
    }

    // Upload de vídeo se houver
    if (req.files && req.files.video) {
      const result = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
        folder: 'greenrush/reviews',
        resource_type: 'video'
      });

      await db.execute(
        'INSERT INTO review_videos (review_id, video_url, cloudinary_public_id) VALUES (?, ?, ?)',
        [reviewId, result.secure_url, result.public_id]
      );
    }

    console.log(`⭐ Nova avaliação recebida: ${userName} - ${rating} estrelas`);

    res.status(201).json({
      message: 'Avaliação criada com sucesso!',
      reviewId
    });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({
      error: 'Erro ao criar avaliação'
    });
  }
});

// Buscar avaliações de um produto
app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { status = 'approved' } = req.query;

    const [reviews] = await db.execute(
      `SELECT r.*,
        GROUP_CONCAT(DISTINCT ri.image_url) as images,
        MAX(rv.video_url) as video_url
       FROM reviews r
       LEFT JOIN review_images ri ON r.id = ri.review_id
       LEFT JOIN review_videos rv ON r.id = rv.review_id
       WHERE r.product_id = ? AND r.status = ?
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [productId, status]
    );

    // Processar imagens (separar string em array)
    const processedReviews = reviews.map(review => ({
      ...review,
      images: review.images ? review.images.split(',') : [],
      videoUrl: review.video_url || null
    }));

    res.json(processedReviews);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
});

// Buscar estatísticas de avaliações de um produto
app.get('/api/reviews/product/:productId/stats', async (req, res) => {
  try {
    const { productId } = req.params;
    const [rows] = await db.execute('SELECT * FROM reviews WHERE product_id = ?', [productId]);

    const total = rows.length;
    const average_rating = total > 0
      ? rows.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;

    const five_stars = rows.filter(r => r.rating === 5).length;
    const four_stars = rows.filter(r => r.rating === 4).length;
    const three_stars = rows.filter(r => r.rating === 3).length;
    const two_stars = rows.filter(r => r.rating === 2).length;
    const one_star = rows.filter(r => r.rating === 1).length;

    res.json({
      total,
      average_rating: parseFloat(average_rating.toFixed(1)),
      five_stars,
      four_stars,
      three_stars,
      two_stars,
      one_star,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// [ADMIN] Buscar todas as avaliações
app.get('/api/admin/reviews', async (req, res) => {
  try {
    const { status } = req.query;

    let query = "SELECT * FROM reviews";
    let params = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC";

    const [allReviews] = await db.execute(query, params);

    res.json(allReviews);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// [ADMIN] Atualizar status da avaliação
app.patch('/api/admin/reviews/:reviewId/status', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        error: 'Status inválido',
      });
    }

    const [rows] = await db.execute("SELECT * FROM reviews WHERE id = ?", [reviewId]);
    const review = rows[0];

    if (!review) {
      return res.status(404).json({
        error: 'Avaliação não encontrada',
      });
    }

    await db.execute("UPDATE reviews SET status = ?, updated_at = NOW() WHERE id = ?", [status, reviewId]);

    console.log(`📝 Avaliação ${reviewId} atualizada para: ${status}`);

    res.json({
      message: 'Status atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// [ADMIN] Deletar avaliação
app.delete('/api/admin/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    const [result] = await db.execute("DELETE FROM reviews WHERE id = ?", [reviewId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Avaliação não encontrada',
      });
    }

    console.log(`🗑️ Avaliação ${reviewId} deletada`);

    res.json({
      message: 'Avaliação deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar avaliação:', error);
    res.status(500).json({
      error: { message: error.message },
    });
  }
});

// ==================== PRODUCTS API ====================

// Listar todos os produtos
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await db.execute('SELECT * FROM products WHERE is_active = TRUE ORDER BY created_at DESC');

    const productsFormatted = products.map(p => {
      let images = [];
      let tags = [];

      try {
        images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
        if (!Array.isArray(images)) images = [];
      } catch (e) {
        images = [];
      }

      try {
        tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags || [];
      } catch (e) {
        tags = [];
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.short_description,
        price: parseFloat(p.price),
        originalPrice: p.original_price ? parseFloat(p.original_price) : null,
        category: p.category,
        badge: p.badge || null,
        stock: p.stock,
        image: images[0] || '',
        images,
        tags,
        isFeatured: Boolean(p.is_featured),
        rating: parseFloat(p.rating),
        reviewsCount: p.reviews_count,
        createdAt: p.created_at,
        customLandingPage: p.custom_landing_page ||null
      };
    });

    res.json(productsFormatted);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Buscar produto por slug
app.get('/api/products/:slug', async (req, res) => {
  try {
    const [products] = await db.execute('SELECT * FROM products WHERE slug = ? AND is_active = TRUE', [req.params.slug]);

    if (products.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const p = products[0];

    let images = [];
    let tags = [];

    try {
      images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [];
    } catch (e) {
      images = [];
    }

    try {
      tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags || [];
    } catch (e) {
      tags = [];
    }

    const product = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.short_description,
      price: parseFloat(p.price),
      originalPrice: p.original_price ? parseFloat(p.original_price) : null,
      category: p.category,
      badge: p.badge || null,
      stock: p.stock,
      image: images[0] || '',
      images,
      tags,
      isFeatured: Boolean(p.is_featured),
      rating: parseFloat(p.rating),
      reviewsCount: p.reviews_count,
      createdAt: p.created_at,
      customLandingPage: p.custom_landing_page || null
    };

    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Criar produto
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, shortDescription, price, originalPrice, category, badge, stock, images, tags, isFeatured } = req.body;

    const productId = Date.now().toString();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await db.execute(
      'INSERT INTO products (id, name, slug, description, short_description, price, original_price, category, badge, stock, images, tags, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        productId,
        name,
        slug,
        description || '',
        shortDescription || '',
        price,
        originalPrice || null,
        category || 'emagrecimento',
        badge || null,
        stock || 0,
        JSON.stringify(images || []),
        JSON.stringify(tags || []),
        isFeatured || false
      ]
    );

    console.log(`📦 Novo produto criado: ${name}`);

    res.json({ id: productId, slug, message: 'Produto criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Atualizar produto
app.put('/api/products/:id', async (req, res) => {
  try {
    // Buscar produto atual
    const [current] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);

    if (!current || current.length === 0) {
      return res.status(404).json({ error: { message: 'Produto não encontrado' } });
    }

    const currentProduct = current[0];

    // Mesclar dados atuais com novos dados
    const name = req.body.name !== undefined ? req.body.name : currentProduct.name;
    const description = req.body.description !== undefined ? req.body.description : currentProduct.description;
    const shortDescription = req.body.shortDescription !== undefined ? req.body.shortDescription : currentProduct.short_description;
    const price = req.body.price !== undefined ? req.body.price : currentProduct.price;
    const originalPrice = req.body.originalPrice !== undefined ? req.body.originalPrice : currentProduct.original_price;
    const category = req.body.category !== undefined ? req.body.category : currentProduct.category;
    const badge = req.body.badge !== undefined ? req.body.badge : currentProduct.badge;
    const stock = req.body.stock !== undefined ? req.body.stock : currentProduct.stock;
    const images = req.body.images !== undefined ? req.body.images : (typeof currentProduct.images === 'string' ? JSON.parse(currentProduct.images) : currentProduct.images);
    const tags = req.body.tags !== undefined ? req.body.tags : (typeof currentProduct.tags === 'string' ? JSON.parse(currentProduct.tags) : currentProduct.tags);
    const isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : currentProduct.is_featured;
    const isActive = req.body.hidden !== undefined ? !req.body.hidden : currentProduct.is_active;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await db.execute(
      'UPDATE products SET name = ?, slug = ?, description = ?, short_description = ?, price = ?, original_price = ?, category = ?, badge = ?, stock = ?, images = ?, tags = ?, is_featured = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
      [
        name,
        slug,
        description,
        shortDescription,
        price,
        originalPrice,
        category,
        badge,
        stock,
        JSON.stringify(images),
        JSON.stringify(tags),
        isFeatured ? 1 : 0,
        isActive ? 1 : 0,
        req.params.id
      ]
    );

    console.log(`📦 Produto atualizado: ${name}`);

    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Deletar produto
app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.execute('UPDATE products SET is_active = FALSE WHERE id = ?', [req.params.id]);

    console.log(`🗑️ Produto deletado: ${req.params.id}`);

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// ==================== CATEGORIES API ====================

// Listar categorias
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT * FROM categories WHERE is_active = TRUE');
    res.json(categories);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// ==================== BANNERS API ====================

app.get('/api/banners', async (req, res) => {
  try {
    const [banners] = await db.execute('SELECT * FROM banners WHERE is_active = TRUE ORDER BY position');
    res.json(banners);
  } catch (error) {
    console.error('Erro ao listar banners:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin endpoint - retorna TODOS os banners
app.get('/api/admin/banners', async (req, res) => {
  try {
    const [banners] = await db.execute('SELECT * FROM banners ORDER BY position');
    res.json(banners);
  } catch (error) {
    console.error('Erro ao listar banners:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.post('/api/banners', async (req, res) => {
  try {
    const { title, subtitle, image, mobileImage, link, buttonText, position } = req.body;
    const id = Date.now().toString();

    await db.execute(
      'INSERT INTO banners (id, title, subtitle, image, mobile_image, link, button_text, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title || '', subtitle || '', image || '', mobileImage || '', link || '', buttonText || '', position || 0]
    );

    res.json({ id, message: 'Banner criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar banner:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.put('/api/banners/:id', async (req, res) => {
  try {
    const { title, subtitle, image, mobileImage, link, buttonText, position, isActive } = req.body;

    await db.execute(
      'UPDATE banners SET title = ?, subtitle = ?, image = ?, mobile_image = ?, link = ?, button_text = ?, position = ?, is_active = ? WHERE id = ?',
      [title || '', subtitle || '', image || '', mobileImage || '', link || '', buttonText || '', position || 0, isActive !== undefined ? (isActive ? 1 : 0) : 1, req.params.id]
    );

    res.json({ message: 'Banner atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar banner:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.delete('/api/banners/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ message: 'Banner deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar banner:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// ==================== BEFORE/AFTER API ====================

app.get('/api/before-after', async (req, res) => {
  try {
    const [items] = await db.execute('SELECT * FROM before_after WHERE is_active = TRUE ORDER BY position');
    res.json(items);
  } catch (error) {
    console.error('Erro ao listar antes/depois:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.post('/api/before-after', async (req, res) => {
  try {
    const { name, beforeImage, afterImage, description, weightLost, timePeriod, position } = req.body;
    const id = Date.now().toString();

    await db.execute(
      'INSERT INTO before_after (id, name, before_image, after_image, description, weight_lost, time_period, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, beforeImage, afterImage, description || '', weightLost || '', timePeriod || '', position || 0]
    );

    res.json({ id, message: 'Antes/Depois criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar antes/depois:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.put('/api/before-after/:id', async (req, res) => {
  try {
    const { name, beforeImage, afterImage, description, weightLost, timePeriod, position } = req.body;

    await db.execute(
      'UPDATE before_after SET name = ?, before_image = ?, after_image = ?, description = ?, weight_lost = ?, time_period = ?, position = ? WHERE id = ?',
      [name, beforeImage, afterImage, description || '', weightLost || '', timePeriod || '', position || 0, req.params.id]
    );

    res.json({ message: 'Antes/Depois atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar antes/depois:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.delete('/api/before-after/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM before_after WHERE id = ?', [req.params.id]);
    res.json({ message: 'Antes/Depois deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar antes/depois:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// ==================== VIDEO TESTIMONIALS API ====================

app.get('/api/video-testimonials', async (req, res) => {
  try {
    const [videos] = await db.execute('SELECT * FROM video_testimonials WHERE is_active = TRUE ORDER BY product, position');
    res.json(videos);
  } catch (error) {
    console.error('Erro ao listar vídeos:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.get('/api/video-testimonials/:product', async (req, res) => {
  try {
    const [videos] = await db.execute('SELECT * FROM video_testimonials WHERE product = ? AND is_active = TRUE ORDER BY position', [req.params.product]);
    res.json(videos);
  } catch (error) {
    console.error('Erro ao listar vídeos:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.post('/api/video-testimonials', async (req, res) => {
  try {
    const { product, videoUrl, thumbnail, customerName, position } = req.body;
    const id = Date.now().toString();

    await db.execute(
      'INSERT INTO video_testimonials (id, product, video_url, thumbnail, customer_name, position) VALUES (?, ?, ?, ?, ?, ?)',
      [id, product, videoUrl, thumbnail || '', customerName || '', position || 0]
    );

    res.json({ id, message: 'Vídeo criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar vídeo:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.delete('/api/video-testimonials/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM video_testimonials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Vídeo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar vídeo:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// ==================== CAROUSEL IMAGES API ====================

app.get('/api/carousel-images', async (req, res) => {
  try {
    const [images] = await db.execute('SELECT * FROM carousel_images WHERE is_active = TRUE ORDER BY product, position');
    res.json(images);
  } catch (error) {
    console.error('Erro ao listar imagens do carrossel:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.get('/api/carousel-images/:product', async (req, res) => {
  try {
    const [images] = await db.execute('SELECT * FROM carousel_images WHERE product = ? AND is_active = TRUE ORDER BY position', [req.params.product]);
    res.json(images);
  } catch (error) {
    console.error('Erro ao listar imagens:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.post('/api/carousel-images', async (req, res) => {
  try {
    const { product, imageUrl, position } = req.body;
    const id = Date.now().toString();

    await db.execute(
      'INSERT INTO carousel_images (id, product, image_url, position) VALUES (?, ?, ?, ?)',
      [id, product, imageUrl, position || 0]
    );

    res.json({ id, message: 'Imagem criada com sucesso' });
  } catch (error) {
    console.error('Erro ao criar imagem:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.delete('/api/carousel-images/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM carousel_images WHERE id = ?', [req.params.id]);
    res.json({ message: 'Imagem deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// ==================== SETTINGS API ====================

app.get('/api/settings/:key', async (req, res) => {
  try {
    const [settings] = await db.execute('SELECT setting_value FROM settings WHERE setting_key = ?', [req.params.key]);

    if (settings.length === 0) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    res.json(settings[0].setting_value);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.put('/api/settings/:key', async (req, res) => {
  try {
    const { value } = req.body;

    await db.execute(
      'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [req.params.key, JSON.stringify(value), JSON.stringify(value)]
    );

    res.json({ message: 'Configuração atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
  console.log(`📡 Proxy do Bling configurado!`);
  console.log(`💰 API Appmax configurada!`);
  console.log(`📊 Dashboard API disponível!`);
  console.log(`⭐ API de Avaliações ativa!`);
  console.log(`📦 API de Produtos ativa!`);
  console.log(`🎨 API de Banners ativa!`);
  console.log(`📸 API de Antes/Depois ativa!`);
  console.log(`🎥 API de Vídeos ativa!`);
  console.log(`🖼️  API de Carrossel ativa!`);
  console.log(`⚙️  API de Configurações ativa!`);
});
