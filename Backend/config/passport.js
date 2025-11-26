import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import dotenv from "dotenv";

dotenv.config();

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// ---------------- GOOGLE LOGIN ----------------
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
        console.log("Google profile:", profile);
        return done(null, profile);
    }
));

// ---------------- FACEBOOK LOGIN ----------------
// passport.use(new FacebookStrategy(
//     {
//         clientID: process.env.FB_APP_ID,
//         clientSecret: process.env.FB_SECRET,
//         callbackURL: "http://localhost:3000/auth/facebook/callback",
//         profileFields: ["id", "displayName", "photos", "email"],
//     },
//     (accessToken, refreshToken, profile, done) => {
//         console.log("Facebook profile:", profile);
//         return done(null, profile);
//     }
// ));

export default passport;
