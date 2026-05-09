# Implementation Plan: WabiSeminar Live MVP Backend

## Overview

This implementation plan breaks down the WabiSeminar Live MVP backend into discrete, manageable coding tasks. Each task builds incrementally on previous steps, with testing integrated throughout. The system will be built using Node.js, Express, Socket.IO, and Sequelize, following the architecture and design specifications.

## Tasks

- [-] 1. Project Setup & Configuration
  - [ ] 1.1 Initialize Node.js project and install dependencies
    - Create package.json with Express, Socket.IO, Sequelize, JWT, bcryptjs, dotenv, and validation libraries
    - Install all dependencies
    - _Requirements: 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 13.0, 14.0, 15.0, 16.0_

  - [ ] 1.2 Setup environment configuration and server initialization
    - Create .env file with PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRY, CORS_ORIGIN
    - Create config/config.js to load environment variables
    - Create server.js with Express app initialization and middleware setup
    - Setup CORS configuration to allow frontend requests
    - _Requirements: 1.0, 2.0_

  - [ ] 1.3 Setup database connection with Sequelize
    - Create database/sequelize.js to initialize Sequelize connection
    - Configure database for SQLite (development) or PostgreSQL (production)
    - Create database/index.js to export models
    - _Requirements: 16.0_

- [-] 2. Database Models & Associations
  - [ ] 2.1 Create User model with validation
    - Define User model with id, username, email, password, createdAt, updatedAt
    - Add unique constraints on username and email
    - Add password hashing hook using bcryptjs
    - _Requirements: 1.0, 2.0, 16.1_

  - [ ] 2.2 Create Room model with associations
    - Define Room model with id, roomId, createdBy, createdAt, updatedAt
    - Add unique constraint on roomId
    - Setup foreign key relationship to User (createdBy)
    - _Requirements: 4.0, 5.0, 16.2_

  - [ ] 2.3 Create Message model (optional) with associations
    - Define Message model with id, roomId, sender, message, createdAt, updatedAt
    - Setup foreign key relationships to Room and User
    - _Requirements: 12.0, 16.3_

  - [ ]* 2.4 Write property tests for data models
    - **Property 1: User Registration Idempotency** - Verify that duplicate usernames/emails are rejected
    - **Property 2: Password Security** - Verify passwords are always hashed, never plaintext
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.6**

- [ ] 3. Authentication Service & Middleware
  - [ ] 3.1 Implement password hashing and JWT utilities
    - Create utils/passwordUtils.js with hash and compare functions using bcryptjs
    - Create utils/tokenUtils.js with generateToken and verifyToken functions
    - _Requirements: 1.3, 2.3_

  - [ ] 3.2 Create authentication middleware
    - Create middleware/authMiddleware.js to extract and verify JWT tokens
    - Attach user ID to request object on successful verification
    - Return 401 errors for missing or invalid tokens
    - _Requirements: 3.0_

  - [ ] 3.3 Create authentication controller
    - Create controllers/authController.js with register and login functions
    - Implement user registration with validation (unique username/email)
    - Implement user login with password verification
    - Return appropriate error codes (400, 401, 409)
    - _Requirements: 1.0, 2.0_

  - [ ] 3.4 Create authentication routes
    - Create routes/authRoutes.js with POST /register and POST /login endpoints
    - Wire controller functions to routes
    - _Requirements: 1.0, 2.0_

  - [ ]* 3.5 Write property tests for authentication
    - **Property 3: JWT Token Validity** - Verify generated tokens can be verified and decoded correctly
    - **Validates: Requirements 2.3, 3.0**

- [ ] 4. Room Management System
  - [ ] 4.1 Create room controller
    - Create controllers/roomController.js with createRoom, getRoom, joinRoom, leaveRoom functions
    - Implement room creation with unique UUID generation
    - Implement room retrieval with participant list
    - Implement join validation (room exists, capacity check)
    - Implement leave functionality
    - _Requirements: 4.0, 5.0, 6.0_

  - [ ] 4.2 Create room routes
    - Create routes/roomRoutes.js with POST /rooms, GET /rooms/:roomId, POST /rooms/:roomId/join, POST /rooms/:roomId/leave
    - Apply authentication middleware to all routes
    - Wire controller functions to routes
    - _Requirements: 4.0, 5.0, 6.0_

  - [ ] 4.3 Create room manager service for in-memory participant tracking
    - Create services/roomManager.js to track room participants in memory
    - Implement addParticipant, removeParticipant, getParticipants, getParticipantCount functions
    - Implement capacity validation (max 4 participants)
    - _Requirements: 5.0, 6.0_

  - [ ]* 4.4 Write property tests for room management
    - **Property 4: Room Capacity Enforcement** - Verify rooms never exceed 4 participants
    - **Property 5: Participant Consistency** - Verify users can only be in one room at a time
    - **Validates: Requirements 5.2, 5.3**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Socket.IO Setup & Room Management Events
  - [ ] 6.1 Setup Socket.IO server and connection handling
    - Create services/socketManager.js to initialize Socket.IO
    - Setup socket connection event with JWT authentication
    - Create socket-to-room mapping to track which room each socket belongs to
    - _Requirements: 7.0, 10.0_

  - [ ] 6.2 Implement join-room event handler
    - Create event handler for join-room event
    - Broadcast user-connected event to all other participants
    - Send existing-participants list to joining user
    - Update in-memory participant tracking
    - _Requirements: 7.0_

  - [ ] 6.3 Implement leave-room event handler
    - Create event handler for leave-room event
    - Remove user from room participant list
    - Broadcast user-disconnected event to remaining participants
    - _Requirements: 6.0, 10.2_

  - [ ] 6.4 Implement automatic disconnection handling
    - Create event handler for socket disconnect
    - Remove user from all room participant lists
    - Broadcast user-disconnected event to room participants
    - _Requirements: 10.1_

  - [ ]* 6.5 Write property tests for room events
    - **Property 8: Disconnection Notification** - Verify all remaining participants receive user-disconnected events
    - **Validates: Requirements 10.1, 10.2**

- [ ] 7. WebRTC Signaling Implementation
  - [ ] 7.1 Implement offer event handler
    - Create event handler for offer event
    - Validate target peer exists in room
    - Forward offer to target peer with sender information
    - _Requirements: 8.0_

  - [ ] 7.2 Implement answer event handler
    - Create event handler for answer event
    - Validate target peer exists in room
    - Forward answer to target peer with sender information
    - _Requirements: 8.0_

  - [ ] 7.3 Implement ICE candidate event handler
    - Create event handler for ice-candidate event
    - Validate target peer exists in room (silently discard if not)
    - Forward candidate to target peer with sender information
    - _Requirements: 9.0_

  - [ ]* 7.4 Write property tests for signaling
    - **Property 7: Signaling Peer Existence** - Verify signaling events are only forwarded to peers in the room
    - **Validates: Requirements 8.4, 9.3**

- [ ] 8. Real-Time Chat Implementation
  - [ ] 8.1 Implement send-message event handler
    - Create event handler for send-message event
    - Validate message is not empty
    - Create message object with sender, text, and timestamp
    - Broadcast receive-message event to all participants in room
    - _Requirements: 11.0_

  - [ ] 8.2 Implement optional message storage
    - Create service function to store messages in database
    - Call storage function before broadcasting (if enabled)
    - _Requirements: 12.0_

  - [ ]* 8.3 Write property tests for chat
    - **Property 6: Message Delivery** - Verify all participants receive sent messages
    - **Validates: Requirements 11.3**

- [ ] 9. Meeting Controls Implementation
  - [ ] 9.1 Implement toggle-audio event handler
    - Create event handler for toggle-audio event
    - Update participant audio state in memory
    - Broadcast toggle-audio event to all other participants in room
    - _Requirements: 13.0_

  - [ ] 9.2 Implement toggle-video event handler
    - Create event handler for toggle-video event
    - Update participant video state in memory
    - Broadcast toggle-video event to all other participants in room
    - _Requirements: 14.0_

- [ ] 10. Error Handling & Middleware
  - [ ] 10.1 Create global error handler middleware
    - Create middleware/errorHandler.js to catch all errors
    - Log errors for debugging
    - Return standardized error response format: { success: false, message: String }
    - Map error types to appropriate HTTP status codes
    - _Requirements: 15.0_

  - [ ] 10.2 Create request validation middleware
    - Create middleware/validationMiddleware.js for input validation
    - Validate required fields in request bodies
    - Validate email format, password strength, UUID format
    - Return 400 errors for validation failures
    - _Requirements: 1.7, 2.7, 15.0_

  - [ ] 10.3 Wire error handler and validation middleware to Express app
    - Apply validation middleware to auth routes
    - Apply error handler as final middleware
    - _Requirements: 15.0_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Integration & Wiring
  - [ ] 12.1 Wire all services together in server.js
    - Initialize database connection
    - Initialize Socket.IO with authentication
    - Mount auth routes
    - Mount room routes
    - Setup Socket.IO event handlers
    - Apply middleware in correct order
    - _Requirements: 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 13.0, 14.0, 15.0_

  - [ ] 12.2 Create example .env file
    - Document all required environment variables
    - Provide example values for development
    - _Requirements: 1.0_

  - [ ] 12.3 Create README with setup and usage instructions
    - Document project structure
    - Document how to install dependencies
    - Document how to setup environment variables
    - Document how to run the server
    - Document API endpoints and Socket.IO events
    - _Requirements: 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 13.0, 14.0, 15.0_

  - [ ]* 12.4 Write integration tests
    - Test full authentication flow (register → login → protected route)
    - Test full room flow (create → join → leave)
    - Test WebRTC signaling flow (join → offer → answer → ice-candidate)
    - Test chat flow (send message → receive message)
    - Test meeting controls flow (toggle audio/video)
    - _Requirements: 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 13.0, 14.0_

- [ ] 13. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and early error detection
- Property tests validate universal correctness properties defined in the design
- Unit tests validate specific examples and edge cases
- All code should follow clean code principles with proper separation of concerns
- Services should be reusable and testable
- Error handling should be consistent across all endpoints and event handlers
- Socket.IO events should include proper error handling and validation
