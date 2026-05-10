import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './config.js';
import models from '../database/index.js';

const { User } = models;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl ? config.google.callbackUrl : '/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const username = profile.displayName || email.split('@')[0];
        const googleId = profile.id;

        let user = await User.findOne({ where: { email } });
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        if (user) {
          // Sync username and googleId for existing users
          const updates = {};
          if (!user.googleId) updates.googleId = googleId;
          if (avatar && user.avatar !== avatar) updates.avatar = avatar;
          
          // Always update username to Google name if it's different or if it was previously 'admin'
          if (username && (user.username !== username || user.username.toLowerCase() === 'admin')) {
            updates.username = username;
          }

          if (Object.keys(updates).length > 0) {
            await user.update(updates);
          }
          return done(null, user);
        }

        user = await User.create({
          username,
          email,
          googleId,
          avatar,
          password: Math.random().toString(36).slice(-8), // Random password for OAuth users
        });

        console.log(`Google OAuth user created: ${username} (${email}) with Google ID: ${googleId}`);
        done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);

export default passport;
