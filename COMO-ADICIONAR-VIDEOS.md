# 📹 Como Adicionar Vídeos de Depoimentos

## Método 1: Vídeos no Seu Servidor (Recomendado)

### Passo a Passo:

1. **Coloque os vídeos na pasta correta**
   - Navegue até: `public/videos/`
   - Cole seus arquivos de vídeo lá
   - Exemplo: `public/videos/depoimento-maria.mp4`

2. **Acesse o painel admin**
   - URL: `http://seusite.com/admin/depoimentos`
   - Clique em "Novo Vídeo"

3. **Preencha o formulário**
   - Selecione: **"Arquivo Local"**
   - Nome do arquivo: `depoimento-maria.mp4`
   - Título: "Perdi 15kg em 3 meses!"
   - Creator: "@mariasilva"
   - Salve!

### ✅ Vantagens:
- Totalmente sob seu controle
- Sem custos externos
- Rápido e fácil
- Sem limite de uploads

### ⚠️ Requisitos:
- Vídeos precisam estar otimizados (até 50MB)
- Formatos: MP4, WebM
- Orientação vertical (9:16) recomendada

---

## Método 2: URL Externa (Cloudinary, AWS, etc.)

### Passo a Passo:

1. **Faça upload em um serviço externo**
   - Cloudinary: https://cloudinary.com (grátis até 25GB)
   - AWS S3
   - Bunny.net
   - Outros serviços de hosting

2. **Copie a URL direta do vídeo**
   - Exemplo: `https://res.cloudinary.com/seu-cloud/video/upload/depoimento.mp4`

3. **Acesse o painel admin**
   - URL: `http://seusite.com/admin/depoimentos`
   - Clique em "Novo Vídeo"

4. **Preencha o formulário**
   - Selecione: **"URL Externa"**
   - Cole a URL completa
   - Preencha título e creator
   - Salve!

### ✅ Vantagens:
- CDN global (mais rápido)
- Conversão automática de formatos
- Otimização automática
- Streaming adaptativo

---

## 🎬 Dicas para Otimizar Vídeos

### Antes de fazer upload:

1. **Comprima o vídeo**
   - Use: HandBrake (grátis)
   - Ou: https://www.freeconvert.com/video-compressor
   - Alvo: 10-30MB por vídeo

2. **Resolução recomendada**
   - Mobile: 720p (1280x720)
   - Desktop: 1080p (1920x1080)
   - FPS: 30fps

3. **Formato**
   - Melhor: MP4 (H.264)
   - Alternativo: WebM

### Ferramentas Gratuitas:
- **HandBrake**: Compressão de vídeo
- **FFmpeg**: Conversão de formato
- **Shotcut**: Editor de vídeo gratuito
- **DaVinci Resolve**: Editor profissional grátis

---

## 🔧 Comandos Úteis (FFmpeg)

Se você tem FFmpeg instalado:

### Comprimir vídeo mantendo qualidade:
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
```

### Converter para formato vertical (9:16):
```bash
ffmpeg -i input.mp4 -vf "scale=1080:1920" output.mp4
```

### Extrair thumbnail do vídeo:
```bash
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 thumbnail.jpg
```

---

## 📊 Checklist antes de publicar:

- [ ] Vídeo está otimizado (< 50MB)
- [ ] Formato correto (MP4 preferencialmente)
- [ ] Orientação vertical para mobile
- [ ] Qualidade de áudio boa
- [ ] Título descritivo preenchido
- [ ] Nome do creator correto
- [ ] Vídeo testado no admin preview

---

## ❓ Problemas Comuns:

### Vídeo não aparece:
- ✅ Verifique se o arquivo está em `public/videos/`
- ✅ Confira o nome do arquivo (sem espaços)
- ✅ Recarregue a página

### Vídeo não carrega:
- ✅ Verifique o tamanho (máx 100MB para teste)
- ✅ Teste a URL em uma aba separada
- ✅ Confira formato (MP4 é o mais compatível)

### Vídeo lento:
- ✅ Comprima o arquivo
- ✅ Use resolução menor (720p)
- ✅ Considere usar CDN externa

---

**Precisa de ajuda?** Entre em contato com o suporte técnico.
