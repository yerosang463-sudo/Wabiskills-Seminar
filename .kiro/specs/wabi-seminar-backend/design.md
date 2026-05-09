# WabiSeminar Live MVP - Backend System Design

## Overview

The WabiSeminar Live MVP backend is a Node.js/Express application that provides real-time video conferencing capabilities for small group seminars (2-4 participants). The system uses WebRTC for peer-to-peer video/audio communication, Socket.IO for real-time signaling and chat, and Sequelize ORM for persistent data storage.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│                  (Web/Mobile Frontends)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    HTTP/REST      WebSocket (Socket.IO)  │
        │                │                │
┌───────▼────────────────▼────────────────▼──────────────────┐
│                    Express Server                           │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │           API Routes & Controllers                   │  │
│  │  - Auth Routes (register, login)                     │  │
│  │  - Room Routes (create, join, leave)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Socket.IO Event Handlers                     │  │
│  │  - Signaling (offer, answer, ice-candidate)          │  │
│  │  - Chat (send-message, receive-message)              │  │
│  │  - Controls (toggle-audio, toggle-video)             │  │
│  │  - Room Management (join-room, leave-room)           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Services & Business Logic                    │  │
│  │  - AuthenticationService                             │  │
│  │  - RoomManager                                       │  │
│  │  - SignalingEngine                                   │  │
│  │  - ChatService                                       │  │
│  │  - MeetingControlsService                            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Middleware & Utilities                       │  │
│  │  - Authentication Middleware                         │  │
│  │  - Error Handler                                     │  │
│  │  - Request Validation                                │  │
│  │  - CORS Configuration                                │  │
│  └──────────────────────────────────────────────────────┘  │
└───────┬────────────────────────────────────────────────────┘
        │
        │ SQL Queries
        │
┌───────▼────────────────────────────────────────────────────┐
│              Sequelize ORM & Database                       │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Data Models                                  │  │
│  │  - User Model                                        │  │
│  │  - Room Model                                        │  │
│  │  - Message Model (optional)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Database (SQLite/PostgreSQL)                 │  │
│  │  - users table                                       │  │
│  │  - rooms table                                       │  │
│  │  - messages table (optional)                         │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### Authentication Service
- Validates user registration (unique username/email)
- Hashes passwords using bcryptjs
- Generates and verifies JWT tokens
- Handles login/registration logic

#### Room Manager
- Creates new rooms with unique UUIDs
- Tracks room participants
- Validates room capacity (2-4 participants)
- Manages room lifecycle (create, join, leave)

#### Signaling Engine
- Manages WebRTC peer connection setup
- Forwards SDP offers and answers between peers
- Forwards ICE candidates between peers
- Broadcasts user connection/disconnection events
- Maintains room-to-socket mappings

#### Chat Service
- Validates and broadcasts chat messages
- Optionally stores messages in database
- Ensures message delivery to all room participants

#### Meeting Controls Service
- Broadcasts audio/video toggle state changes
- Maintains participant media state

## Data Models

### User Model
```
User {
  id: UUID (primary key)
  username: String (unique, required)
  email: String (unique, required)
  password: String (hashed, required)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Room Model
```
Room {
  id: UUID (primary key)
  roomId: String (unique UUID, required)
  createdBy: UUID (foreign key to User)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Message Model (Optional)
```
Message {
  id: UUID (primary key)
  roomId: UUID (foreign key to Room)
  sender: UUID (foreign key to User)
  message: String (required)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### In-Memory Data Structures

#### Room Participants Tracking
```
roomParticipants: {
  [roomId]: {
    [userId]: {
      socketId: String,
      username: String,
      audioEnabled: Boolean,
      videoEnabled: Boolean
    }
  }
}
```

#### Socket-to-Room Mapping
```
socketToRoom: {
  [socketId]: {
    roomId: String,
    userId: String
  }
}
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
- Request: `{ username, email, password }`
- Response: `{ success: true, data: { id, username, email, createdAt } }`
- Errors: 400 (validation), 409 (conflict)

#### POST /api/auth/login
- Request: `{ email, password }`
- Response: `{ success: true, data: { token, user: { id, username, email } } }`
- Errors: 400 (validation), 401 (unauthorized)

### Room Endpoints

#### POST /api/rooms (protected)
- Request: `{}`
- Response: `{ success: true, data: { id, roomId, createdBy, createdAt } }`
- Errors: 401 (unauthorized)

#### GET /api/rooms/:roomId (protected)
- Response: `{ success: true, data: { id, roomId, createdBy, participants: [...], createdAt } }`
- Errors: 401 (unauthorized), 404 (not found)

#### POST /api/rooms/:roomId/join (protected)
- Request: `{}`
- Response: `{ success: true, data: { room, participants: [...] } }`
- Errors: 401 (unauthorized), 403 (full), 404 (not found)

#### POST /api/rooms/:roomId/leave (protected)
- Request: `{}`
- Response: `{ success: true, data: {} }`
- Errors: 400 (not in room), 401 (unauthorized)

## Socket.IO Events

### Room Management Events

#### join-room
- Emitted by: Client
- Payload: `{ roomId, userId }`
- Server broadcasts: `user-connected` to all other participants with `{ userId, username }`
- Server sends to joining user: `existing-participants` with `[{ userId, username, audioEnabled, videoEnabled }, ...]`

#### leave-room
- Emitted by: Client
- Payload: `{ roomId, userId }`
- Server broadcasts: `user-disconnected` to all remaining participants with `{ userId }`

#### user-disconnected (automatic)
- Emitted by: Server (on socket disconnect)
- Payload: `{ userId }`
- Broadcast to: All participants in the room

### WebRTC Signaling Events

#### offer
- Emitted by: Client (peer initiating connection)
- Payload: `{ to: userId, offer: SDPOffer }`
- Server forwards to: Target peer as `offer` event with `{ from: userId, offer: SDPOffer }`

#### answer
- Emitted by: Client (peer responding to offer)
- Payload: `{ to: userId, answer: SDPAnswer }`
- Server forwards to: Target peer as `answer` event with `{ from: userId, answer: SDPAnswer }`

#### ice-candidate
- Emitted by: Client (peer discovering ICE candidates)
- Payload: `{ to: userId, candidate: ICECandidate }`
- Server forwards to: Target peer as `ice-candidate` event with `{ from: userId, candidate: ICECandidate }`

### Chat Events

#### send-message
- Emitted by: Client
- Payload: `{ message: String }`
- Server broadcasts: `receive-message` to all participants with `{ sender: userId, senderName: String, message: String, timestamp: DateTime }`

### Meeting Controls Events

#### toggle-audio
- Emitted by: Client
- Payload: `{ enabled: Boolean }`
- Server broadcasts: `toggle-audio` to all other participants with `{ userId, enabled: Boolean }`

#### toggle-video
- Emitted by: Client
- Payload: `{ enabled: Boolean }`
- Server broadcasts: `toggle-video` to all other participants with `{ userId, enabled: Boolean }`

## Middleware & Error Handling

### Authentication Middleware
- Extracts JWT token from Authorization header
- Verifies token signature and expiration
- Attaches user ID to request object
- Returns 401 if token missing or invalid

### Error Handler Middleware
- Catches all errors from routes and services
- Logs errors for debugging
- Returns standardized error response: `{ success: false, message: String }`
- HTTP status codes: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 409 (conflict), 500 (server error)

### Request Validation
- Validates required fields in request body
- Validates email format
- Validates password strength (minimum 6 characters)
- Validates UUID format for room IDs

## Correctness Properties

### Property 1: User Registration Idempotency
**Description:** Registering the same user twice should fail with a conflict error on the second attempt.
**Invariant:** For any username/email pair, at most one User record can exist in the database.
**Validation:** Requirements 1.1, 1.2, 1.6

### Property 2: Password Security
**Description:** Passwords must never be stored in plaintext; they must always be hashed.
**Invariant:** No User record in the database contains a plaintext password.
**Validation:** Requirement 1.3

### Property 3: JWT Token Validity
**Description:** A valid JWT token must contain the user ID and be verifiable.
**Invariant:** Any JWT token generated by the system can be verified and decoded to extract the original user ID.
**Validation:** Requirement 2.3

### Property 4: Room Capacity Enforcement
**Description:** A room must never exceed 4 participants.
**Invariant:** For any room, the number of participants is always ≤ 4.
**Validation:** Requirement 5.2

### Property 5: Participant Consistency
**Description:** A user can only be in one room at a time.
**Invariant:** For any user, there is at most one room where the user is listed as a participant.
**Validation:** Requirement 5.3

### Property 6: Message Delivery
**Description:** When a message is sent, all participants in the room must receive it.
**Invariant:** For any message sent in a room, all connected participants receive a receive-message event.
**Validation:** Requirement 11.3

### Property 7: Signaling Peer Existence
**Description:** Signaling events (offer, answer, ice-candidate) must only be forwarded to peers that exist in the room.
**Invariant:** If a signaling event targets a peer not in the room, it is not forwarded.
**Validation:** Requirement 8.4, 9.3

### Property 8: Disconnection Notification
**Description:** When a participant disconnects, all remaining participants must be notified.
**Invariant:** For any participant disconnection, all remaining participants in the room receive a user-disconnected event.
**Validation:** Requirement 10.1, 10.2

## Technology Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Real-time Communication:** Socket.IO
- **ORM:** Sequelize
- **Database:** SQLite (development) / PostgreSQL (production)
- **Authentication:** JWT (jsonwebtoken), bcryptjs
- **Validation:** joi or express-validator
- **Environment:** dotenv
- **Logging:** winston or pino (optional)

## Configuration

### Environment Variables
```
NODE_ENV=development
PORT=3000
DATABASE_URL=sqlite://./database.sqlite
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:5173
```

### CORS Configuration
- Allow requests from frontend origin
- Allow credentials (cookies/auth headers)
- Allow methods: GET, POST, PUT, DELETE
- Allow headers: Content-Type, Authorization

## Security Considerations

1. **Password Hashing:** Use bcryptjs with salt rounds ≥ 10
2. **JWT Tokens:** Use strong secret key, set appropriate expiry (24 hours)
3. **Input Validation:** Validate all user inputs before processing
4. **SQL Injection Prevention:** Use Sequelize parameterized queries
5. **CORS:** Restrict to known frontend origins
6. **Rate Limiting:** Consider implementing rate limiting for auth endpoints
7. **HTTPS:** Use HTTPS in production
8. **Socket.IO Authentication:** Verify JWT token on socket connection

## Deployment Considerations

1. **Database:** Use PostgreSQL in production instead of SQLite
2. **Environment:** Use environment variables for sensitive configuration
3. **Logging:** Implement structured logging for debugging
4. **Monitoring:** Monitor server health, error rates, and performance
5. **Scaling:** Socket.IO can be scaled with Redis adapter for multiple server instances
6. **Graceful Shutdown:** Implement graceful shutdown to close connections properly

## Testing Strategy

### Unit Tests
- Authentication service (registration, login, token generation)
- Room manager (create, join, leave, capacity validation)
- Chat service (message validation, broadcasting)
- Data models (validation, associations)

### Integration Tests
- Full authentication flow (register → login → protected route)
- Full room flow (create → join → leave)
- WebRTC signaling flow (join → offer → answer → ice-candidate)
- Chat flow (send message → receive message)

### Property-Based Tests
- User registration idempotency (Property 1)
- Room capacity enforcement (Property 4)
- Participant consistency (Property 5)
- Message delivery (Property 6)
- Signaling peer existence (Property 7)
- Disconnection notification (Property 8)

## Implementation Phases

### Phase 1: Project Setup & Database
- Initialize Node.js project
- Install dependencies
- Setup environment configuration
- Create database models and migrations

### Phase 2: Authentication
- Implement password hashing
- Implement JWT token generation/verification
- Create authentication middleware
- Create auth controller and routes

### Phase 3: Room Management
- Implement room controller
- Implement room routes
- Implement participant tracking
- Implement capacity validation

### Phase 4: WebRTC Signaling
- Setup Socket.IO server
- Implement join-room event handler
- Implement offer/answer exchange
- Implement ICE candidate forwarding
- Implement disconnection handling

### Phase 5: Real-Time Chat
- Implement send-message event handler
- Implement message broadcasting
- Implement optional message storage

### Phase 6: Meeting Controls
- Implement audio/video toggle handlers
- Implement state broadcasting

### Phase 7: Error Handling & Polish
- Implement global error handler
- Implement request validation
- Setup CORS configuration
- Create documentation and examples
