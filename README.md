# AutoAgent - Autonomous Knowledge Execution Agent

An AI-powered autonomous agent that retrieves information from internal knowledge sources, reasons over the retrieved information, determines appropriate actions, executes them automatically, and explains every decision through a complete audit trail.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   Chat   │  │Knowledge │  │  Audit   │  │ Memory │ │
│  │  Window  │  │ Manager  │  │  Logs    │  │ Viewer │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
│       └──────────────┴─────────────┴────────────┘      │
│                        │                                │
│                   API Routes (/api/*)                   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                Agent Orchestrator                        │
│  ┌────────────┐  ┌───────────┐  ┌───────────────────┐  │
│  │  Reasoning │  │  Memory   │  │  Tool Registry    │  │
│  │  Engine    │  │  Manager  │  │                   │  │
│  └────────────┘  └───────────┘  └───────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    Tools Layer                           │
│  ┌──────────┐ ┌────────┐ ┌────────┐ ┌───────────────┐ │
│  │Employee  │ │Product │ │ Leave  │ │ Knowledge     │ │
│  │ Tools    │ │ Tools  │ │ Tools  │ │ Search Tools  │ │
│  └──────────┘ └────────┘ └────────┘ └───────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Knowledge Sources & Database                │
│  ┌──────────┐ ┌──────┐ ┌──────┐ ┌──────────────────┐  │
│  │PostgreSQL│ │ JSON │ │ CSV  │ │ Vector Database  │  │
│  │ (SQLite) │ │      │ │      │ │  (Embeddings)    │  │
│  └──────────┘ └──────┘ └──────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 (App Router) | Full-stack framework |
| React + TypeScript | Frontend UI |
| Tailwind CSS | Styling |
| Prisma ORM | Database access |
| SQLite | Database (PostgreSQL-ready) |
| OpenAI / Google Gemini | LLM reasoning |
| LangChain | Agent framework (optional) |

## Features

### Core Capabilities
- **Autonomous Reasoning**: LLM-powered decision-making
- **Multi-Step Planning**: Complex workflows executed step-by-step
- **Parallel Execution**: Independent operations run concurrently
- **Vector Search**: Semantic search over internal knowledge
- **Long-Term Memory**: Remembers user preferences and past actions
- **Complete Audit Trail**: Every action logged with explanation

### Supported Actions
- **Employee Management**: Create, read, update, delete employees
- **Product Management**: Add, update, delete products
- **Leave Management**: Approve/reject leave requests with policy checks
- **Inventory Management**: Update stock levels, check availability
- **Knowledge Search**: Semantic search across documents, policies, FAQs
- **Report Generation**: Compile data from multiple internal sources

### Safety Features
- **Human Approval**: Destructive actions require confirmation
- **Conflict Handling**: Missing data, invalid requests explained
- **Transparency**: Full reasoning and decision explanation

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd agentic-ai-website

# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Initialize database
npx prisma db push
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `LLM_PROVIDER` | LLM provider (`openai` or `google`) | `openai` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `OPENAI_MODEL` | OpenAI model name | `gpt-4` |
| `GOOGLE_API_KEY` | Google Gemini API key | - |

> **Note**: The system works in **mock mode** without API keys, providing simulated AI responses for all features.

## API Reference

### Chat
```
POST /api/chat
Body: { message: string, sessionId?: string, confirmedAction?: { tool, params } }
Response: { reasoning, explanation, steps, requiresConfirmation, ... }
```

### Execute Tool Directly
```
POST /api/execute
Body: { toolName: string, parameters: object }
```

### Employees
```
GET    /api/employees       - List employees
POST   /api/employees       - Create employee
GET    /api/employees/:id   - Get employee
PUT    /api/employees/:id   - Update employee
DELETE /api/employees/:id   - Delete employee
```

### Products
```
GET    /api/products         - List products
POST   /api/products         - Create product
GET    /api/products/:id     - Get product
PUT    /api/products/:id     - Update product
DELETE /api/products/:id     - Delete product
```

### Knowledge
```
POST   /api/knowledge/upload  - Upload document (multipart form)
GET    /api/knowledge         - List documents
DELETE /api/knowledge?id=xxx  - Delete document
```

### Audit & Memory
```
GET    /api/audit-logs    - View audit logs
GET    /api/memory        - View memories
GET    /api/conversations - View conversations
```

### Database
```
POST   /api/seed          - Seed database with sample data
```

## Database Schema

- **Employee** - Employee records with leave balance
- **Product** - Product catalog with pricing
- **Policy** - Company policies (leave, inventory, etc.)
- **Inventory** - Stock levels per product/location
- **LeaveRequest** - Employee leave applications
- **Order** - Customer orders
- **AuditLog** - Complete action history
- **Conversation** - Chat history
- **Memory** - Long-term memory storage
- **KnowledgeDocument** - Internal knowledge documents
- **FAQ** - Frequently asked questions

## Workflow Example

User: "Approve leave for Rahul if he has more than 15 leave balance."

1. Agent retrieves employee info for Rahul
2. Checks leave balance (18 days)
3. Checks company leave policy
4. Reasons: 18 > 15, policy allows
5. Approves leave (uses 3 days, remaining: 15)
6. Updates database
7. Creates audit log with full explanation
8. Responds to user

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   └── page.tsx       # Dashboard
├── components/
│   ├── audit/         # Audit log viewer
│   ├── chat/          # Chat window & timeline
│   ├── knowledge/     # Knowledge manager
│   └── shared/        # Sidebar, settings, theme
└── lib/
    ├── agents/        # Agent orchestrator & reasoning
    ├── db/            # Prisma client & seed
    ├── knowledge/     # Knowledge service
    ├── memory/        # Memory manager
    ├── services/      # Chat service
    ├── tools/         # Tool implementations
    └── utils/         # LLM & embedding utilities
```

## License

MIT
