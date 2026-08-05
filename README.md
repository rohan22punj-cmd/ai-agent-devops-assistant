# AI DevOps Assistant

An AI-powered chat assistant that manages backend microservices through natural language — check service status, pull logs, or trigger restarts by just typing what you want, instead of hitting endpoints or dashboards manually.

**Live demo:** https://ai-agent-devops-assistant-eight.vercel.app/
**GitHub:** https://github.com/rohan22punj-cmd/ai-agent-devops-assistant

---

## What it does

You type something like *"is payment-service healthy?"* or *"restart the user service"* into the chat UI, and the agent either:

1. Detects that you're asking about live infrastructure, calls the real service, and returns the actual current data, **or**
2. If your message isn't about live infrastructure (e.g. "what's a good CI/CD setup?"), falls back to a plain LLM-generated answer for general DevOps conversation.

Every action the agent takes against a live service is logged, and the frontend shows a running history of what's happened.

---

## Architecture

```
Frontend (React/Vite)
      │
      ▼
Backend API (Express, server.js)
      │
      ▼
agentLogic.js  ──────────────► MongoDB Atlas (logs every action)
      │
      ├── Live-data keyword detected ─► tools.js ─► fake microservices
      │                                             (user-service, payment-service)
      │
      └── No keyword match ─► Groq API (Llama 3.3 70B) ─► plain chat reply
```

**Important note on how routing actually works:** this project does **not** use LLM-driven function calling (i.e. the model itself deciding which tool to call via a `tools`/`tool_calls` schema). Instead, `agentLogic.js` uses regex-based keyword detection (`getLiveRequest()` and `requestedServices()`) to decide, in plain JavaScript, whether a message needs live data and which service(s) it's about. If it does, the matching function is called directly from a lookup table in `tools.js` — the LLM is never invoked for that request. Only when no live-data keywords are detected does the message go to Groq, and even then the model is explicitly instructed not to claim it has live service access.

This was a deliberate tradeoff: fully deterministic and predictable behavior for real infrastructure actions (a restart never happens due to a model's guess), at the cost of only understanding phrasing that matches the regex patterns rather than arbitrary natural language.

### Two fake microservices
- `user-service` (port 4001)
- `payment-service` (port 4002)

Each is a small Express app restructured into MVC (controllers/services/routes), exposing:
- `GET /status`
- `GET /logs`
- `POST /restart` — protected by an API key header (`x-api-key`)
- `POST /simulate-crash`

These stand in for real backend services so the agent has something to actually manage.

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), custom CSS |
| Backend | Node.js, Express |
| AI | Groq API (Llama 3.3 70B) — used only for general chat fallback, no function calling |
| Database | MongoDB Atlas — logs every agent action |
| Deployment | Render (backend services + agent), Vercel (frontend), MongoDB Atlas (database) |

---

## Features

- Natural-language chat interface for infrastructure actions
- Regex-based intent detection for status checks, log retrieval, and restarts
- Per-service targeting (mentions of "user" vs "payment" route to the right service; unspecified defaults to checking both)
- Parallel execution when multiple services are checked in one request
- API-key-protected restart endpoint
- Full action history logged to MongoDB and surfaced in a collapsible sidebar
- Graceful error handling — a service being unreachable returns a readable error instead of crashing the request
- Suggested-question chips in the UI so users know what phrasing works

---

## Known limitations

- **Not true function calling.** Routing is keyword/regex-based, not model-driven. Phrasing outside the expected patterns (e.g. unusual synonyms) will fall through to the plain chat path instead of triggering a live check.
- **No multi-step chaining.** The agent can't reason "check status, and if it's down, restart it" in one turn — each action is a single, separate dispatch. Auto-remediation like this would need to be explicitly coded as a rule, not inferred by the model.
- **Fake services only.** `user-service` and `payment-service` are simulated Express apps for demo purposes, not real production infrastructure.
- **No containerization.** The project doesn't currently use Docker.

---

## Possible next steps

- Swap the regex router for real Groq function calling to compare tradeoffs (flexibility vs. predictability)
- Add explicit auto-remediation rules (e.g. auto-restart on detected downtime) as a hardcoded safety-checked rule rather than model-inferred behavior
- Containerize the microservices with Docker for a more realistic deployment story
- Expand beyond two services to test how routing scales with more targets
