import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import models from '../database/index.js';

const { Message, User, Room } = models;

// Store active users and their socket IDs
const activeUsers = new Map();
// Store room participants
const roomParticipants = new Map();
// Store waiting users: roomId -> Map(socketId -> userInfo)
const waitingUsers = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Helper to join actual room
    const proceedToJoinRoom = (roomId, username, userId, isHost) => {
      socket.join(roomId);
      
      activeUsers.set(socket.id, { userId, username, roomId, isHost });
      
      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Map());
      }
      roomParticipants.get(roomId).set(userId, {
        userId,
        username,
        socketId: socket.id,
        audioEnabled: true,
        videoEnabled: true,
        isHost
      });

      // Notify the user they joined successfully
      socket.emit('room-joined', { isHost, roomId });

      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        username,
        audioEnabled: true,
        videoEnabled: true
      });

      // Send current participants to the new user
      const participants = Array.from(roomParticipants.get(roomId).values()).filter(
        (p) => p.userId !== userId
      );
      socket.emit('participants-list', participants);

      console.log(`User ${username} (${userId}) joined room ${roomId}. Host: ${isHost}`);
    };

    // User attempts to join a room
    socket.on('join-room', async ({ roomId, username, token }) => {
      try {
        let dbUserId = null;
        if (token) {
          try {
            const decoded = jwt.verify(token, config.jwt.secret);
            dbUserId = decoded.userId;
          } catch (e) {
            console.log('Invalid token provided for join-room');
          }
        }

        const room = await Room.findOne({ where: { roomId } });
        if (!room) {
          socket.emit('room-not-found', { roomId });
          console.log(`Join rejected: room not found ${roomId} for socket ${socket.id}`);
          return;
        }
        const userId = dbUserId || socket.id;
        const isHost = Boolean(room && dbUserId && room.createdBy === dbUserId);

        if (isHost) {
          // Join immediately
          proceedToJoinRoom(roomId, username, userId, true);
          
          // Send list of waiting users to the host
          if (waitingUsers.has(roomId)) {
            const waiting = Array.from(waitingUsers.get(roomId).values());
            if (waiting.length > 0) {
              socket.emit('waiting-users-list', waiting);
            }
          }
        } else {
          // Put in waiting room
          socket.emit('waiting-for-host');
          
          if (!waitingUsers.has(roomId)) {
            waitingUsers.set(roomId, new Map());
          }
          const waitingUserInfo = { username, socketId: socket.id, userId };
          waitingUsers.get(roomId).set(socket.id, waitingUserInfo);
          
          // Notify any hosts currently in the room
          if (roomParticipants.has(roomId)) {
            const participants = Array.from(roomParticipants.get(roomId).values());
            const hosts = participants.filter(p => p.isHost);
            hosts.forEach(host => {
              io.to(host.socketId).emit('user-waiting', waitingUserInfo);
            });
          }
          
          console.log(`User ${username} (${userId}) is waiting for host in room ${roomId}`);
        }
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Host admits a user
    socket.on('admit-user', ({ roomId, targetSocketId }) => {
      const user = activeUsers.get(socket.id);
      if (!user || !user.isHost) return;

      if (waitingUsers.has(roomId)) {
        const waitingUser = waitingUsers.get(roomId).get(targetSocketId);
        if (waitingUser) {
          waitingUsers.get(roomId).delete(targetSocketId);
          
          // Find the socket object of the waiting user
          const targetSocket = io.sockets.sockets.get(targetSocketId);
          if (targetSocket) {
            // We need to execute the join logic in the context of the target socket
            // Because proceedToJoinRoom uses `socket` closure, we have to replicate it
            // or we can emit a success event to the target socket, and target socket responds with 'proceed-join'
            
            targetSocket.join(roomId);
            activeUsers.set(targetSocket.id, { 
              userId: waitingUser.userId, 
              username: waitingUser.username, 
              roomId, 
              isHost: false 
            });
            
            if (!roomParticipants.has(roomId)) {
              roomParticipants.set(roomId, new Map());
            }
            roomParticipants.get(roomId).set(waitingUser.userId, {
              userId: waitingUser.userId,
              username: waitingUser.username,
              socketId: targetSocket.id,
              audioEnabled: true,
              videoEnabled: true,
              isHost: false
            });

            targetSocket.emit('room-joined', { isHost: false, roomId });
            
            targetSocket.to(roomId).emit('user-joined', {
              socketId: targetSocket.id,
              username: waitingUser.username,
              audioEnabled: true,
              videoEnabled: true
            });

            const participants = Array.from(roomParticipants.get(roomId).values()).filter(
              (p) => p.userId !== waitingUser.userId
            );
            targetSocket.emit('participants-list', participants);
            
            console.log(`User ${waitingUser.username} was admitted to room ${roomId}`);
          }
        }
      }
    });

    // Host denies a user
    socket.on('deny-user', ({ roomId, targetSocketId }) => {
      const user = activeUsers.get(socket.id);
      if (!user || !user.isHost) return;

      if (waitingUsers.has(roomId)) {
        waitingUsers.get(roomId).delete(targetSocketId);
        io.to(targetSocketId).emit('join-denied');
        console.log(`Socket ${targetSocketId} was denied entry to room ${roomId}`);
      }
    });

    // User leaves a room
    socket.on('leave-room', ({ roomId }) => {
      try {
        socket.leave(roomId);
        
        const user = activeUsers.get(socket.id);
        const userId = user ? user.userId : socket.id;
        
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
        const msgData = {
          message: message.trim(),
          username: username || 'Guest',
          timestamp: timestamp || new Date().toISOString(),
          socketId: socket.id
        };

        // Broadcast immediately to everyone in the room (including sender)
        io.to(roomId).emit('chat-message', msgData);
        console.log(`Chat message broadcast in room ${roomId} by ${username}`);

        // Try to save to database as well
        try {
          const room = await Room.findOne({ where: { roomId } });
          if (room) {
            const user = await User.findOne({ where: { username } });
            await Message.create({
              roomId: room.id,
              sender: user?.id || null,
              message: message.trim()
            });
            console.log(`Message saved to database for room ${roomId}`);
          }
        } catch (dbError) {
          console.warn('Could not save message to database:', dbError.message);
        }
      } catch (error) {
        console.error('Error in chat-message handler:', error);
      }
    });

    // Meeting controls: Toggle audio
    socket.on('toggle-audio', ({ roomId, enabled }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;
      
      const userId = user.userId;
      if (roomParticipants.has(roomId)) {
        const participant = roomParticipants.get(roomId).get(userId);
        if (participant) {
          participant.audioEnabled = enabled;
          socket.to(roomId).emit('user-audio-toggled', { socketId: socket.id, enabled });
        }
      }
    });

    // Meeting controls: Toggle video
    socket.on('toggle-video', ({ roomId, enabled }) => {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const userId = user.userId;
      if (roomParticipants.has(roomId)) {
        const participant = roomParticipants.get(roomId).get(userId);
        if (participant) {
          participant.videoEnabled = enabled;
          socket.to(roomId).emit('user-video-toggled', { socketId: socket.id, enabled });
        }
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // Remove from waiting rooms
      for (const [roomId, users] of waitingUsers.entries()) {
        if (users.has(socket.id)) {
          users.delete(socket.id);
        }
      }

      const user = activeUsers.get(socket.id);
      if (user) {
        const { userId, username, roomId } = user;
        
        if (roomParticipants.has(roomId)) {
          roomParticipants.get(roomId).delete(userId);
          socket.to(roomId).emit('user-left', { userId, socketId: socket.id });
        }

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
