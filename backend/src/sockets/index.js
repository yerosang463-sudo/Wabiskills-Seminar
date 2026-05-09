import models from '../database/index.js';

const { Message, User } = models;

// Store active users and their socket IDs
const activeUsers = new Map();
// Store room participants
const roomParticipants = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins a room
    socket.on('join-room', async ({ roomId, username }) => {
      try {
        socket.join(roomId);
        
        // Use socket.id as userId if not provided
        const userId = socket.id;
        
        // Store user info
        activeUsers.set(socket.id, { userId, username, roomId });
        
        // Add to room participants
        if (!roomParticipants.has(roomId)) {
          roomParticipants.set(roomId, new Map());
        }
        roomParticipants.get(roomId).set(userId, {
          userId,
          username,
          socketId: socket.id,
          audioEnabled: true,
          videoEnabled: true,
        });

        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          socketId: socket.id,
          username,
        });

        // Send current participants to the new user
        const participants = Array.from(roomParticipants.get(roomId).values()).filter(
          (p) => p.userId !== userId
        );
        socket.emit('participants-list', participants);

        console.log(`User ${username} (${userId}) joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // User leaves a room
    socket.on('leave-room', ({ roomId }) => {
      try {
        socket.leave(roomId);
        
        const userId = socket.id;
        const user = activeUsers.get(socket.id);
        
        // Remove from active users
        activeUsers.delete(socket.id);
        
        // Remove from room participants
        if (roomParticipants.has(roomId)) {
          roomParticipants.get(roomId).delete(userId);
          
          // Notify others
          socket.to(roomId).emit('user-left', { userId, socketId: socket.id });
        }

        console.log(`User ${userId} left room ${roomId}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // WebRTC Offer
    socket.on('webrtc-offer', ({ targetSocketId, offer, roomId }) => {
      const targetUser = activeUsers.get(targetSocketId);
      if (targetUser) {
        io.to(targetSocketId).emit('webrtc-offer', {
          socketId: socket.id,
          offer,
          roomId,
        });
      }
    });
    // WebRTC Answer
    socket.on('webrtc-answer', ({ targetSocketId, answer, roomId }) => {
      const targetUser = activeUsers.get(targetSocketId);
      if (targetUser) {
        io.to(targetSocketId).emit('webrtc-answer', {
          socketId: socket.id,
          answer,
          roomId,
        });
      }
    });
    // WebRTC ICE Candidate
    socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate, roomId }) => {
      const targetUser = activeUsers.get(targetSocketId);
      if (targetUser) {
        io.to(targetSocketId).emit('webrtc-ice-candidate', {
          socketId: socket.id,
          candidate,
          roomId,
        });
      }
    });

    // Chat: Send message
    socket.on('chat-message', async ({ roomId, message, username, timestamp }) => {
      try {
        // Find the room to get its database ID
        const { Room, User, Message } = models;
        const room = await Room.findOne({ where: { roomId } });
        
        if (!room) {
          console.log(`Room ${roomId} not found in database`);
          return;
        }

        // Find user by username
        const user = await User.findOne({ where: { username } });
        
        // Create message in database
        const dbMessage = await Message.create({
          roomId: room.id,
          sender: user?.id || null,
          message: message.trim()
        });

        const msgData = {
          id: dbMessage.id,
          message,
          username: username || 'Guest',
          timestamp: timestamp || new Date().toISOString(),
          socketId: socket.id
        };

        // Broadcast to room
        io.to(roomId).emit('chat-message', msgData);

        console.log(`Message saved and sent in room ${roomId} by ${username}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Meeting controls: Toggle audio
    socket.on('toggle-audio', ({ roomId, userId, enabled }) => {
      if (roomParticipants.has(roomId)) {
        const participant = roomParticipants.get(roomId).get(userId);
        if (participant) {
          participant.audioEnabled = enabled;
          
          // Notify others in room
          socket.to(roomId).emit('user-audio-toggled', {
            userId,
            enabled,
          });
        }
      }
    });

    // Meeting controls: Toggle video
    socket.on('toggle-video', ({ roomId, userId, enabled }) => {
      if (roomParticipants.has(roomId)) {
        const participant = roomParticipants.get(roomId).get(userId);
        if (participant) {
          participant.videoEnabled = enabled;
          
          // Notify others in room
          socket.to(roomId).emit('user-video-toggled', {
            userId,
            enabled,
          });
        }
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        const { userId, username, roomId } = user;
        
        // Remove from room participants
        if (roomParticipants.has(roomId)) {
          roomParticipants.get(roomId).delete(userId);
          
          // Notify others in room
          socket.to(roomId).emit('user-left', { userId, socketId: socket.id });
        }

        // Remove from active users
        activeUsers.delete(socket.id);

        console.log(`User ${username} (${userId}) disconnected`);
      }
    });
  });
};

export const getRoomParticipants = (roomId) => {
  if (roomParticipants.has(roomId)) {
    return Array.from(roomParticipants.get(roomId).values());
  }
  return [];
};
