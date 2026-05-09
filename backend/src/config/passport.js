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
      callbackURL: config.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const username = profile.displayName || email.split('@')[0];

        let user = await User.findOne({ where: { email } });

        if (user) {
          return done(null, user);
        }

        user = await User.create({
          username,
          email,
          password: Math.random().toString(36).slice(-8), // Random password for OAuth users
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

export default passport;
