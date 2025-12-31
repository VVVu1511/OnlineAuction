import bcrypt from "bcryptjs";
import db from "../utils/db.js"
import dotenv from "dotenv";
import authMiddleware from "../middleware/auth.js"; // adjust path

dotenv.config();

export async function add(user) {
    const [id] = await db('USER').insert(user).returning('id');
    return id;
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
    const affected = await db('USER')
        .where({ id: data.user_id })
        .update({ email: data.email });

    return affected; // số row update
}

//update address
export async function updateAddress(data) {
    const affected = await db('USER')
        .where({ id: data.user_id })
        .update({ address: data.address });

    return affected;
}


//update full name
export async function updateFullName(data) {
    const affected = await db('USER')
        .where({ id: data.user_id })
        .update({ full_name: data.full_name });

    return affected;
}


export async function updatePassword(data) {
    const hashed = bcrypt.hashSync(data.new_password, 10);

    const affected = await db('USER')
        .where({ id: data.user_id })
        .update({ password: hashed });

    return affected;
}


// services/otp.service.js
import nodemailer from "nodemailer";

const otpStore = {}; // { email: { otp, expiresAt } }

export async function sendOtp(userEmail, otp) {
    otpStore[userEmail] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000
    };

    await transporter.sendMail(mailOptions);

    return {
        success: true,
        message: "OTP sent successfully"
    };
}

export function verifyOtp(email, otp) {
    const record = otpStore[email];

    if (!record)
        return { success: false, message: "OTP not found" };

    if (Date.now() > record.expiresAt)
        return { success: false, message: "OTP expired" };

    if (record.otp !== otp)
        return { success: false, message: "Wrong OTP" };

    delete otpStore[email];
    return { success: true, message: "OTP verified" };
}


export async function getRating(userId) {
    return await db('RATING')
        .where('rated_id', userId)
        .select('*');
}


export async function getWinProducts(userId) {
    return await db('PRODUCT')
        .where('winner', userId)
        .select('*');
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
    const [id] = await db('WATCHLIST')
        .insert({ user_id, product_id })
        .returning('id');

    return id;
}


export async function delWatchList(user_id, product_id) {
    const deleted = await db('WATCHLIST')
        .where({ user_id, product_id })
        .del();

    return deleted;
}


export async function requestSell(user_id) {
    const affected = await db('USER')
        .where({ id: user_id })
        .update({
            request_sell: true,
            request_expire: db.raw(`CURRENT_TIMESTAMP + interval '7 days'`)
        });

    return {
        success: affected > 0,
        message: "Request sell submitted"
    };
}


export async function findAllById(id) {
    try {
        const user = await db("USER")
            .where("id", id)
            .first(); // lấy 1 dòng

        return user; // trả về object user hoặc undefined
    } catch (err) {
        console.error("findAllById error:", err);
        throw new Error("Error finding user by id");
    }
}

export async function getAllUsers() {
    try {
        const users = await db("USER")
            .select('*')

        return users; 
    } catch (err) {
        console.error("cannot get all users:", err);
    }
}

export async function delById(id) {
    const deleted = await db("USER")
        .where("id", id)
        .del();

    return {
        success: deleted > 0,
        deleted
    };
}

export async function confirmRequestSell(id, approve) {
    const updateData = approve
        ? { role: 2, request_sell: 0, request_expire: null }
        : { request_sell: 0, request_expire: null };

    const affected = await db("USER")
        .where("id", id)
        .update(updateData);

    return {
        success: affected > 0,
        approved: approve
    };
}


// getProfileById
export async function getProfileById(id) {
    try {
        const user = await db("USER")
            .select("id", "email", "full_name", "role", "created_at")
            .where("id", id)
            .first();
        return user;
    } catch (err) {
        console.error("getProfileById error:", err);
        throw new Error("Error getting profile by id");
    }
}

//get role description
export async function getRoleDescription(role) {
    try {
        const role_d = await db("ROLE")
            .select("description")
            .where("id", role)
            .first();

        return role_d;

    } catch (err) {
        console.error("role error:", err);
        throw new Error("Error role by id");
    }
}

//get password by user id
export async function getPasswordById(user_id) {
    try {
        const user = await db("USER")
            .select("password")
            .where("id", user_id)
            .first();

        return user ? user.password : null;
    } catch (err) {
        console.error("getPasswordById error:", err);
        throw new Error("Error getting password by user id");
    }
}