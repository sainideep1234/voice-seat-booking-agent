# 🎙️ Restaurant Voice Booking Agent

AI-powered voice assistant for restaurant reservations built with LiveKit Agents, Next.js, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 10.0.0
- Bun (for MongoDB server)
- MongoDB instance
- LiveKit account

### Installation

1. **Clone and install dependencies**

```bash
# Clone repository
git clone https://github.com/sainideep1234/restaurant-voice-booking-agent.git
cd vaiu-assignment

# Install agent dependencies
cd agent-starter-node
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
pnpm run download-files  # Important: Download required files

# Install MongoDB server dependencies
cd ../mongoDb-server
bun install
```

2. **Configure environment variables**

Create `.env` files in each directory (see `.env.example` files):

**agent-starter-node/.env**
```env
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

**frontend/.env**
```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

**mongoDb-server/.env**
```env
MONGO_URI=mongodb://localhost:27017/restaurant-bookings
PORT=3001
```

3. **Start all services**

Open three terminal windows:

```bash
# Terminal 1: MongoDB Server
cd mongoDb-server
bun run dev

# Terminal 2: LiveKit Agent
cd agent-starter-node
pnpm dev

# Terminal 3: Frontend
cd frontend
pnpm dev
```

4. **Access the application**

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
vaiu-assignment/
├── agent-starter-node/    # LiveKit Voice AI Agent (Node.js)
├── frontend/              # Next.js Web Application
├── mongoDb-server/        # Express + MongoDB API (Bun)
└── README.md
```

## 🛠️ Tech Stack

- **Agent**: LiveKit Agents (Node.js 22+, TypeScript)
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Database**: MongoDB, Express, Bun runtime

## 📚 Documentation

Each component has detailed documentation:

- [Agent Documentation](./agent-starter-node/README.md)
- [Frontend Documentation](./frontend/README.md)
- [MongoDB Server Documentation](./mongoDb-server/README.md)

## 🔧 Development Commands

### Agent
```bash
cd agent-starter-node
pnpm dev              # Development mode
pnpm build            # Build for production
pnpm start            # Run production build
```

### Frontend
```bash
cd frontend
pnpm dev              # Development mode
pnpm build            # Build for production
pnpm start            # Run production build
```

### MongoDB Server
```bash
cd mongoDb-server
bun run dev           # Development mode
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
