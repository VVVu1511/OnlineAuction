import express from 'express';
import { createClient } from '@supabase/supabase-js';
import accountRouter from '../Backend/routes/account.route.js';
import productRouter from '../Backend/routes/product.route.js';
import categoryRouter from '../Backend/routes/category.route.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from "express-session";
import passport from "./config/passport.js";
import dotenv from 'dotenv';

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

// // ---------- GOOGLE LOGIN ----------
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google',{ failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/");
    }
);

// ---------- FACEBOOK LOGIN ----------
app.get('/auth/facebook',
    passport.authenticate('facebook')
);

app.get('/auth/facebook/callback',
    passport.authenticate('facebook'),
    (req, res) => {
        res.redirect("/");
    }
);

app.listen(PORT, function () {
    console.log(`Server is running on http://localhost:${PORT}`);
});