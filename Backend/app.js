import express from 'express';
import accountRouter from '../Backend/routes/account.route.js';
import productRouter from '../Backend/routes/product.route.js';
import categoryRouter from '../Backend/routes/category.route.js';
import biddingRouter from '../Backend/routes/bidding.route.js';
import contactRouter from '../Backend/routes/contact.route.js';
import authRouter from '../Backend/routes/auth.route.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from "express-session";
import dotenv from 'dotenv';
import passport from "./config/passport.js";
import orderRouter from '../Backend/routes/order.route.js';
import { startAuctionCron } from "./cron/auction.cron.js"

dotenv.config();

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('trust proxy', 1);

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


// Passport session middleware
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",   // ⚠️ BẮT BUỘC
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/product', productRouter);
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/account', accountRouter);
app.use('/category', categoryRouter);
app.use('/bidding', biddingRouter);
app.use('/contact',contactRouter);
app.use('/auth', authRouter);
app.use('/order', orderRouter);

startAuctionCron();

app.listen(PORT, function () {
    console.log(`Server is running on http://localhost:${PORT}`);
});