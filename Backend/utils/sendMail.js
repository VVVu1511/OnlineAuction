// utils/sendMail.js
import nodemailer from 'nodemailer';
import dotenv from "dotenv";


dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: process.env.MAIL_PORT || 587,
    secure: false, // TLS = false (587)
    auth: {
        user: process.env.EMAIL_USER,     // Email gửi
        pass: process.env.EMAIL_PASS      // App password (Gmail)
    }
});

/**
 * Gửi email
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} html - Nội dung HTML
 */
export default async function sendMail(to, subject, html) {
    try {
        const info = await transporter.sendMail({
            from: `"Auction System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log("Email sent:", info.messageId);
        return true;
    } catch (err) {
        console.error("Email sending failed:", err);
        return false;
    }
}
