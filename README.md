# 🎙️ Restaurant Voice Booking Agent

AI-powered voice assistant for restaurant reservations built with LiveKit Agents, Next.js, and MongoDB.

## 🌟 Motive & Inspiration

### The Problem
Traditional online restaurant reservation systems rely on static web forms. Users must manually click through dates, pick times, select options, and fill out text boxes. If a customer has a unique dietary restriction, a seating preference based on today's weather, or needs to change their reservation details mid-way, the process becomes rigid and frustrating.

### The Solution
The **Restaurant Voice Booking Agent** re-imagines typical web forms as intuitive, natural, non-linear voice conversations. 
Inspired by the hospitality of a real restaurant host, this project uses LiveKit's real-time voice streaming framework and LLM function-calling capabilities to allow users to book tables verbally. 

The agent can:
- Conversationalize table availability checks, seating preferences (suggesting indoor/outdoor depending on real-time weather), cuisine selections, and special requests.
- Dynamically adapt if the customer changes their mind or corrects a detail (e.g. changing the guest count) at any point in the conversation.
- Persist, update, delete, and look up booking details directly in MongoDB via local tool invocation.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 22.0.0
- **MongoDB** instance (Local or Atlas URI)
- **LiveKit Cloud** account (for voice streaming)
- **WeatherAPI.com** API key (for weather-based seating suggestions)

---

### 1. Configure Environment Variables

Create the `.env` configuration files in the `backend` and `frontend` directories.

#### **`backend/.env`** (or `.env.local`)
```env
LIVEKIT_URL=wss://your-livekit-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
WEATHER_API_KEY=your-weatherapi-key
MONGODB_URL=mongodb://localhost:27017/restaurant-bookings
```

#### **`frontend/.env`** (or `.env.local`)
```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

---

### 2. Start Services

Open two terminal windows:

#### **Terminal 1: LiveKit Voice Agent Backend**
```bash
cd backend
pnpm install     # or npm install
pnpm run dev     # or npm run dev
```

#### **Terminal 2: Frontend Web App**
```bash
cd frontend
pnpm install     # or npm install
pnpm run download-files
pnpm run dev     # or npm run dev
```

---

### 3. Test & Enjoy!
Open [http://localhost:3000](http://localhost:3000) in your browser to interact with your Voice Booking Agent.

---

## 📁 Project Structure

```
restaurant-voice-booking-agent/
├── backend/            # LiveKit Voice AI Agent (runs voice logic & MongoDB database layer)
├── frontend/           # Next.js Web Application UI
└── README.md           # This setup guide
```

## 🛠️ Tech Stack
- **Voice Agent Framework**: `@livekit/agents` (Node.js & TypeScript)
- **Speech-to-Text**: AssemblyAI streaming
- **Text-to-Speech**: Cartesia Sonic
- **LLM Engine**: GPT-4o-mini
- **Database**: MongoDB (via Mongoose)
- **Frontend**: Next.js 15, React 19, Tailwind CSS
