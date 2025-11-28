import bcrypt from "bcryptjs";
import db from "../utils/db.js"
import dotenv from "dotenv";

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
            .where({id: data.user_id})
            .update({email: data.new_email});
            

    } catch (err) {
        console.error('Cannot update email', err);
        throw err;
    }
}

export async function updateFullName(data) {
    try {
        await db('USER')
            .where({id: data.user_id})
            .update({full_name: data.new_name});
            

    } catch (err) {
        console.error('Cannot update full name', err);
        throw err;
    }
}

export async function updatePassword(data) {
    try {
        const hashed = bcrypt.hashSync(data.new_password, 10);

        await db('USER')
            .where({id: data.user_id})
            .update({password: hashed});
            

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
