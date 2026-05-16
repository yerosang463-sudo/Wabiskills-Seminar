import dotenv from 'dotenv';

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL || 'sqlite://./database.sqlite',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiry: process.env.JWT_EXPIRY || '24h',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: '/api/auth/google/callback',
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:3000'] : 'http://localhost:3000')
      : true,
  },
};

export default config;
