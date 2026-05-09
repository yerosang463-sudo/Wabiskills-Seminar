# WabiSeminar Live MVP - Backend System Requirements

## Introduction

WabiSeminar Live MVP is a real-time seminar and video meeting platform backend system. It enables users to register, authenticate, create and join meeting rooms, conduct peer-to-peer video calls with WebRTC signaling, and communicate via real-time chat. The system is designed as an MVP prototype supporting small group meetings (2-4 participants per room) with focus on stability and simplicity.

## Glossary

- **User**: A registered participant who can create and join meeting rooms
- **Room**: A virtual meeting space identified by a unique UUID, supporting 2-4 participants
- **WebRTC**: Peer-to-peer real-time communication protocol for audio and video
- **Signaling**: The process of exchanging connection metadata (offers, answers, ICE candidates) between peers
- **Socket.IO**: Real-time bidirectional communication library for signaling and chat
- **JWT Token**: JSON Web Token used for stateless authentication
- **Room_Manager**: The system component responsible for room lifecycle management
- **Signaling_Engine**: The system component handling WebRTC peer connection setup
- **Chat_Service**: The system component managing real-time chat messages
- **Authentication_Service**: The system component handling user registration and login
- **Participant**: A user currently connected to a room

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to register with a username and email, so that I can access the platform.

#### Acceptance Criteria

1. WHEN a registration request is submitted with username, email, and password, THE Authentication_Service SHALL validate that the username is unique
2. WHEN a registration request is submitted with username, email, and password, THE Authentication_Service SHALL validate that the email is unique
3. WHEN a registration request is submitted with username, email, and password, THE Authentication_Service SHALL hash the password using bcryptjs
4. WHEN a registration request is submitted with valid data, THE Authentication_Service SHALL create a User record with id, username, email, hashed password, and createdAt timestamp
5. WHEN a registration request is submitted with valid data, THE Authentication_Service SHALL return a success response with the created User object (excluding password)
6. IF a username or email already exists, THEN THE Authentication_Service SHALL return an error response with status 409 Conflict
7. IF required fields are missing or invalid, THEN THE Authentication_Service SHALL return an error response with status 400 Bad Request

### Requirement 2: User Login

**User Story:** As a registered user, I want to log in with my credentials, so that I can access my account.

#### Acceptance Criteria

1. WHEN a login request is submitted with email and password, THE Authentication_Service SHALL retrieve the User record by email
2. WHEN a login request is submitted with email and password, THE Authentication_Service SHALL compare the provided password with the stored hashed password using bcryptjs
3. WHEN credentials are valid, THE Authentication_Service SHALL generate a JWT token containing the user ID and email
4. WHEN credentials are valid, THE Authentication_Service SHALL return a success response with the JWT token and User object (excluding password)
5. IF the email does not exist, THEN THE Authentication_Service SHALL return an error response with status 401 Unauthorized
6. IF the password is incorrect, THEN THE Authentication_Service SHALL return an error response with status 401 Unauthorized
7. IF required fields are missing, THEN THE Authentication_Service SHALL return an error response with status 400 Bad Request

### Requirement 3: Protected Routes

**User Story:** As the system, I want to protect authenticated endpoints, so that only logged-in users can access them.

#### Acceptance Criteria

1. WHEN a request is made to a protected route without a JWT token, THE Authentication_Middleware SHALL return an error response with status 401 Unauthorized
2. WHEN a request is made to a protected route with an invalid JWT token, THE Authentication_Middleware SHALL return an error response with status 401 Unauthorized
3. WHEN a request is made to a protected route with a valid JWT token, THE Authentication_Middleware SHALL extract the user ID from the token and attach it to the request object
4. WHEN a request is made to a protected route with a valid JWT token, THE Authentication_Middleware SHALL allow the request to proceed to the next handler

### Requirement 4: Create Meeting Room

**User Story:** As a logged-in user, I want to create a meeting room, so that I can host a seminar or meeting.

#### Acceptance Criteria

1. WHEN an authenticated user requests to create a room, THE Room_Manager SHALL generate a unique UUID for the room ID
2. WHEN an authenticated user requests to create a room, THE Room_Manager SHALL create a Room record with id, roomId, createdBy (user ID), and createdAt timestamp
3. WHEN an authenticated user requests to create a room, THE Room_Manager SHALL return a success response with the created Room object including the roomId
4. IF the user is not authenticated, THEN THE Room_Manager SHALL return an error response with status 401 Unauthorized

### Requirement 5: Join Meeting Room

**User Story:** As a logged-in user, I want to join a meeting room using a room ID, so that I can participate in a seminar.

#### Acceptance Criteria

1. WHEN an authenticated user requests to join a room with a valid roomId, THE Room_Manager SHALL verify that the room exists
2. WHEN an authenticated user requests to join a room with a valid roomId, THE Room_Manager SHALL verify that the room has fewer than 4 participants
3. WHEN an authenticated user requests to join a room with a valid roomId, THE Room_Manager SHALL add the user to the room's participant list
4. WHEN an authenticated user successfully joins a room, THE Room_Manager SHALL return a success response with the room details and current participant list
5. IF the roomId does not exist, THEN THE Room_Manager SHALL return an error response with status 404 Not Found
6. IF the room is at maximum capacity (4 participants), THEN THE Room_Manager SHALL return an error response with status 403 Forbidden
7. IF the user is not authenticated, THEN THE Room_Manager SHALL return an error response with status 401 Unauthorized

### Requirement 6: Leave Meeting Room

**User Story:** As a participant in a meeting room, I want to leave the room, so that I can end my participation.

#### Acceptance Criteria

1. WHEN a participant requests to leave a room, THE Room_Manager SHALL remove the user from the room's participant list
2. WHEN a participant requests to leave a room, THE Room_Manager SHALL return a success response
3. WHEN a participant leaves a room, THE Signaling_Engine SHALL broadcast a user-disconnected event to all remaining participants in the room
4. IF the user is not in the room, THEN THE Room_Manager SHALL return an error response with status 400 Bad Request

### Requirement 7: WebRTC Signaling - Join Room Event

**User Story:** As a participant, I want to signal my presence when joining a room, so that other peers can initiate connections.

#### Acceptance Criteria

1. WHEN a user connects to a room via Socket.IO, THE Signaling_Engine SHALL emit a join-room event to the user
2. WHEN a user emits a join-room event, THE Signaling_Engine SHALL broadcast a user-connected event to all other participants in the room with the joining user's ID
3. WHEN a user emits a join-room event, THE Signaling_Engine SHALL send the list of existing participants to the joining user

### Requirement 8: WebRTC Signaling - Offer and Answer Exchange

**User Story:** As a peer, I want to exchange WebRTC offers and answers, so that I can establish peer connections.

#### Acceptance Criteria

1. WHEN a peer emits an offer event with an SDP offer, THE Signaling_Engine SHALL forward the offer to the target peer
2. WHEN a peer receives an offer, THE peer SHALL emit an answer event with an SDP answer
3. WHEN a peer emits an answer event with an SDP answer, THE Signaling_Engine SHALL forward the answer to the target peer
4. IF the target peer is not in the room, THEN THE Signaling_Engine SHALL return an error response

### Requirement 9: WebRTC Signaling - ICE Candidate Exchange

**User Story:** As a peer, I want to exchange ICE candidates, so that I can establish optimal network paths.

#### Acceptance Criteria

1. WHEN a peer emits an ice-candidate event with a candidate, THE Signaling_Engine SHALL forward the candidate to the target peer
2. WHEN a peer receives an ice-candidate, THE peer SHALL add the candidate to its peer connection
3. IF the target peer is not in the room, THEN THE Signaling_Engine SHALL discard the candidate silently

### Requirement 10: WebRTC Signaling - User Disconnection

**User Story:** As the system, I want to notify peers when a participant disconnects, so that they can clean up connections.

#### Acceptance Criteria

1. WHEN a participant disconnects from Socket.IO, THE Signaling_Engine SHALL broadcast a user-disconnected event to all remaining participants in the room with the disconnected user's ID
2. WHEN a participant emits a leave-room event, THE Signaling_Engine SHALL broadcast a user-disconnected event to all remaining participants in the room with the leaving user's ID
3. WHEN a user-disconnected event is received, THE peer SHALL close the peer connection with the disconnected user

### Requirement 11: Real-Time Chat - Send Message

**User Story:** As a participant, I want to send a message to the room, so that I can communicate with other participants.

#### Acceptance Criteria

1. WHEN a participant emits a send-message event with a message text, THE Chat_Service SHALL validate that the message is not empty
2. WHEN a participant emits a send-message event with valid message text, THE Chat_Service SHALL create a message object with sender (user ID), message text, and timestamp
3. WHEN a participant emits a send-message event with valid message text, THE Chat_Service SHALL broadcast a receive-message event to all participants in the room (including the sender) with the message object
4. IF the message is empty or missing, THEN THE Chat_Service SHALL return an error response with status 400 Bad Request

### Requirement 12: Real-Time Chat - Message Storage (Optional)

**User Story:** As an administrator, I want to store chat messages, so that I can audit room conversations.

#### Acceptance Criteria

1. WHEN a message is sent in a room, THE Chat_Service MAY store the message in a Message record with id, roomId, sender (user ID), message text, and createdAt timestamp
2. WHERE message storage is enabled, THE Chat_Service SHALL store each message before broadcasting it

### Requirement 13: Meeting Controls - Audio Toggle

**User Story:** As a participant, I want to mute and unmute my audio, so that I can control my microphone.

#### Acceptance Criteria

1. WHEN a participant emits a toggle-audio event with a boolean state, THE Meeting_Controls_Service SHALL broadcast a toggle-audio event to all other participants in the room with the participant's ID and new audio state
2. WHEN a participant receives a toggle-audio event, THE participant's local UI SHALL update to reflect the audio state of the remote peer

### Requirement 14: Meeting Controls - Video Toggle

**User Story:** As a participant, I want to turn my camera on and off, so that I can control my video stream.

#### Acceptance Criteria

1. WHEN a participant emits a toggle-video event with a boolean state, THE Meeting_Controls_Service SHALL broadcast a toggle-video event to all other participants in the room with the participant's ID and new video state
2. WHEN a participant receives a toggle-video event, THE participant's local UI SHALL update to reflect the video state of the remote peer

### Requirement 15: Error Handling

**User Story:** As the system, I want to handle errors gracefully, so that clients receive clear error messages.

#### Acceptance Criteria

1. WHEN an error occurs in any service, THE Error_Handler SHALL catch the error and return a standardized error response with status code and message
2. WHEN an error occurs, THE Error_Handler SHALL log the error for debugging purposes
3. THE standardized error response format SHALL be { success: false, message: "error description" }
4. THE standardized success response format SHALL be { success: true, data: {} }

### Requirement 16: Database Schema

**User Story:** As the system, I want to persist user and room data, so that information is retained across sessions.

#### Acceptance Criteria

1. THE User table SHALL contain columns: id (primary key), username (unique), email (unique), password (hashed), createdAt
2. THE Room table SHALL contain columns: id (primary key), roomId (unique UUID), createdBy (foreign key to User), createdAt
3. WHERE message storage is enabled, THE Message table SHALL contain columns: id (primary key), roomId (foreign key to Room), sender (foreign key to User), message (text), createdAt

