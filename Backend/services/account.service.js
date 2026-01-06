import bcrypt from "bcryptjs";
import db from "../utils/db.js"
import dayjs from "../utils/dayjs.js"
import dotenv from "dotenv";
import sendMail from "../utils/sendMail.js";

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

const otpStore = {}; // { email: { otp, expiresAt } }

export async function sendOtp(userEmail, otp) {
    otpStore[userEmail] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000
    };

    const subject = "Your OTP Code";
    const html = `
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
    `;

    const sent = await sendMail(userEmail, subject, html);

    if (!sent) {
        throw new Error("Send OTP failed");
    }

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
    return await db('RATING as R')
        .join('USER as U', 'R.rater_id', 'U.id')
        .join('PRODUCT as P', 'R.product_id', 'P.id')
        .where('R.rated_id', userId)
        .select(
            'R.id',
            'R.rating',
            'R.comment',
            'R.created_at',

            'U.id as rater_id',
            'U.full_name as rater_name',

            'P.id as product_id',
            'P.name as product_name'
        )
        .orderBy('R.created_at', 'desc');
}

// services/rating.service.js
export async function getRatingPercent(userId) {
    const rows = await db('RATING')
        .where('rated_id', userId)
        .select('rating');

    const total = rows.length;

    if (total === 0) {
        return {
            total: 0,
            positive: 0,
            percent: 0
        };
    }

    const positive = rows.filter(r => r.rating === 1).length;
    const percent = Math.round((positive / total) * 100);

    return {
        total,
        positive,
        percent
    };
}

export async function getWinProducts(userId) {
    return await db('PRODUCT')
        .andWhere('end_date', '<=', new Date())
        .where('best_bidder', userId)
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

// export async function addWatchList(user_id, product_id) {
//     const [id] = await db('WATCHLIST')
//         .insert({ user_id, product_id })
//         .returning('id');

//     return id;
// }

// export async function delWatchList(user_id, product_id) {
//     const deleted = await db('WATCHLIST')
//         .where({ user_id, product_id })
//         .del();

//     return deleted;
// }

// account.service.js
export async function getRequestSellState(user_id) {
    const user = await db("USER")
        .select("request_sell", "request_expire")
        .where("id", user_id)
        .first();

    if (!user) return null;

    const isRequested =
        user.request_sell === true &&
        user.request_expire !== null &&
        new Date(user.request_expire) > new Date();

    return {
        requested: isRequested,
        request_expire: user.request_expire
    };
}

export async function requestSell(user_id) {
    const requestExpire = dayjs()
        .add(7, "day")
        .toDate();

    const affected = await db("USER")
        .where({ id: user_id })
        .update({
            request_sell: true,
            request_expire: requestExpire
        });

    return {
        success: affected > 0,
        message: affected > 0
            ? "Request sell submitted"
            : "User not found"
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
            .join("ROLE", "USER.role", "ROLE.id")
            .select(
                "USER.id",
                "USER.email",
                "USER.full_name",
                "USER.address",
                "USER.request_sell",
                "USER.request_expire",
                "ROLE.description as role"
            );

        return users;
    } catch (err) {
        console.error("cannot get all users:", err);
        throw err;
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

export async function resetPassword(email, newPassword) {
    return db("USER")
        .where({ email })
        .update({ password: newPassword});
}

/* ADD USER */
export async function addUser(data) {
    try {
        const { email, password, role, address, full_name } = data;

        const hashedPassword = await bcrypt.hash(password, 10);

        const [user] = await db("USER")
            .insert({
                email,
                password: hashedPassword,
                role,
                address,
                full_name
            })
            .returning(["id", "email", "full_name", "role", "address"]);

        return user;
    } catch (err) {
        console.error("addUser error:", err);
        throw new Error("Error adding user");
    }
}

/* UPDATE USER */
export async function updateUserById(user_id, data) {
    try {
        const updateData = {};

        if (data.email) updateData.email = data.email;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.address) updateData.address = data.address;
        if (data.full_name) updateData.full_name = data.full_name;

        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        if (Object.keys(updateData).length === 0) return null;

        const [user] = await db("USER")
            .where("id", user_id)
            .update(updateData)
            .returning(["id", "email", "full_name", "role", "address"]);

        return user || null;
    } catch (err) {
        console.error("updateUserById error:", err);
        throw new Error("Error updating user");
    }
}

/* GET STATE */
export async function getState(user_id, product_id) {
    try {
        const record = await db("WATCHLIST")
            .where({ user_id, product_id })
            .first();

        return !!record;
    } catch (err) {
        console.error("getState error:", err);
        throw new Error("Error getting watchlist state");
    }
}

/* ADD */
export async function addWatchList(user_id, product_id) {
    try {
        await db("WATCHLIST")
            .insert({ user_id, product_id });

        return { user_id, product_id };
    } catch (err) {
        console.error("add watchlist error:", err);
        throw new Error("Error adding watchlist");
    }
}

/* REMOVE */
export async function removeWatchList(user_id, product_id) {
    try {
        const deleted = await db("WATCHLIST")
            .where({ user_id, product_id })
            .del();

        if (!deleted) return null;

        return { user_id, product_id };
    } catch (err) {
        console.error("remove watchlist error:", err);
        throw new Error("Error removing watchlist");
    }
}