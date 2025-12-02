# 🧠 **Weedu – Business Rules (Memory Bank)**

**Versão:** 1.0
**Propósito:** instruir a IA do Cursor sobre TODAS as regras de negócio que o backend deve respeitar.
**Foco:** domínio puro, sem arquitetura, sem detalhes técnicos, sem controllers.

---

# **1. Princípio Central**

- O **plano pertence ao Admin**.
- Todas as empresas criadas por esse Admin compartilham os **mesmos limites globais** do plano da subscription ativa.

---

# **2. Regras de Papéis**

- Papéis possíveis: **master, admin, manager, executor, consultant**.
- Um usuário pode ter vários papéis no sistema, porém **apenas um papel por empresa**.
  (`companyId + userId` é único.)
- **Consultores não participam de equipes.**
- Apenas **Admin** cria empresas.
- Apenas **Master** cria/edita planos.

---

# **3. Regras de Plano (Plan)**

Um plano define limites globais por Admin:

- `maxCompanies`
- `maxManagers`
- `maxExecutors`
- `maxConsultants`
- `iaCallsLimit`

**Todos os limites são agregados entre todas as empresas do admin.**

---

# **4. Regras de Subscription**

- Um Admin pode possuir várias subscriptions históricas, mas **somente uma ativa**.
- Todas as validações (empresas, papéis, IA) usam **exclusivamente a subscription ativa**.
- Sem subscription ativa → Admin não pode:
  - criar empresa
  - adicionar membros
  - usar IA

---

# **5. Regras de Empresa (Company)**

- Empresa pertence a um único Admin.
- Criar empresa só é permitido se:

  ```
  totalEmpresasDoAdmin < plan.maxCompanies
  ```

- Deletar empresa deve deletar:
  - CompanyUsers
  - Teams
  - TeamUsers

---

# **6. Regras de Membros da Empresa (CompanyUser)**

## 6.1 Papel único por empresa

- `(companyId, userId)` **é único**.

## 6.2 Limites globais por role (somando todas as empresas do admin)

Ao adicionar um membro:

```
TotalManagers     <= plan.maxManagers
TotalExecutors    <= plan.maxExecutors
TotalConsultants  <= plan.maxConsultants
```

## 6.3 Permissões por papel

- Manager → cria equipe | NÃO entra em equipe | vê dashboards | cria tarefas
- Executor → NÃO cria equipe | entra em equipe | vê dashboards | cria tarefas próprias
- Consultant → NÃO cria equipe | NÃO entra em equipe | vê dashboards | NÃO cria tarefas

---

# **7. Regras de Equipe (Team)**

- Cada equipe possui **um único gestor (managerId)**.
- O gestor deve existir como `CompanyUser(role = manager)`.
- `iaContext` pode existir e influencia geração de tarefas IA.

---

# **8. Regras de Membros da Equipe (TeamUser)**

- Somente executores podem entrar em equipes.
- Executor deve existir como `CompanyUser(role = executor)`.
- `(teamId, userId)` é **único** (sem duplicação).
- Executor pode estar em várias equipes.

---

# **9. Regras de IA (IAUsage)**

Fluxo obrigatório antes de processar uma chamada IA:

```
1. Obter subscription ativa do admin.
2. Somar todos os IAUsage.tokensUsed dessa subscription.
3. Validar: totalAtual + tokensDaRequisição <= plan.iaCallsLimit.
4. Se válido → permitir chamada.
5. Registrar IAUsage.
```

- Sem subscription ativa → IA proibida.

---

# **10. Fluxos Críticos**

## 10.1 Onboarding

```
1. Admin cria conta.
2. Recebe subscription ativa com plano default.
3. Admin cria empresas (valida maxCompanies).
4. Admin adiciona membros (valida limites globais).
5. Manager cria equipes (valida role do gestor).
6. Manager adiciona executores às equipes (valida role executor).
```

## 10.2 Fluxo IA

```
1. Usuário solicita tarefa IA.
2. Sistema identifica admin dono da empresa.
3. Obtém subscription ativa.
4. Valida limites de tokens.
5. Chama provedor IA.
6. Registra IAUsage.
```

---

# **11. Constraints Obrigatórias**

- `User.email`, `User.phone`, `User.document` → únicos.
- `CompanyUser(companyId, userId)` → único.
- `TeamUser(teamId, userId)` → único.

### Cascade

- Deletar empresa → remove membros, equipes e membros das equipes.
- Deletar equipe → remove TeamUsers.

### Restrict

- Admin não pode ser removido se tiver subscription ativa.
- Plano não pode ser removido se houver subscription referenciando-o.
- Gestor não pode ser removido se gerenciar equipe ativa.
