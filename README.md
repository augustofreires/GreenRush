# BigHair E-commerce

E-commerce completo desenvolvido em React com integrações ERP e AppMax.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Navegação entre páginas
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **React Icons** - Biblioteca de ícones

## 📋 Funcionalidades

### Frontend (Loja)
- ✅ Página inicial com produtos em destaque
- ✅ Catálogo de produtos com filtros por categoria
- ✅ Carrinho de compras com persistência (LocalStorage)
- ✅ Checkout completo com cálculo de frete
- ✅ Busca de produtos
- ✅ Design responsivo (mobile-first)
- ✅ Header com navegação e indicador de carrinho
- ✅ Footer com links e redes sociais

### Painel Administrativo
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de produtos (CRUD)
- ✅ Gerenciamento de pedidos
- ✅ Gerenciamento de clientes
- ✅ Página de integrações (ERP e AppMax)

### Integrações
- ✅ **ERP**: Sincronização de produtos e pedidos
- ✅ **AppMax**: Tracking de conversões e afiliados

## 🛠️ Instalação

### Pré-requisitos
- Node.js 20.11+ (recomendado 20.19+)
- npm 10+

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd "Site Big"
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ERP_API_URL=sua-url-erp
VITE_ERP_API_KEY=sua-chave-erp
VITE_APPMAX_API_KEY=sua-chave-appmax
VITE_APPMAX_API_SECRET=seu-secret-appmax
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

O site estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header/         # Componente de cabeçalho
│   ├── Footer/         # Componente de rodapé
│   ├── Product/        # Componentes de produto
│   ├── Cart/           # Componentes do carrinho
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── Home/           # Página inicial
│   ├── Cart/           # Página do carrinho
│   ├── Checkout/       # Página de checkout
│   └── Admin/          # Páginas administrativas
├── services/           # Serviços de API
│   ├── api.ts          # Configuração do Axios
│   ├── productService.ts
│   ├── orderService.ts
│   ├── erpService.ts
│   └── appmaxService.ts
├── store/              # Gerenciamento de estado (Zustand)
│   ├── useCartStore.ts
│   └── useAuthStore.ts
├── types/              # Tipos TypeScript
│   └── index.ts
├── App.tsx             # Componente principal
└── main.tsx            # Entry point
```

## 🎨 Design

O design é baseado no layout moderno com as seguintes cores:
- **Rosa Primary**: `#FC419A`
- **Azul Primary**: `#446084`
- **Verde Accent**: `#BAF67C`

## 🔌 Integrações

### ERP
Configure no painel admin em `/admin/integracoes`:
1. URL da API do ERP
2. API Key
3. Ative a sincronização automática de produtos e pedidos
4. Defina o intervalo de sincronização

### AppMax
Configure no painel admin em `/admin/integracoes`:
1. API Key do AppMax
2. API Secret
3. Pixel de conversão (opcional)
4. Ative o tracking de conversões

## 🚢 Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa linter

## 🔐 Acesso Administrativo

Para acessar o painel administrativo:
1. Navegue para `/admin`
2. O sistema verificará se o usuário está autenticado e tem role de `admin`

**Nota**: Por padrão, a autenticação está mockada. Você precisará implementar um sistema de autenticação real com backend.

## 🌐 Backend (API)

Este projeto é apenas o frontend. Você precisará criar uma API backend que implemente os seguintes endpoints:

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Criar pedido
- `PUT /api/orders/:id/status` - Atualizar status

### ERP
- `GET /api/erp/config` - Obter configuração
- `PUT /api/erp/config` - Salvar configuração
- `POST /api/erp/sync/products` - Sincronizar produtos
- `POST /api/erp/sync/orders` - Sincronizar pedidos

### AppMax
- `GET /api/appmax/config` - Obter configuração
- `PUT /api/appmax/config` - Salvar configuração
- `POST /api/appmax/track/conversion` - Tracking de conversão

## 📦 Próximos Passos

Para completar o projeto, você precisará:

1. **Backend API**: Criar API REST com Node.js/Express ou outra tecnologia
2. **Banco de Dados**: Configurar PostgreSQL/MySQL/MongoDB
3. **Autenticação**: Implementar JWT ou OAuth
4. **Pagamento**: Integrar gateway (Stripe, PagSeguro, Mercado Pago)
5. **Imagens**: Configurar storage (AWS S3, Cloudinary)
6. **Deploy**: Hospedar frontend (Vercel, Netlify) e backend (Heroku, AWS)

## 📄 Licença

Este projeto foi criado para fins educacionais/comerciais.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

Desenvolvido com ❤️ usando React + TypeScript + Tailwind CSS
