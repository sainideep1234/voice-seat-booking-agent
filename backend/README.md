# 🤖 LiveKit Voice AI Agent

Restaurant booking voice assistant backend powered by LiveKit Agents.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 10.0.0
- LiveKit account ([Sign up](https://cloud.livekit.io))

### Installation

```bash
cd agent-starter-node
pnpm install
```

### Configuration

Create `.env` file:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

### Run

```bash
pnpm dev              # Development mode
pnpm build            # Build for production
pnpm start            # Run production build
```

## 📁 Project Structure

```
agent-starter-node/
├── src/
│   └── agent.ts      # Main agent entrypoint
├── dist/             # Compiled output
├── package.json
└── tsconfig.json
```

## 🛠️ Available Scripts

```bash
pnpm dev              # Run with hot reload
pnpm build            # Compile TypeScript
pnpm start            # Run production build
pnpm test             # Run tests
pnpm lint             # Check code quality
pnpm format           # Format code
pnpm typecheck        # Type checking
```

## ⚙️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `LIVEKIT_URL` | LiveKit server WebSocket URL | ✅ |
| `LIVEKIT_API_KEY` | LiveKit API key | ✅ |
| `LIVEKIT_API_SECRET` | LiveKit API secret | ✅ |

## 🐳 Docker Deployment

```bash
docker build -t restaurant-agent .
docker run -p 3000:3000 \
  -e LIVEKIT_URL=wss://... \
  -e LIVEKIT_API_KEY=... \
  -e LIVEKIT_API_SECRET=... \
  restaurant-agent
```

## 📚 Resources

- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [Node.js SDK Reference](https://docs.livekit.io/agents/nodejs/)
- [Building Workflows](https://docs.livekit.io/agents/build/workflows/)

## 🔧 Troubleshooting

**Connection issues?**
- Verify LiveKit credentials in `.env`
- Check `LIVEKIT_URL` format (must start with `wss://`)
- Ensure LiveKit project is active

**Build errors?**
```bash
pnpm clean
pnpm install
pnpm build
```

## 📄 License

MIT License
