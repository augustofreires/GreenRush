# Green Rush — Contexto do Projeto

E-commerce de suplementos. Site em produção: https://greenrushoficial.com.br

## Arquitetura

- **Frontend**: React 18 + Vite + TypeScript, em `src/`
- **Backend**: Node + Express monólito em `server.js` (~136KB)
- **Banco**: MySQL na VPS
- **Gateway de pagamento**: Appmax (PIX e cartão)
- **Process manager**: PM2 (processo `site-big-api` na porta 3001)
- **Servidor web**: Nginx fazendo proxy reverso

## Estrutura de pastas relevantes

- `src/pages/` — páginas (Home, Checkout, Admin, Legal, Landing pages)
- `src/components/` — componentes reutilizáveis
- `src/store/` — stores Zustand (useOrderStore, useProductStore)
- `src/pages/Admin/` — área administrativa
- `email-templates/` — templates HTML de e-mail
- `uploads/` — banners e imagens enviados pelo admin (NÃO versionado)
- `server.js` — backend completo, monolítico

## Ambiente local

O desenvolvedor NÃO roda este projeto localmente. Edita os arquivos
no editor (Antigravity) e faz deploy via Git push + SSH na VPS.

- **Não** sugira `npm run dev`, `vite dev` ou rodar o backend local
- **Não** crie scripts pra subir banco MySQL local
- **Não** assuma que existe `.env` na máquina local

## Fluxo de deploy

```bash
# 1. Editar localmente
# 2. Commit + push
git add .
git commit -m "..."
git push origin main

# 3. Deploy na VPS (1 comando)
ssh root@147.93.176.132 "/root/deploy-greenrush.sh"
```

O script de deploy faz: git pull → npm install → vite build → pm2 restart.
Se qualquer etapa falhar, o script aborta (set -e) e PM2 não reinicia.

## VPS

- Host: 147.93.176.132
- Caminho do projeto: /var/www/site-big
- Backups: /root/backups/
- Logs PM2: `pm2 logs site-big-api`

## Convenções de commit

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `chore:` configuração, refatoração leve, atualizações de manutenção
- `docs:` documentação
- Mensagens em português

## Histórico recente relevante

- Bug do PIX intermitente corrigido em 27/04/2026 (commits 0b1cfc1 → 4f02160)
- Validação de CPF com dígito verificador adicionada
- Página de confirmação corrigida pra buscar pedido por appmax_order_id
- AdminEmailCampaign adicionada ao admin

## Pendências conhecidas

- Bug da Landing Page Customizada: ao salvar produto com landing
  vinculada, o valor não persiste e a landing mostra "Produto não
  encontrado"
- /admin não exibe pedidos no Green Rush (existe no Big Hair,
  não foi portado de volta)

## Importante

- **NÃO commitar `.env`** — está no .gitignore
- **NÃO commitar pasta `uploads/`** — está no .gitignore, sincroniza via rsync
- **Sempre fazer backup tar.gz antes de operações destrutivas no banco**
