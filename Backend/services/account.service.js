import bcrypt from "bcryptjs";
import db from "../utils/db.js"
import dotenv from "dotenv";
import authMiddleware from "../middleware/auth.js"; // adjust path

dotenv.config();

export async function add(user){
    return db('USER').insert(user);
}

export async function findAllEmail(){
    const rows = await db('USER').select('email');
    return rows.map(row => row.email);
}

export async function getAllByEmail(email) {
    const row = await db("USER").select("*").where("email", email).first();
    
    return row;
}

export async function updateEmail(data) {
    try {
        await db('USER')
            .where({ id: data.user_id })
            .update({ email: data.email });   // <── sửa
    } catch (err) {
        console.error('Cannot update email', err);
        throw err;
    }
}

export async function updateFullName(data) {
    try {
        await db('USER')
            .where({ id: data.user_id })
            .update({ full_name: data.full_name });   // <── sửa
    } catch (err) {
        console.error('Cannot update full name', err);
        throw err;
    }
}

export async function updatePassword(data) {
    try {
        const hashed = bcrypt.hashSync(data.new_password, 10);

        await db('USER')
            .where({ id: data.user_id })
            .update({ password: hashed });    
    } catch (err) {
        console.error('Cannot update password', err);
        throw err;
    }
}

// services/otp.service.js
import nodemailer from "nodemailer";

const otpStore = {}; // { email: { otp, expiresAt } }

export async function sendOtp(userEmail, otp) {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error("EMAIL_USER or EMAIL_PASS not defined in .env");
        }

        // Store OTP in memory with expiration
        otpStore[userEmail] = {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        };

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Your Website" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}`,
            html: `<h3>Your OTP code is: <b>${otp}</b></h3><p>This code expires in 5 minutes.</p>`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${userEmail}: ${otp}`);
        console.log("Message ID:", info.messageId);

    } catch (err) {
        console.error("Failed to send OTP:", err.response || err);
        throw err;
    }
}

export function verifyOtp(email, otp) {
    const record = otpStore[email];

    if (!record) {
        return { success: false, message: "OTP not found" };
    }

    if (Date.now() > record.expiresAt) {
        return { success: false, message: "OTP expired" };
    }
    if (record.otp !== otp) {
        return { success: false, message: "Wrong OTP" };
    }

    // OTP valid → remove it
    delete otpStore[email];

    return { success: true, message: "OTP verified" };
}

export async function getRating(userId) {
    try {
        const ratings = await db('RATING')
            .where('rated_id', userId)
            .select('*');
        return ratings;
        
    } catch (err) {
        console.error("Failed to get rating", err);
        throw err;
    }
}

export async function getWinProducts(userId) {
    try {
        const win = await db('PRODUCT')
            .where('winner', userId)
            .select('*');
        
        return win;
        
    } catch (err) {
        console.error("Failed to get win products", err);
        throw err;
    }
}

export async function getWatchList(user_id) {
    try {
        const list = await db('WATCHLIST')
            .join('PRODUCT', 'WATCHLIST.product_id', 'PRODUCT.id')
            .select('PRODUCT.*')
            .where('WATCHLIST.user_id', user_id);

        return list;

    } catch (err) {
        console.error('Cannot get watch list', err);
        throw err;
    }
}

export async function addWatchList(user_id, product_id) {
    try {
        await db('WATCHLIST')
            .insert({user_id: user_id, product_id: product_id});

    } catch (err) {
        console.error('Cannot add watch list', err);
        throw err;
    }
}

export async function delWatchList(user_id, product_id) {
    try {
        await db('WATCHLIST')
            .where({user_id: user_id, product_id: product_id})
            .delete();

    } catch (err) {
        console.error('Cannot delete 1 row watch list', err);
        throw err;
    }
}

export async function requestSell(user_id) {
    try {
        // Cập nhật cột request_sell = true
        await db('USER')
        .where({ id: user_id })
        .update({
            request_sell: true,
            request_expire: db.raw(`CURRENT_TIMESTAMP + interval '7 days'`)
  });

    } catch (err) {
        console.error('Error requesting sell', err);
        throw err;
    }
}




