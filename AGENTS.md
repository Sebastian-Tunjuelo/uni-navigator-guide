
# Project Context

- Name: Virtual University Concierge (Challenge 3 - University Orientation)
- Hackathon: EPAM 2026 (Apr 30, 2026)
- Goal: help first-semester students navigate campus and reduce anxiety
- Key features: interactive map, AI assistant chatbot, progressive onboarding, safe social space
- Design approach: Design Thinking; UI generated with Lovable
- Current direction: add backend later and evolve chatbot into RAG
- Task tracking: planned under docs/ (folder not created yet)
- Stack: Vite + React + TypeScript + Tailwind + shadcn/ui; Supabase client present
- Source: see README.md for detailed narrative and persona

---

## Installed Agent Skills

### RAG & Backend (Node.js)
1. **langchain-rag** (langchain-ai/langchain-skills@langchain-rag) - 5.7K installs
   - LangChain RAG implementation with Node.js
   - Retrieval-Augmented Generation for chatbot
   - Vector embeddings and semantic search

2. **supabase-postgres-best-practices** (supabase/agent-skills@supabase-postgres-best-practices) - 135.3K installs
   - PostgreSQL best practices for Supabase
   - Database design and query optimization
   - Integrates with Supabase backend

### Frontend & UI
3. **frontend-design** (anthropics/skills@frontend-design) - 357.5K installs
   - Comprehensive frontend design patterns
   - React component architecture
   - UI/UX best practices

4. **shadcn** (shadcn/ui@shadcn) - 118.8K installs
   - shadcn/ui component library
   - Accessible UI components
   - Tailwind CSS integration (already in stack)

### Automation & Agent Orchestration
5. **agent-browser** (vercel-labs/agent-browser@agent-browser) - 227.1K installs
   - Browser automation for agents
   - Web scraping and navigation
   - Automated testing

6. **workflow-orchestration-patterns** (wshobson/agents@workflow-orchestration-patterns) - 6.4K installs
   - Multi-agent orchestration patterns
   - Workflow coordination
   - Agent communication strategies

### Visualization & Campus Map (2D Graphs)
7. **d3-viz** (davila7/claude-code-templates@d3-viz) - 371 installs
   - D3.js visualization for graphs
   - Nodos y aristas (nodes & edges)
   - Perfect for interactive campus maps with overlay

8. **antv-g6-graph** (antvis/chart-visualization-skills@antv-g6-graph) - 61 installs
   - AntV G6 graph visualization library
   - Advanced graph layout algorithms
   - Alternative graph rendering engine

---

## Skills Storage & Synchronization

### Local Skills Location
Skills están almacenadas en **dos lugares**:

1. **Global (Usuario)**: `C:\Users\sebas\.agents\skills`
   - Disponibles en todas las sesiones
   - Instaladas con `npx skills add <skill> -g`
   - Se persisten entre sesiones

2. **Local (Repo)**: `.agents/skills/` ← **Committed to Git**
   - Sincronizadas con GitHub
   - Disponibles para compañeros después de `git pull`
   - Control de versión de skills

### Para Compañeros del Hackathon

Cuando tus compañeros hagan `git clone` o `git pull`:
```bash
# Las skills se descargarán automáticamente desde .agents/skills/
# No necesitan ejecutar npx skills add de nuevo
```

Para mantener sincronizadas:
```bash
# Si agregas una skill nueva:
cp -r ~/.agents/skills/<skill-name> ./.agents/skills/
git add .agents/skills/
git commit -m "Add <skill-name> to team skills"
git push
```

### Buenas Prácticas de Skills Globales

✅ **BIEN TENER MÚLTIPLES SKILLS:**
- Un skill = una capacidad especializada
- Más skills = más herramientas disponibles
- OpenCode carga solo lo que necesita
- No hay conflicto entre skills

✅ **RECOMENDACIÓN**: Mantener 8-15 skills es óptimo para:
- RAG/Backend (LangChain, Supabase)
- Frontend/UI (shadcn, frontend-design)
- Visualización (D3, AntV)
- Orquestación (Workflow patterns, agent-browser)

---

## Campus Map (2D) - Implementación Recomendada

Para tu mapa 2D del campus con nodos y aristas:

**Opción 1: D3.js (Recomendada)**
- Usar `d3-viz` skill
- Renderizar nodos (puntos) en coordenadas 2D
- Líneas para aristas (conexiones entre edificios)
- Canvas HTML5 como fondo (imagen del campus)

**Opción 2: AntV G6 (Alternativa)**
- Usar `antv-g6-graph` skill
- Mejor para grafos densamente conectados
- Layouts automáticos más sofisticados

**Stack Recomendado:**
- React + TypeScript (ya tienes)
- Canvas/SVG para la imagen de fondo
- D3.js o AntV G6 para grafo interactivo
- Tailwind + shadcn para UI

---

## Recommended Next Steps

1. **Create docs/ folder** for task tracking and project documentation
2. **Backend setup**: Initialize Express.js server with Node.js
3. **RAG implementation**: Set up LangChain with Supabase vector DB
4. **UI components**: Use shadcn/ui + frontend-design patterns
5. **Campus Map**: Implement 2D graph visualization with D3.js or AntV G6
6. **Agent workflows**: Design chatbot orchestration with agent-browser for web context
