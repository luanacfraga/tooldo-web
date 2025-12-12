# Deploy Rápido - Passo a Passo

## 🚀 Deploy com AWS Amplify (5 minutos)

### 1. Preparar Repositório

```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "Preparar para deploy"
git push origin main
```

### 2. Criar App no Amplify

1. Acesse: https://console.aws.amazon.com/amplify/
2. **New app** → **Host web app**
3. Conecte seu Git (GitHub/GitLab/Bitbucket)
4. Selecione repositório: `weedu-web`
5. Branch: `main`
6. **Next.js - SSR** será detectado automaticamente

### 3. Configurar Variáveis

Na tela de configuração, adicione:

```
NEXT_PUBLIC_API_URL=https://sua-api.com
NODE_ENV=production
```

### 4. Deploy

Clique em **"Save and deploy"** e aguarde (5-10 minutos)

### 5. Configurar Domínio

1. Amplify Console → **App settings** → **Domain management**
2. **Add domain** → Digite seu domínio
3. Aguarde certificado SSL (2-5 minutos)

### 6. Configurar DNS na GoDaddy

1. Acesse: https://dcc.godaddy.com/
2. Selecione seu domínio → **DNS**
3. Adicione/edite:

**Para domínio raiz (@):**

- Tipo: **CNAME** (ou ALIAS se disponível)
- Nome: `@` ou deixe em branco
- Valor: `[seu-app-id].amplifyapp.com` (copie do Amplify)
- TTL: 600

**Para www:**

- Tipo: **CNAME**
- Nome: `www`
- Valor: `[seu-app-id].amplifyapp.com`
- TTL: 600

### 7. Aguardar Propagação

- Tempo: 5 minutos a 2 horas (geralmente 30-60 min)
- Verifique: https://www.whatsmydns.net/

### 8. Testar

Acesse seu domínio no navegador! 🎉

---

## ⚠️ Checklist Antes do Deploy

- [ ] Variável `NEXT_PUBLIC_API_URL` configurada corretamente
- [ ] Backend está acessível publicamente
- [ ] CORS configurado no backend para seu domínio
- [ ] Testes locais passando (`npm run build` funciona)
- [ ] Código commitado e pushado

---

## 🔧 Problemas Comuns

### Build falha

- Verifique logs no Amplify Console
- Certifique-se que `npm run build` funciona localmente

### Domínio não carrega

- Aguarde propagação DNS (até 48h, geralmente 1-2h)
- Verifique DNS: https://www.whatsmydns.net/
- Verifique se certificado SSL foi emitido

### API não conecta

- Verifique `NEXT_PUBLIC_API_URL` no Amplify
- Verifique CORS no backend
- Verifique se API está acessível

---

## 📞 Precisa de Ajuda?

Consulte o guia completo: `DEPLOY.md`
