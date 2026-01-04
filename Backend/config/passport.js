import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import dotenv from "dotenv";
import db from "../utils/db.js"

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
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            const fullName = profile.displayName;

            if (!email) return done(new Error("Google has no email"), null);

            // Check exist
            let user = await db("USER").where({ email }).first();

            // Create new
            if (!user) {
                const [newUser] = await db("USER")
                    .insert({
                        full_name: fullName,
                        email,
                        password: null,
                        address: null,
                        role: 3,
                    })
                    .returning("*");

                user = newUser;
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));


// ---------------- FACEBOOK LOGIN ----------------
passport.use(new FacebookStrategy(
{
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ["id", "displayName", "photos", "emails"], // emails là đúng, không email
},
async (accessToken, refreshToken, profile, done) => {
    try {
    const email = profile.emails?.[0]?.value || null; // fallback null
    const fullName = profile.displayName;

    // Tìm user theo email nếu có, nếu không có email thì dùng profile.id
    let user;
    if (email) {
        user = await db("USER").where({ email }).first();
    }

    // Nếu user chưa tồn tại → tạo mới
    if (!user) {
        const [newUser] = await db("USER")
        .insert({
            full_name: fullName,
            email: email,        // có thể null
            password: null,
            address: null,
            role: 3,
        })
        .returning("*");
        user = newUser;
    }

    return done(null, user);
    } catch (err) {
    return done(err, null);
    }
}
));



export default passport;
