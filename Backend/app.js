import express from 'express';
import { createClient } from '@supabase/supabase-js';
import accountRouter from '../Backend/routes/account.route.js';
import productRouter from '../Backend/routes/product.route.js';
import categoryRouter from '../Backend/routes/category.route.js';
import biddingRouter from '../Backend/routes/bidding.route.js';
import contactRouter from '../Backend/routes/contact.route.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from "express-session";
import passport from "./config/passport.js";
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Passport session middleware
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/account', accountRouter);
app.use('/product', productRouter);
app.use('/category', categoryRouter);
app.use('/bidding', biddingRouter);
app.use('/contact',contactRouter);

// ---------- GOOGLE LOGIN ----------
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const user = req.user;

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Send token to main window using postMessage
        res.send(`
            <html>
            <body>
                <script>
                    window.opener.postMessage(
                        { token: "${token}", user: ${JSON.stringify(user)} },
                        "http://localhost:5173" // your React app URL
                    );
                    window.close();
                </script>
            </body>
            </html>
        `);
    }
);

// ---------- FACEBOOK LOGIN ----------
app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: [] })
);

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => {
        const user = req.user;

        // đảm bảo email tồn tại
        const userData = {
            id: user.id,
            email: user.emails && user.emails[0] ? user.emails[0].value : null,
            name: user.displayName || "",
            role: user.role || 2, // default role nếu chưa có
            photo: user.photos && user.photos[0] ? user.photos[0].value : null
        };

        const token = jwt.sign(
            { id: userData.id, email: userData.email, role: userData.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.send(`
            <html>
            <body>
                <script>
                    window.opener.postMessage(
                        { token: "${token}", user: ${JSON.stringify(userData)} },
                        "http://localhost:5173"
                    );
                    window.close();
                </script>
            </body>
            </html>
        `);
    }
);

app.listen(PORT, function () {
    console.log(`Server is running on http://localhost:${PORT}`);
});