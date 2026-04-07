# 🚀 Quick Start — NEXUS Development

**Para começar a desenvolver HOJE**

---

## 1️⃣ Leia os Documentos na Ordem

```
docs/PRD-NEXUS.md              ← Entenda o produto
docs/stories/README.md         ← Overview das stories
docs/stories/MANIFEST.md       ← Arquitetura e planejamento
docs/stories/1.1.story.md      ← Comece aqui!
```

---

## 2️⃣ Setup Inicial (15 min)

```bash
# Clone o repo
git clone <repo>
cd C:\Users\HomePC\Desktop\Marketing

# Verifique a estrutura
ls docs/stories/
# Deve ter: 1.1.story.md até 7.6.story.md (43 arquivos)

# Inicialize git (se novo)
git init
git add .
git commit -m "feat: initialize NEXUS project structure [Story 1.1]"
```

---

## 3️⃣ Escolha Seu Papel

### Se você é **@dev** (implementação)
→ Comece com **Story 1.1**
```bash
# Leia 1.1.story.md
# Setup Node.js + Express + React + SQLite
# Tempo: ~8h
```

### Se você é **@qa** (testes)
→ Aguarde Stories de dev + comece com **Story 7.1**
```bash
# Estude teste E2E com Playwright
# Prepare test account Instagram
```

### Se você é **@ux-design-expert**
→ Comece com **Story 4.2** (Approval UI)
```bash
# Design approval flow
# Wireframes para 6.1 (Dashboard)
```

### Se você é **@pm** (product)
→ Aguarde @po validar + rastreie **Story 7.6**
```bash
# Coordene timeline
# Manage blockers
```

---

## 4️⃣ Story Workflow

Para cada story:

```
1. Leia a story (docs/stories/X.Y.story.md)
   └ Entenda AC, escopo técnico, dependências

2. @po valida
   └ *validate-story-draft X.Y
   └ Deve passar 10-point checklist

3. @dev implementa
   └ *develop-story X.Y
   └ Update File List conforme cria arquivos
   └ Mark checkboxes [ ] → [x]

4. @qa testa
   └ *qa-gate X.Y
   └ 7 quality checks
   └ PASS/FAIL/WAIVED

5. Deploy
   └ @devops *push
   └ Próxima story pode começar
```

---

## 5️⃣ Dependências Críticas

**Não comece a story X se:**

```
1.2 → Precisa de 1.1 completo
1.3 → Precisa de 1.1 + 1.2
2.1 → Precisa de 1.1 + 1.2
3.1 → Precisa de 1.4 + 1.5
3.5 → Precisa de 3.4 completo
4.1 → Precisa de 3.10 completo
5.1 → Precisa de 1.3 completo
6.1 → Pode começar em paralelo (design)
```

---

## 6️⃣ Monitorar Progresso

### Daily
```bash
# Ver status de todas stories
cat docs/stories/INDEX.md

# Atualizar um status
# Edit: status: "Draft" → "In Progress" → "Review" → "Done"
```

### Weekly
```bash
# Reunião de alinhamento
# Revisar blockers
# Reajustar timeline se necessário
```

---

## 7️⃣ Exemplo: Implementar Story 1.1

```bash
# 1. Ler a story
cat docs/stories/1.1.story.md

# 2. Criar branch
git checkout -b feat/1.1-foundation

# 3. Implementar:
#    - Setup Node.js + Express
#    - Setup React + Vite
#    - SQLite schema
#    - Auth endpoints
#    - Testes

# 4. Atualizar File List em 1.1.story.md
# [ ] → [x] para cada arquivo criado

# 5. Commit
git add .
git commit -m "feat: project foundation and local auth [Story 1.1]"

# 6. Push (via @devops)
# @devops *push

# 7. PR review
# @qa *qa-gate 1.1

# 8. Se PASS, próxima story!
```

---

## 8️⃣ Ferramentas Necessárias

- **Node.js 18+** (já deve estar)
- **Python 3.9+** (para Instagrapi em 1.2)
- **Git** (version control)
- **GitHub CLI** (`gh auth status`)
- **VSCode** ou IDE de preferência
- **Playwright** (instalado via npm)
- **SQLite3** (instalado via npm)

---

## 9️⃣ Troubleshooting

### Story não tem dependências atendidas
→ Não comece! Verifique INDEX.md

### Bloqueado em algo técnico
→ Crie uma subtask ou escalpe para @architect

### Precisa de design antes
→ Coordene com @ux-design-expert (paralelo)

### Test account Instagram não funciona
→ Crie nova; documente; compartilhe credenciais seguras

---

## 🔟 Dúvidas Frequentes

**P: Posso pular para Epic 3?**  
R: Tecnicamente sim, mas Epic 1 é foundational.

**P: Quanto tempo leva tudo?**  
R: 8-9 semanas com equipe full-time.

**P: Posso fazer stories em paralelo?**  
R: Sim, se não há dependências. Veja dependências em MANIFEST.md.

**P: Como rastrear bugs encontrados?**  
R: Crie issue no GitHub com tag `story-X.Y`.

**P: Preciso seguir exatamente a estrutura?**  
R: Sim, para consistency. Edite stories se achar problemas.

---

## ✅ Checklist Antes de Começar

- [ ] Leu PRD-NEXUS.md
- [ ] Leu README.md (stories)
- [ ] Leu MANIFEST.md
- [ ] Sabe qual story começar (1.1 se @dev)
- [ ] Tem Node.js 18+ instalado
- [ ] Tem git configurado
- [ ] Tem GitHub CLI (`gh auth status`)
- [ ] Sabe como usar @sm *draft, @dev *develop-story, @qa *qa-gate

---

## 🎯 Próximo Passo

```bash
# @sm (River — Scrum Master)
*draft 1.1

# @po (Pax — Product Owner)  
*validate-story-draft 1.1

# @dev (Dex — Developer)
*develop-story 1.1
```

---

**Ready? Let's go! 🚀**
