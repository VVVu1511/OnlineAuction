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
const otpStore = {}; // { userId: { otp, expiresAt } }

export async function sendOtp(userId, otp) {
    otpStore[userId] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 phút
    };
    console.log(`OTP for user ${userId}: ${otp}`);
    // TODO: gửi email hoặc sms ở đây
}

export async function verifyOtp(userId, otp) {
    const record = otpStore[userId];
    if (!record) return false;
    if (record.expiresAt < Date.now()) {
        delete otpStore[userId];
        return false;
    }
    if (record.otp === otp) {
        delete otpStore[userId];
        return true;
    }
    return false;
}
