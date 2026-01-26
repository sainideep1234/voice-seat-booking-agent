# 🎨 Restaurant Booking Frontend

Modern Next.js voice interface for restaurant bookings.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 9.15.9
- LiveKit account

### Installation

```bash
cd frontend
pnpm install
pnpm run download-files  # Important: Download required files
```

### Configuration

Create `.env.local` file:

```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Run

```bash
pnpm dev              # Development mode with Turbopack
pnpm build            # Build for production
pnpm start            # Run production build
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── app/              # Next.js App Router
├── components/       # React components
│   ├── ui/          # Base UI components (shadcn)
│   └── agent/       # Voice agent components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── styles/          # CSS styles
└── public/          # Static assets
```

## 🛠️ Available Scripts

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
```

## 🧩 Adding Components

```bash
# Add shadcn/ui components
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dialog input
```

## ⚙️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit server URL | ✅ |
| `LIVEKIT_API_KEY` | LiveKit API key (server-side) | ✅ |
| `LIVEKIT_API_SECRET` | LiveKit API secret (server-side) | ✅ |
| `NEXT_PUBLIC_API_URL` | Backend API URL | ❌ |

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Docker

```bash
docker build -t restaurant-frontend .
docker run -p 3000:3000 restaurant-frontend
```

## 🔧 Troubleshooting

**Build errors?**
```bash
rm -rf .next node_modules
pnpm install
pnpm build
```

**LiveKit connection issues?**
- Verify environment variables
- Check CORS settings
- Ensure WebSocket connections are allowed

**Hydration errors?**
Use dynamic imports for client-only components:
```tsx
import dynamic from 'next/dynamic';

const ClientComponent = dynamic(
  () => import('@/components/client-component'),
  { ssr: false }
);
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [LiveKit Components](https://docs.livekit.io/components/)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 License

MIT License
