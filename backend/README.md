# GreenRush Backend API

Backend Node.js + MySQL + Cloudinary para sistema de avaliações do e-commerce GreenRush.

## 📋 Pré-requisitos

- Node.js 16+ instalado
- MySQL 8+ instalado e rodando
- Conta no Cloudinary (gratuita)

## 🚀 Instalação

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar MySQL

Execute o script SQL para criar o banco e tabelas:

```bash
mysql -u root -p < schema.sql
```

Ou copie e cole o conteúdo de `schema.sql` no MySQL Workbench/phpMyAdmin.

### 3. Configurar Cloudinary

1. Acesse: https://cloudinary.com/users/register/free
2. Crie uma conta gratuita
3. No Dashboard, copie:
   - Cloud Name
   - API Key
   - API Secret

### 4. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Server
PORT=3001

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=greenrush

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name_aqui
CLOUDINARY_API_KEY=sua_api_key_aqui
CLOUDINARY_API_SECRET=seu_api_secret_aqui

# CORS
FRONTEND_URL=http://localhost:5173
```

### 5. Iniciar servidor

**Modo desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

O servidor estará rodando em: `http://localhost:3001`

## 📡 Endpoints da API

### Públicos

#### Criar avaliação
```http
POST /api/reviews
Content-Type: multipart/form-data

Body:
- productId (string)
- userId (string)
- userName (string)
- userEmail (string)
- rating (number 1-5)
- title (string, opcional)
- comment (string)
- isVerifiedPurchase (boolean)
- images (files[], opcional, máx 3)
- video (file, opcional)
```

#### Listar avaliações de um produto
```http
GET /api/reviews/product/:productId
Query params:
- status (opcional): pending | approved | rejected
```

#### Estatísticas de avaliações
```http
GET /api/reviews/product/:productId/stats
```

### Admin

#### Listar todas avaliações
```http
GET /api/admin/reviews
Query params:
- status (opcional): pending | approved | rejected
```

#### Atualizar status da avaliação
```http
PATCH /api/admin/reviews/:id/status
Content-Type: application/json

Body:
{
  "status": "approved" | "pending" | "rejected"
}
```

#### Deletar avaliação
```http
DELETE /api/admin/reviews/:id
```

## 🗄️ Estrutura do Banco de Dados

### Tabela: reviews
- id (VARCHAR 36, PRIMARY KEY)
- product_id (VARCHAR 50)
- user_id (VARCHAR 50)
- user_name (VARCHAR 255)
- user_email (VARCHAR 255)
- rating (INT 1-5)
- title (VARCHAR 255)
- comment (TEXT)
- is_verified_purchase (BOOLEAN)
- status (ENUM: pending, approved, rejected)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Tabela: review_images
- id (INT AUTO_INCREMENT, PRIMARY KEY)
- review_id (FK -> reviews.id)
- image_url (VARCHAR 500)
- cloudinary_public_id (VARCHAR 255)
- created_at (TIMESTAMP)

### Tabela: review_videos
- id (INT AUTO_INCREMENT, PRIMARY KEY)
- review_id (FK -> reviews.id)
- video_url (VARCHAR 500)
- cloudinary_public_id (VARCHAR 255)
- created_at (TIMESTAMP)

## 📦 Deploy na VPS

### 1. Transferir arquivos para VPS

```bash
scp -r backend/ usuario@seu-servidor-ip:/var/www/greenrush/
```

### 2. Instalar Node.js na VPS

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Instalar MySQL na VPS

```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 4. Configurar PM2 (gerenciador de processos)

```bash
sudo npm install -g pm2
cd /var/www/greenrush/backend
npm install
pm2 start src/index.js --name greenrush-api
pm2 startup
pm2 save
```

### 5. Configurar Nginx como proxy reverso

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Segurança

⚠️ **IMPORTANTE para produção:**

1. Adicionar autenticação JWT nas rotas admin
2. Validar e sanitizar todos os inputs
3. Configurar rate limiting
4. Usar HTTPS
5. Configurar CORS corretamente
6. Nunca commitar o arquivo .env

## 📞 Suporte

Em caso de dúvidas ou problemas, verifique os logs:

```bash
pm2 logs greenrush-api
```
