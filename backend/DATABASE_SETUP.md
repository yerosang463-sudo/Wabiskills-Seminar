# TiDB Database Setup for WabiSeminar

This guide explains how to set up the TiDB database for the WabiSeminar video conferencing platform.

## Prerequisites

- TiDB database connection (already configured in `.env`)
- Node.js and npm installed
- Database credentials with CREATE TABLE permissions

## Database Configuration

The database connection is configured in your `.env` file:

```env
DATABASE_URL=mysql://4Qe8CQZuyB1e2jm.root:KI5AsN7Edys2nXJx@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/seminar
```

## Setup Methods

### Method 1: Using npm scripts (Recommended)

1. **Initialize database and create tables:**
   ```bash
   npm run db:init
   ```

2. **Create tables only:**
   ```bash
   npm run db:create-tables
   ```

3. **Reset database (drops and recreates all tables):**
   ```bash
   npm run db:reset
   ```

### Method 2: Manual SQL Execution

1. **Connect to your TiDB instance** using your preferred MySQL client
2. **Run the SQL script:**
   ```bash
   mysql -h gateway01.us-west-2.prod.aws.tidbcloud.com -P 4000 -u 4Qe8CQZuyB1e2jm.root -p seminar < scripts/create-tables.sql
   ```

### Method 3: Using TiDB Cloud Console

1. **Log in to TiDB Cloud**
2. **Navigate to your cluster**
3. **Open the SQL Editor**
4. **Copy and paste the contents of** `scripts/create-tables.sql`
5. **Execute the script**

## Database Schema

The database creates three main tables:

### Users Table
- Stores user authentication and profile information
- Supports both email/password and Google OAuth login
- Fields: id, username, email, password, googleId, avatar, timestamps

### Rooms Table
- Stores meeting room information
- Links to the user who created the room
- Fields: id, roomId (unique identifier), title, createdBy, isActive, maxParticipants, timestamps

### Messages Table
- Stores chat messages for each room
- Links messages to users and rooms
- Fields: id, roomId, sender, message, messageType, timestamp

## Verification

After setup, you can verify the tables were created:

1. **Run the database init script** (it will show table names)
2. **Check your TiDB Cloud Console** to see the tables
3. **Run this SQL query:**
   ```sql
   SHOW TABLES;
   ```

## Troubleshooting

### Connection Issues
- Verify your DATABASE_URL is correct
- Check network connectivity to TiDB Cloud
- Ensure your user has the necessary permissions

### Permission Errors
- Make sure your database user has CREATE, INSERT, SELECT, UPDATE, DELETE permissions
- For TiDB Cloud, ensure your IP is whitelisted

### Table Already Exists
- Use `npm run db:reset` to drop and recreate tables
- Or manually drop tables: `DROP TABLE IF EXISTS Messages, Rooms, Users;`

## Next Steps

After setting up the database:

1. **Start the backend server:**
   ```bash
   npm run dev
   ```

2. **Test the API endpoints**
3. **Verify user registration and room creation work**

## Support

If you encounter issues:

1. Check the TiDB Cloud documentation
2. Verify your environment variables
3. Review the database connection logs in the console
