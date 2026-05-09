-- TiDB Database Schema for WabiSeminar
-- Run this script to create the database tables

-- Users table
CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
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
  createdBy INT NOT NULL,
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
  sender INT NOT NULL,
  message TEXT NOT NULL,
  messageType ENUM('text', 'system', 'file') DEFAULT 'text',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_roomId (roomId),
  INDEX idx_sender (sender),
  INDEX idx_timestamp (timestamp)
);

-- Insert sample data (optional)
-- INSERT IGNORE INTO Users (username, email, password) VALUES 
-- ('admin', 'admin@wabiseminar.com', '$2b$10$example_hash'),
-- ('testuser', 'test@example.com', '$2b$10$example_hash');

-- INSERT IGNORE INTO Rooms (roomId, title, createdBy) VALUES 
-- ('test-room-123', 'Test Meeting Room', 1),
-- ('demo-room-456', 'Demo Room', 1);
