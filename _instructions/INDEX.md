# AadityaHasabnis.site Documentation

> Complete documentation index for the personal website project

---

## 📋 Quick Links

| Resource | Description |
|----------|-------------|
| [Architecture](#architecture) | Core patterns and philosophy |
| [Development](#development) | Setup, styling, components |
| [Data Layer](#data-layer) | Server, database, caching |
| [Agents](#agents) | AI agent playbooks |
| [Workflows](#workflows) | Development processes |

---

## 🏗️ Architecture

### Core Philosophy

| Document | Description | Key Topics |
|----------|-------------|------------|
| [ARCHITECTURE_PHILOSOPHY.md](./ARCHITECTURE_PHILOSOPHY.md) | Core architecture and design principles | Data flow, component hierarchy, rendering strategy, type system |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Complete folder organization | File structure, naming conventions, module organization |
| [COPILOT_INSTRUCTIONS.md](./COPILOT_INSTRUCTIONS.md) | AI coding assistant rules | Coding standards, patterns, do's and don'ts |

---

## 🎨 Development

### Styling & Components

| Document | Description | Key Topics |
|----------|-------------|------------|
| [STYLING_GUIDE.md](./STYLING_GUIDE.md) | CSS architecture and design system | Tailwind config, HSL colors, typography, animations |
| [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md) | Reusable component patterns | CVA variants, UI primitives, layouts, streaming |
| [CONSTANTS_GUIDE.md](./CONSTANTS_GUIDE.md) | Centralized constants | Site config, navigation, validation, query config |

### Configuration

| Document | Description | Key Topics |
|----------|-------------|------------|
| [ESLINT_RECOMMENDATIONS.md](./ESLINT_RECOMMENDATIONS.md) | Linting configuration | TypeScript strict, React, Tailwind, a11y rules |
| [PROFESSIONAL_SETUP.md](./PROFESSIONAL_SETUP.md) | Advanced implementation patterns | React Query, forms, dialogs, type utils, middleware |

---

## 💾 Data Layer

### Server & Database

| Document | Description | Key Topics |
|----------|-------------|------------|
| [SERVER_DATA_PATTERNS.md](./SERVER_DATA_PATTERNS.md) | Complete server-side patterns | Server queries, server actions, PPR, caching |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | MongoDB schema design | Collections, indexes, queries, migrations |
| [API_PATTERNS.md](./API_PATTERNS.md) | API design patterns | Server actions, API routes, webhooks |
| [RENDERING_RULES.md](./RENDERING_RULES.md) | Rendering strategies | ISR, static, streaming, revalidation |

---

## 🤖 Agents

### Agent Playbooks

Each agent has a dedicated playbook with role definition, responsibilities, inputs/outputs, and implementation patterns.

| Agent | File | Primary Role |
|-------|------|--------------|
| **Planner** | [PLANNER_AGENT.md](./agents/PLANNER_AGENT.md) | Task decomposition and orchestration |
| **Scaffold** | [SCAFFOLD_AGENT.md](./agents/SCAFFOLD_AGENT.md) | Project initialization and structure |
| **Frontend** | [FRONTEND_AGENT.md](./agents/FRONTEND_AGENT.md) | UI components, pages, and layouts |
| **Backend** | [BACKEND_AGENT.md](./agents/BACKEND_AGENT.md) | Database layer and server queries |
| **Admin** | [ADMIN_AGENT.md](./agents/ADMIN_AGENT.md) | Admin panel and authentication |
| **Content** | [CONTENT_AGENT.md](./agents/CONTENT_AGENT.md) | Markdown processing and enrichment |
| **SEO** | [SEO_AGENT.md](./agents/SEO_AGENT.md) | Metadata, sitemaps, OG images |
| **Release** | [RELEASE_AGENT.md](./agents/RELEASE_AGENT.md) | Deployment and CI/CD |
| **Test** | [TEST_AGENT.md](./agents/TEST_AGENT.md) | Unit, integration, and E2E testing |
| **Analytics** | [ANALYTICS_AGENT.md](./agents/ANALYTICS_AGENT.md) | Privacy-first analytics |
| **Perf-Sec** | [PERF_SEC_AGENT.md](./agents/PERF_SEC_AGENT.md) | Performance and security |

### Agent Overview

See [agents.md](./agents.md) for the complete agent system overview and interaction patterns.

---

## ⚡ Workflows

### Development Processes

| Workflow | Slash Command | Description |
|----------|---------------|-------------|
| Development | `/development` | [Start dev server](./.agent/workflows/development.md) |
| Build | `/build` | [Production bundle](./.agent/workflows/build.md) |
| Deploy | `/deploy` | [Vercel deployment](./.agent/workflows/deploy.md) |
| Content | `/content-publishing` | [Publish content](./.agent/workflows/content-publishing.md) |
| Testing | `/testing` | [Run tests](./.agent/workflows/testing.md) |

---

## 📚 Document Details

### Size Overview

| Document | Size | Lines |
|----------|------|-------|
| ARCHITECTURE_PHILOSOPHY.md | 29 KB | ~800 |
| PROFESSIONAL_SETUP.md | 20 KB | ~550 |
| SERVER_DATA_PATTERNS.md | 19 KB | ~520 |
| COPILOT_INSTRUCTIONS.md | 12 KB | ~330 |
| PROJECT_STRUCTURE.md | 12 KB | ~340 |
| STYLING_GUIDE.md | 11 KB | ~360 |
| COMPONENT_PATTERNS.md | 10 KB | ~300 |
| ESLINT_RECOMMENDATIONS.md | 10 KB | ~280 |
| API_PATTERNS.md | 9 KB | ~250 |
| CONSTANTS_GUIDE.md | 8 KB | ~230 |
| DATABASE_SCHEMA.md | 7 KB | ~200 |
| RENDERING_RULES.md | 6 KB | ~180 |
| agents.md | 17 KB | ~470 |
| **Total** | **~170 KB** | **~4,800** |

### Agent Playbooks

| Agent File | Size |
|------------|------|
| ADMIN_AGENT.md | 15 KB |
| FRONTEND_AGENT.md | 10 KB |
| BACKEND_AGENT.md | 8 KB |
| TEST_AGENT.md | 6 KB |
| SEO_AGENT.md | 6 KB |
| PERF_SEC_AGENT.md | 6 KB |
| SCAFFOLD_AGENT.md | 5 KB |
| ANALYTICS_AGENT.md | 4 KB |
| CONTENT_AGENT.md | 4 KB |
| RELEASE_AGENT.md | 3 KB |
| PLANNER_AGENT.md | 3 KB |
| **Total** | **~70 KB** |

---

## 🚀 Getting Started

### 1. Read Core Docs First

```bash
1. ARCHITECTURE_PHILOSOPHY.md  # Understand the vision
2. PROJECT_STRUCTURE.md         # Know where things go
3. COPILOT_INSTRUCTIONS.md      # Follow the rules
```

### 2. Development Setup

```bash
4. STYLING_GUIDE.md             # Design system
5. COMPONENT_PATTERNS.md        # Component patterns
6. PROFESSIONAL_SETUP.md        # Advanced patterns
```

### 3. Data Layer

```bash
7. DATABASE_SCHEMA.md           # Data model
8. SERVER_DATA_PATTERNS.md      # Queries & actions
9. RENDERING_RULES.md           # Caching strategy
```

### 4. Use Workflows

```bash
/development   # Start coding
/build         # Create bundle
/testing       # Run tests
/deploy        # Ship it
```

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-31 | Initial documentation complete |

---

## 📝 Contributing

When updating documentation:

1. **Keep it current** - Update docs when code changes
2. **Be specific** - Include code examples
3. **Stay consistent** - Follow existing patterns
4. **Cross-reference** - Link related documents

---

## 🏷️ Tags

`#nextjs` `#typescript` `#mongodb` `#tailwind` `#documentation` `#architecture`

---

*AadityaHasabnis.site - Personal Website Documentation*  
*Last Updated: January 31, 2026*
