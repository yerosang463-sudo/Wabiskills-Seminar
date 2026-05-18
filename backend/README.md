# WabiSeminar Live MVP Backend

A real-time video conferencing backend built with Node.js, Express, Socket.IO, and Sequelize ORM. Supports peer-to-peer video calls with WebRTC signaling, real-time chat, and meeting controls for small group seminars (2-4 participants).

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.IO** - Real-time WebSocket communication
- **Sequelize** - ORM for database operations
- **MySQL2** - MySQL database driver
- **JWT** - JSON Web Tokens for authentication
- **Passport** - Authentication middleware (including Google OAuth)
- **Bcryptjs** - Password hashing
- **Joi** - Input validation
- **Vitest** - Testing framework
- **Nodemon** - Development auto-reload

## Project Structure

```
backend/
├── src/                          # Main source code
│   ├── config/                   # Configuration files
│   │   ├── config.js             # Environment configuration loader
│   │   └── passport.js           # Passport authentication strategies
│   ├── controllers/              # Route controllers
│   │   ├── authController.js     # Authentication logic (register, login, OAuth)
│   │   └── roomController.js     # Room management logic
│   ├── database/                 # Database setup
│   │   └── (3 database files)
│   ├── middleware/               # Express middleware
│   │   ├── auth.js               # JWT authentication middleware
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validation.js         # Request validation middleware
│   ├── models/                   # Sequelize data models
│   │   ├── Message.js            # Chat message model
│   │   ├── Room.js               # Meeting room model
│   │   ├── User.js               # User model
│   │   ├── Message.test.js       # Message model tests
│   │   ├── Room.test.js          # Room model tests
│   │   └── User.test.js          # User model tests
│   ├── routes/                   # API route definitions
│   │   ├── auth.js               # Authentication routes
│   │   ├── index.js              # Route aggregator
│   │   ├── rooms.js              # Room management routes
│   │   └── stats.js              # Statistics routes
│   ├── server.js                 # Express app initialization and startup
│   ├── services/                 # Business logic services (empty)
│   ├── sockets/                  # Socket.IO event handlers
│   │   └── index.js              # WebRTC signaling and room events
│   └── utils/                    # Utility functions
│       ├── helpers.js            # Helper functions
│       ├── logger.js             # Logging utilities
│       └── publicUrl.js          # URL utilities
├── models/                       # Legacy models (root level)
│   ├── Room.js                   # Legacy room model
│   └── User.js                   # Legacy user model
├── middleware/                   # Legacy middleware (root level)
│   └── authMiddleware.js         # Legacy auth middleware
├── config/                       # Legacy config (root level)
│   └── db.js                     # Legacy database config
├── scripts/                      # Database management scripts
│   ├── add-google-id-field.js    # Add Google OAuth ID field
│   ├── add-plan-column.js        # Add plan column to users
│   ├── add-plan-column-production.js # Production plan column migration
│   ├── check-data.js             # Check database data
│   ├── check-database.js         # Check database connection
│   ├── check-table-structure.js  # Verify table structure
│   ├── create-tables.sql         # SQL table creation script
│   ├── init-database.js          # Initialize database
│   ├── inspect-tidb-schema.js    # Inspect TiDB schema
│   ├── repair-tidb-schema.js     # Repair TiDB schema
│   ├── reset-database.js         # Reset database
│   ├── test-connection.js        # Test database connection
│   └── test-tidb-room-create.js  # Test TiDB room creation
├── server.js                     # Legacy server entry point (root level)
├── .env                          # Environment variables (development)
├── .env.example                  # Environment variables template
├── database.sqlite               # SQLite database file
├── package.json                  # Project dependencies and scripts
├── render.yaml                   # Render deployment configuration
└── README.md                     # This file
```

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- MySQL 5.7 or higher (for database)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MySQL database credentials:
```
DATABASE_URL=mysql://username:password@localhost:3306/wabi_seminar
JWT_SECRET=your-secret-key-here
```

4. Create the MySQL database:
```sql
CREATE DATABASE wabi_seminar;
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the port specified in `.env` (default: 3000).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode (development/production) | development |
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | MySQL connection string | mysql://root:password@localhost:3306/wabi_seminar |
| `JWT_SECRET` | Secret key for JWT token signing | your-secret-key |
| `JWT_EXPIRY` | JWT token expiration time | 24h |
| `CORS_ORIGIN` | Allowed CORS origin for frontend | http://localhost:5173 |

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/auth/login
Log in an existing user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

### Room Management

#### POST /api/rooms (Protected)
Create a new meeting room.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "roomId": "unique-room-uuid",
    "createdBy": "user-uuid",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /api/rooms/:roomId (Protected)
Get room details and participants.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "roomId": "unique-room-uuid",
    "createdBy": "user-uuid",
    "participants": [
      {
        "userId": "user-uuid",
        "username": "john_doe",
        "audioEnabled": true,
        "videoEnabled": true
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/rooms/:roomId/join (Protected)
Join an existing meeting room.

**Response:**
```json
{
  "success": true,
  "data": {
    "room": { /* room object */ },
    "participants": [ /* participant list */ ]
  }
}
```

#### POST /api/rooms/:roomId/leave (Protected)
Leave a meeting room.

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

## Socket.IO Events

### Room Management

#### join-room
Emitted by client when joining a room.

**Payload:**
```json
{
  "roomId": "room-uuid",
  "userId": "user-uuid"
}
```

**Server broadcasts to others:**
```json
{
  "event": "user-connected",
  "data": {
    "userId": "user-uuid",
    "username": "john_doe"
  }
}
```

#### leave-room
Emitted by client when leaving a room.

**Payload:**
```json
{
  "roomId": "room-uuid",
  "userId": "user-uuid"
}
```

#### user-disconnected
Emitted by server when a user disconnects.

**Payload:**
```json
{
  "userId": "user-uuid"
}
```

### WebRTC Signaling

#### offer
Emitted by client to send WebRTC offer.

**Payload:**
```json
{
  "to": "target-user-uuid",
  "offer": { /* SDP offer object */ }
}
```

#### answer
Emitted by client to send WebRTC answer.

**Payload:**
```json
{
  "to": "target-user-uuid",
  "answer": { /* SDP answer object */ }
}
```

#### ice-candidate
Emitted by client to send ICE candidate.

**Payload:**
```json
{
  "to": "target-user-uuid",
  "candidate": { /* ICE candidate object */ }
}
```

### Chat

#### send-message
Emitted by client to send a chat message.

**Payload:**
```json
{
  "message": "Hello everyone!"
}
```

**Server broadcasts:**
```json
{
  "event": "receive-message",
  "data": {
    "sender": "user-uuid",
    "senderName": "john_doe",
    "message": "Hello everyone!",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Meeting Controls

#### toggle-audio
Emitted by client to toggle audio state.

**Payload:**
```json
{
  "enabled": true
}
```

#### toggle-video
Emitted by client to toggle video state.

**Payload:**
```json
{
  "enabled": true
}
```

## Testing

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with UI:
```bash
npm run test:ui
```

## Error Handling

All errors are returned in a standardized format:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication error)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Security Considerations

1. **Password Hashing:** Passwords are hashed using bcryptjs with 10 salt rounds
2. **JWT Tokens:** Tokens are signed with a secret key and expire after 24 hours
3. **CORS:** Configured to allow requests only from the specified frontend origin
4. **Input Validation:** All user inputs are validated before processing
5. **SQL Injection Prevention:** Sequelize ORM uses parameterized queries

## Development Notes

- The server uses ES modules (import/export syntax)
- Nodemon is configured for auto-reload during development
- Database models are automatically synced on startup in development mode
- Socket.IO is configured with CORS support for cross-origin connections

## License

MIT
