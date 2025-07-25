import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import bcrypt from "bcrypt";
import { storage } from "./storage";

// Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy - Support both email and username login
passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (emailOrUsername, password, done) => {
    try {
      let user;
      
      // Try to find user by email first, then by username
      if (emailOrUsername.includes('@')) {
        user = storage.getUserByEmail ? await storage.getUserByEmail(emailOrUsername) : null;
        if (!user) {
          // Try username as fallback (extract from email)
          const usernameFromEmail = emailOrUsername.split('@')[0];
          user = await storage.getUserByUsername(usernameFromEmail);
        }
      } else {
        user = await storage.getUserByUsername(emailOrUsername);
      }

      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const fullName = profile.displayName;
      
      if (!email || !fullName) {
        return done(new Error('Missing profile information from Google'));
      }

      if (storage.createOrUpdateOAuthUser) {
        const user = await storage.createOrUpdateOAuthUser({
          email,
          fullName,
          username: email.split('@')[0] + '_google',
          provider: 'google'
        });
        
        return done(null, user);
      }
      
      return done(new Error('OAuth not supported'));
    } catch (error) {
      return done(error);
    }
  }));
}

// LinkedIn OAuth Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_liteprofile']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const fullName = `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
      
      if (!email || !fullName) {
        return done(new Error('Missing profile information from LinkedIn'));
      }

      if (storage.createOrUpdateOAuthUser) {
        const user = await storage.createOrUpdateOAuthUser({
          email,
          fullName,
          username: email.split('@')[0] + '_linkedin',
          provider: 'linkedin'
        });
        
        return done(null, user);
      }
      
      return done(new Error('OAuth not supported'));
    } catch (error) {
      return done(error);
    }
  }));
}

export default passport;