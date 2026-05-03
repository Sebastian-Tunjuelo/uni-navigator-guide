# Virtual University Concierge

**Challenge 3 – University Orientation**

| Field       | Info                                                                            |
| ----------- | ------------------------------------------------------------------------------- |
| **Project** | Virtual University Concierge                                                    |
| **Team**    | Natalia Urbano Tovar, Sebastian Tunjuelo Lujan, Jerson Ramirez, Alfonso Palacio |
| **Program** | EPAM 2026                                                                       |
| **Date**    | April 30, 2026                                                                  |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [User Persona](#2-user-persona)
3. [POV Problem Statement](#3-pov-problem-statement)
4. [Ideation — Solution](#4-ideation--solution)
5. [Low-Fidelity Prototype](#5-low-fidelity-prototype)
6. [Architecture & Tech Stack](#6-architecture--tech-stack)
7. [Evidence of AI Usage](#7-evidence-of-ai-usage)
8. [Evidence of Iteration](#8-evidence-of-iteration)
9. [Conclusion / Reflection](#9-conclusion--reflection)
10. [Annexes](#10-annexes)

---

## 1. Introduction

This project addresses the challenge of university orientation for first-semester students, especially those coming from different backgrounds who face an abrupt transition into unfamiliar environments.

We selected this scenario because it represents a common real-world situation in large universities, where new students experience disorientation, anxiety, and isolation during their first days.

Our approach is based on **Design Thinking**, aiming to solve not only a functional problem (navigation), but also an emotional one (insecurity and loneliness).

---

## 2. User Persona

**Name:** Laura Torres  
**Age:** 18  
**Major:** Computer Engineering (First semester)  
**Background:** From a small town

### Context

Laura chose this university because of its academic program. She already has a place to stay, but she has never been in such a large campus before.

### Personality

- Introverted
- Observant
- Avoids drawing attention

### Motivations (Goals)

- Perform well academically
- Adapt quickly to university life
- Be independent
- Build social connections and feel part of the community

### Frustrations (Pain Points)

- Does not know the campus or how to move between buildings
- Feels alone because she does not know anyone
- Struggles to ask for help due to shyness
- Receives too much information at once and cannot prioritize
- Is afraid of making mistakes or being late

### Needs

- Clear guidance from day one
- A visual system to easily navigate the campus
- Organized information based on priority
- A sense of support and companionship
- Immediate help without social pressure

### Empathy Map

| Dimension | Description                                                                |
| --------- | -------------------------------------------------------------------------- |
| **Think** | "I don't know how to move around such a big campus."                       |
| **Feel**  | Anxious, insecure, lonely                                                  |
| **Say**   | "I feel lost, I don't know who to ask."                                    |
| **Do**    | Checks emails without understanding, arrives late, avoids asking questions |

### Key Insight

> Laura is not only physically lost, but also emotionally overwhelmed. The problem is not the lack of information, but how it is delivered: scattered, excessive, and without guidance. She needs an experience that guides her step by step, shows her where she is, tells her what to do first, and allows her to move forward without feeling judged.

---

## 3. POV Problem Statement

> **Laura needs** a clear and accessible guide to navigate her university **because** she feels overwhelmed by scattered information and fears asking for help.

### Journey Map — First Week Experience

| Day   | Experience                                                             |
| ----- | ---------------------------------------------------------------------- |
| Day 1 | Receives multiple emails, feels overwhelmed                            |
| Day 2 | Gets lost trying to find a classroom, arrives late                     |
| Day 3 | Avoids asking for help, feels isolated and anxious                     |
| Day 4 | Discovers the orientation app, uses the 2D map and chatbot for support |
| Day 5 | Gains confidence, attends events, connects with peers                  |

### Success Metrics (Impact Indicators)

- 50% reduction in orientation-related in-person queries
- Increased satisfaction among first-year students
- Fewer delays or absences due to disorientation
- Higher participation in university events and activities

---

## 4. Ideation — Solution

### Virtual University Concierge _(AI-Powered Assistant)_

A mobile application designed to support first-semester students like Laura. It combines:

#### 1. Smart Interactive Map

- Real-time location inside the campus
- Automatic routes to classrooms and offices
- Step-by-step navigation (similar to Google Maps)

#### 2. AI Assistant (Chatbot)

- Answers questions such as: _"Where is my class?"_ or _"What should I do first today?"_
- Uses simple, friendly language
- Available 24/7

#### 3. Progressive Onboarding

- Avoids overwhelming the student with too much information at once
- Guides step by step:
  - **Day 1:** Navigation
  - **Day 2:** Schedule
  - **Day 3:** Campus services

#### 4. Safe Social Space

- Chat with other first-semester students
- Optional anonymity
- Groups organized by major

---

## 5. Low-Fidelity Prototype

### Main Screens

| Screen              | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| **Home Screen**     | _"Hi Laura, where do you need to go today?"_                        |
| **Interactive Map** | Blue dot for current location · Highlighted route to destination    |
| **AI Chat**         | WhatsApp-style interface · Quick response options                   |
| **Daily Agenda**    | Classes of the day · _"Take me there"_ button that opens navigation |

> 📎 _Insert wireframes, storyboards, or sketches here._  
> _Show chatbot interface, agenda integration, and map navigation._

---

## 6. Architecture & Tech Stack

### Frontend

- **Framework**: Vite + React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Context API + React Query (planned)
- **Deployment**: Vercel/Netlify

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL en Supabase
- **Auth**: Simulada en frontend, no real por ahora
- **API**: `/api/health`, `/api/auth`, `/api/chat`, `/api/campus`
- **Architecture**: Workflow-ready (Temporal-compatible)

### AI & RAG (Future)

- **LLM**: Claude/GPT-4 (via API)
- **Embeddings**: OpenAI/HuggingFace
- **Vector Search**: Supabase pgvector
- **Orchestration**: LangChain + Temporal (Phase 2)

### Development Stack

- **Backend**: TypeScript, Express, Pino (logging)
- **Testing**: Jest (planned)
- **Monitoring**: Console logs → DataDog (production)
- **CI/CD**: GitHub Actions (planned)

### Project Structure

```
uni-navigator-guide/
├── src/                    # Frontend (React + TypeScript)
├── backend/               # Backend (Express + TypeScript)
├── supabase/              # Database migrations and config
├── docs/                  # Project documentation
└── .agents/skills/        # Installed agent skills
```

### How to Run

**Frontend:**

```bash
npm install
npm run dev  # http://localhost:5173
```

**Backend:**

```bash
cd backend
npm install
npm run dev  # http://localhost:3001
```

**Campus data:**

- El mapa usa todavía el grafo local de respaldo en `src/data/campus-extended.ts`.
- El backend ya expone `/api/campus` para mover la fuente de verdad hacia Supabase cuando la semilla esté lista.

**Login:**

- El acceso es demo/local con perfiles simulados; no hay autenticación real todavía.

**Database:**

- Create Supabase project
- Configure `.env` in root
- Run migrations: Execute SQL from `supabase/migrations/`

---

## 7. Evidence of AI Usage

> 📎 _Insert screenshots or short descriptions of how AI was used in ideation, prototyping, or testing._

**Example:** We used ChatGPT to generate onboarding scenarios and validate FAQs.

---

## 7. Evidence of Iteration

> 📎 _Show "before and after" of the prototype after feedback._

**Example:** Initially, the chatbot only answered FAQs. After testing, we added calendar integration to reduce missed deadlines.

---

## 8. Conclusion / Reflection

- What the team learned throughout the design thinking process
- **Expected impact:** Reduced student anxiety, improved onboarding efficiency
- **Future improvements:** Scalability and accessibility enhancements

---

## 9. Annexes

> 📎 _Additional materials, references, and supporting documents._

### Backend Documentation

- [Backend README](./backend/README.md) - Setup, architecture, and development guide
- [API Documentation](./backend/API.md) - Complete endpoint reference with examples
- [Workflow Architecture](./backend/WORKFLOW_ARCHITECTURE.md) - How to scale to Temporal

### Database

- [SQL Migrations](./supabase/migrations/20260501_000000_create_tables.sql) - Schema definition

### Project Documentation

- [Tareas Backend](./docs/tareas-backend.md) - Backend implementation checklist
- [Tareas RAG](./docs/tareas-rag.md) - RAG and LLM integration roadmap
- [Tareas Mapa](./docs/tareas-mapa.md) - Campus map implementation guide
- [AGENTS.md](./AGENTS.md) - Installed skills and recommendations
