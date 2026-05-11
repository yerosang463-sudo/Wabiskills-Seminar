-- TiDB Database Schema for WabiSeminar
-- Run this script to create the database tables

-- Users table
CREATE TABLE IF NOT EXISTS Users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  googleId VARCHAR(100) UNIQUE,
  avatar VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_googleId (googleId)
);

-- Rooms table
CREATE TABLE IF NOT EXISTS Rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roomId VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100),
  createdBy CHAR(36) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  maxParticipants INT DEFAULT 50,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_roomId (roomId),
  INDEX idx_createdBy (createdBy),
  INDEX idx_isActive (isActive)
);

-- Messages table
CREATE TABLE IF NOT EXISTS Messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roomId VARCHAR(50) NOT NULL,
  sender CHAR(36) NOT NULL,
  message TEXT NOT NULL,
  messageType ENUM('text', 'system', 'file') DEFAULT 'text',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (roomId) REFERENCES Rooms(roomId) ON DELETE CASCADE,
  FOREIGN KEY (sender) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_roomId (roomId),
  INDEX idx_sender (sender),
  INDEX idx_createdAt (createdAt)
);


-- Sample data insertion has been removed for security
