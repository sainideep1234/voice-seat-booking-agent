# 🗄️ MongoDB API Server

Express + MongoDB backend for restaurant bookings, powered by Bun.

## 🚀 Quick Start

### Prerequisites

- Bun ([Install](https://bun.sh))
- MongoDB (local or cloud)

### Installation

```bash
cd mongoDb-server
bun install
```

### Configuration

Create `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/restaurant-bookings
PORT=3001
```

### Run

```bash
bun run dev           # Development mode
```

Server runs on `http://localhost:3001`

## 📁 Project Structure

```
mongoDb-server/
├── src/
│   ├── index.ts      # Server entrypoint
│   ├── routes/       # API routes
│   ├── models/       # Mongoose models
│   └── controllers/  # Route controllers
└── package.json
```

## 🗃️ Database Schema

```typescript
interface Booking {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: Date;
  time: string;              // HH:MM format
  partySize: number;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
  specialRequests?: string;
  dietaryRestrictions?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 📡 API Endpoints

### Get All Bookings
```http
GET /api/bookings
```

### Create Booking
```http
POST /api/bookings
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "date": "2024-01-15",
  "time": "19:00",
  "partySize": 4
}
```

### Get Booking by ID
```http
GET /api/bookings/:id
```

### Update Booking
```http
PUT /api/bookings/:id
Content-Type: application/json

{
  "status": "confirmed"
}
```

### Delete Booking
```http
DELETE /api/bookings/:id
```

### Check Availability
```http
GET /api/bookings/availability?date=2024-01-15&time=19:00&partySize=4
```

## ⚙️ Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | ✅ | - |
| `PORT` | Server port | ❌ | `3001` |
| `CORS_ORIGIN` | Allowed CORS origins | ❌ | `*` |

## � Docker Deployment

```bash
docker build -t mongodb-server .
docker run -p 3001:3001 \
  -e MONGO_URI=mongodb://... \
  mongodb-server
```

## 🔧 Troubleshooting

**MongoDB connection failed?**
```bash
# Check MongoDB is running
mongosh

# Test connection
mongosh $MONGO_URI
```

**Port already in use?**
```bash
# Find and kill process
lsof -i :3001
kill -9 <PID>

# Or use different port
PORT=3002 bun run dev
```

**CORS errors?**
Update CORS configuration in `src/index.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true
}));
```

## 📚 Resources

- [Bun Documentation](https://bun.sh/docs)
- [Express.js Guide](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [MongoDB Manual](https://docs.mongodb.com)

## 📄 License

MIT License
