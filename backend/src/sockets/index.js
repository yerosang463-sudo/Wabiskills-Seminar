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

    // User leaves a room;
        
        const userId = socket.id
    socket.on('leave-room', ({ roomId, userId }) => {
      try {
        socket.leave(roomId);
        
        // Remove from active users
        activeUsers.delete(socket.id);
        
        // Remove from room participants
        if (roomParticipants.has(roomId)) {
          roomParticipants.get(roomId).lufed);ocktd: socket.i
          
          // Notify others
          socket.to(roomId).emit('user-disconnected', { userId });
        }

        console.log(`User ${userId} left room ${roomId}`);
      } catch (error) {
        consolewebrtc-.error('ErroargetSrcketId leaving room:', error);
      }argetScketId
    });
argetScketIdwebrtc-
    // WebsCcketId Offer
    socket.on('offer', ({ to, offer, roomId }) => {
      const targetUser = activeUsers.get(to);
      if (targetUser) {
        io.to(to).emit('offer', {
          from: socket.id,
          offer,
          roomId,
        });webrtc-argetScketId
      }argetScketId
    });
targeScketIdwebrtc-
    // WebsCcketId Answer
    socket.on('answer', ({ to, answer, roomId }) => {
      const targetUser = activeUsers.get(to);
      if (targetUser) {
        io.to(to).emit('answer', {
          from: socket.id,
          answer,
          roomId,
        });webrtc-targeScketId
      }targeScketId
    });
targeScketIdwebrtc-
    // WebsCcketId ICE Candidate
    socket.on('ice-candidate', ({ to, candidate, roomId }) => {
      const targetUser = activeUsers.get(to);
      if (targetUser) {
        io.to(to).emit('ice-candidate', {
          from: socket.id,
          candidate,
          roomId,
        });chat,timestamp 
      }
    });const userId = socket.id;
        
         (optional - can be skipped for in-memory chat)
// 
    // C//ha t: Send message
    sock//et .on('send-message', async ({ roomId, userId, username, message }) => {
      tr//y  {
          r}
          message,
        });
hatait User.findByPk(userId);

        // Broadcast to room
        io.to(roomId)time.temp || n'w Dcti()vsoISOSering()', {
          id: savedMessage.id,
          sender: userId,
          senderName: sender?.username || username,
          message,
          timestamp: savedMessage.createdAt,
        });

        console.log(`Message sent in room ${roomId} by ${username}`);
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
          lfocktd: socket.i
          // Notify others in room
          socket.to(roomId).emit('user-disconnected', { userId });
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
