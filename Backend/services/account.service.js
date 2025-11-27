import db from "../utils/db.js"

export async function add(user){
    return db('USER').insert(user);
}

export async function findAllEmail(){
    const rows = await db('USER').select('email');
    return rows.map(row => row.email);
}

export async function getPasswordByUsername(username) {
    const pass = await db('USER')
                    .select('password')
                    .where('username',username);
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
            .update({email: data.new_name});
            

    } catch (err) {
        console.error('Cannot update full name', err);
        throw err;
    }
}

export async function updatePassword(data) {
    try {
        await db('USER')
            .where({id: data.user_id})
            .update({password: data.new_password    });
            

    } catch (err) {
        console.error('Cannot update password', err);
        throw err;
    }
}

// services/otp.service.js
import nodemailer from "nodemailer";

const otpStore = {}; // { userId: { otp, expiresAt } }

export async function sendOtp(userId, otp, userEmail) {
    otpStore[userId] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    console.log(`OTP for user ${userId}: ${otp}`);
    console.log(`Send OTP to email: ${userEmail}`);

    // --- EMAIL SENDER ---
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
        from: `"Your Website" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
        html: `<h3>Your OTP code is: <b>${otp}</b></h3>
            <p>This code expires in 5 minutes.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("OTP email sent successfully!");
    } catch (err) {
        console.error("Failed to send OTP email:", err);
    }
}

export function verifyOtp(userId, otp) {
    const record = otpStore[userId];

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
    delete otpStore[userId];

    return { success: true, message: "OTP verified" };
}

