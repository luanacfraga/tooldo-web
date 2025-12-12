# Guia de Deploy - AWS + GoDaddy

Este guia explica como publicar o frontend Weedu no seu domínio usando AWS Amplify e configurar o DNS na GoDaddy.

## Opções de Deploy na AWS

### Opção 1: AWS Amplify (Recomendado) ⭐

**Vantagens:**

- Deploy automático via Git
- SSL/HTTPS automático
- CDN global integrado
- Build otimizado para Next.js
- Preview de branches
- Mais simples de configurar

**Custo:** ~$0.023/GB de transferência (primeiros 15GB grátis/mês)

### Opção 2: EC2 + Nginx

**Vantagens:**

- Controle total do servidor
- Mais barato para tráfego alto

**Desvantagens:**

- Requer gerenciamento de servidor
- SSL manual
- Mais complexo

---

## Deploy com AWS Amplify (Recomendado)

### Pré-requisitos

1. Conta AWS ativa
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Domínio na GoDaddy

### Passo 1: Preparar o Projeto

O projeto já está configurado com:

- ✅ `amplify.yml` - Configuração de build
- ✅ `next.config.js` - Configuração Next.js

### Passo 2: Criar App no AWS Amplify

1. Acesse [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Clique em **"New app"** → **"Host web app"**
3. Conecte seu repositório Git:
   - Escolha seu provedor (GitHub, GitLab, Bitbucket)
   - Autorize o acesso
   - Selecione o repositório `weedu-web`
   - Selecione a branch `main` (ou a branch de produção)
4. Configure o build:
   - **Build settings**: O Amplify detectará automaticamente o `amplify.yml`
   - Se não detectar, selecione "Next.js - SSR"
5. Configure variáveis de ambiente:
   - Clique em **"Environment variables"**
   - Adicione:
     ```
     NEXT_PUBLIC_API_URL=https://sua-api.com
     NODE_ENV=production
     ```
6. Clique em **"Save and deploy"**

### Passo 3: Configurar Domínio Customizado

1. No Amplify Console, vá em **"App settings"** → **"Domain management"**
2. Clique em **"Add domain"**
3. Digite seu domínio (ex: `weedu.com` ou `www.weedu.com`)
4. O Amplify irá gerar um certificado SSL automaticamente (pode levar alguns minutos)

### Passo 4: Configurar DNS na GoDaddy

1. Acesse o [GoDaddy Domain Manager](https://dcc.godaddy.com/)
2. Selecione seu domínio
3. Vá em **"DNS"** ou **"Manage DNS"**
4. Você verá os registros DNS que o Amplify forneceu (na tela de Domain management)

#### Para domínio principal (weedu.com):

Adicione/edite os registros:

**Tipo A (para domínio raiz):**

- **Nome/Host:** `@` ou deixe em branco
- **Valor:** [IP fornecido pelo Amplify] (geralmente não necessário, use CNAME)
- **TTL:** 600

**Tipo CNAME (recomendado):**

- **Nome/Host:** `@` ou deixe em branco
- **Valor:** `[seu-app-id].amplifyapp.com` (fornecido pelo Amplify)
- **TTL:** 600

**Tipo CNAME (para www):**

- **Nome/Host:** `www`
- **Valor:** `[seu-app-id].amplifyapp.com`
- **TTL:** 600

**Nota:** Alguns provedores DNS não permitem CNAME no domínio raiz (@). Nesse caso:

- Use o registro **ALIAS** ou **ANAME** (se disponível)
- Ou use o **Tipo A** com o IP fornecido pelo Amplify

### Passo 5: Verificar Configuração

1. Aguarde a propagação DNS (pode levar de 5 minutos a 48 horas, geralmente 1-2 horas)
2. Verifique o status no Amplify Console
3. Teste acessando seu domínio no navegador

### Passo 6: Configurar Redirecionamentos (Opcional)

No Amplify Console → Domain management:

- Configure redirecionamento de `www` para domínio raiz (ou vice-versa)
- Configure redirecionamento HTTP → HTTPS

---

## Configuração de Variáveis de Ambiente

### Variáveis Obrigatórias

No Amplify Console → App settings → Environment variables:

```env
NEXT_PUBLIC_API_URL=https://api.weedu.com
NODE_ENV=production
```

### Variáveis Opcionais

```env
NEXT_PUBLIC_APP_NAME=Weedu
NEXT_PUBLIC_APP_DESCRIPTION=Plataforma de gestão
```

**Importante:** Variáveis que começam com `NEXT_PUBLIC_` são expostas ao cliente. Não coloque secrets aqui!

---

## Deploy Manual (Alternativa)

Se preferir fazer deploy manual:

### Build Local

```bash
npm run build
```

Isso gera a pasta `.next` com os arquivos otimizados.

### Upload para S3 + CloudFront

1. Crie um bucket S3
2. Configure CloudFront para distribuir o conteúdo
3. Configure SSL no CloudFront
4. Faça upload dos arquivos

**Nota:** Next.js com SSR requer servidor Node.js, então S3 puro não funciona. Use Amplify ou EC2.

---

## Deploy com EC2 (Alternativa Avançada)

Se preferir usar EC2:

### 1. Criar Instância EC2

- Tipo: t3.small ou maior
- AMI: Ubuntu 22.04 LTS
- Security Group: Abra portas 80, 443, 22

### 2. Instalar Node.js e PM2

```bash
# Conectar via SSH
ssh -i sua-chave.pem ubuntu@seu-ip

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2
```

### 3. Instalar Nginx

```bash
sudo apt update
sudo apt install nginx

# Configurar Nginx
sudo nano /etc/nginx/sites-available/weedu
```

Configuração Nginx:

```nginx
server {
    listen 80;
    server_name weedu.com www.weedu.com;

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

### 4. Configurar SSL com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d weedu.com -d www.weedu.com
```

### 5. Deploy da Aplicação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/weedu-web.git
cd weedu-web

# Instalar dependências
npm install

# Build
npm run build

# Iniciar com PM2
pm2 start npm --name "weedu-web" -- start
pm2 save
pm2 startup
```

### 6. Configurar DNS na GoDaddy

- **Tipo A:** Apontar para o IP público da instância EC2
- **Tipo CNAME:** `www` → `weedu.com`

---

## Monitoramento e Logs

### AWS Amplify

- Logs de build: Amplify Console → App → Build history
- Logs de runtime: CloudWatch Logs

### EC2

```bash
# Ver logs da aplicação
pm2 logs weedu-web

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Domínio não carrega

1. Verifique se o DNS está propagado: [whatsmydns.net](https://www.whatsmydns.net/)
2. Verifique se o certificado SSL foi emitido (Amplify Console)
3. Aguarde até 48 horas para propagação completa

### Erro 502 Bad Gateway

- Verifique se a aplicação está rodando
- Verifique logs no CloudWatch (Amplify) ou PM2 (EC2)
- Verifique variáveis de ambiente

### Build falha

- Verifique logs de build no Amplify Console
- Verifique se todas as dependências estão no `package.json`
- Verifique se `NEXT_PUBLIC_API_URL` está configurado

### API não conecta

- Verifique se `NEXT_PUBLIC_API_URL` está correto
- Verifique CORS no backend
- Verifique se a API está acessível publicamente

---

## Custos Estimados

### AWS Amplify

- Primeiros 15GB de transferência: **Grátis**
- Depois: ~$0.023/GB
- Builds: Grátis (até 1000 minutos/mês)

### EC2

- t3.small: ~$15/mês
- Transferência: Primeiros 100GB grátis

---

## Próximos Passos

1. ✅ Configurar CI/CD automático (já configurado com Amplify)
2. ✅ Configurar monitoramento (CloudWatch)
3. ✅ Configurar alertas de erro
4. ✅ Otimizar performance (já otimizado pelo Next.js)
5. ✅ Configurar backup (se usar EC2)

---

## Suporte

- [Documentação AWS Amplify](https://docs.aws.amazon.com/amplify/)
- [Documentação Next.js Deploy](https://nextjs.org/docs/deployment)
- [GoDaddy DNS Help](https://www.godaddy.com/help)
