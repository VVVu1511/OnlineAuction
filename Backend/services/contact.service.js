import bcrypt from "bcryptjs";
import db from "../utils/db.js"
import dotenv from "dotenv";
import authMiddleware from "../middleware/auth.js"; // adjust path
import sendMail from '../utils/sendMail.js';
import * as accountService from '../services/account.service.js'
import * as productService from '../services/product.service.js'

dotenv.config();

export async function answerQuestion(productId, questionId, answer) {
    const product = await db('PRODUCT').where({ id: productId }).first();
    if (!product) throw new Error('Product not found');

    // 2️⃣ Kiểm tra câu hỏi có tồn tại cho sản phẩm này
    const question = await db('QUESTION_ANSWER')
        .where({ id: questionId, product_id: productId })
        .first();
    if (!question) throw new Error('Question not found');

    // 3️⃣ Cập nhật câu trả lời
    await db('QUESTION_ANSWER')
        .where({ id: questionId })
        .update({ answer });

    // 4️⃣ Trả về câu hỏi đã cập nhật
    return { ...question, answer };
}

export async function askSeller({ userId, productId, question }) {
    try {
        // Insert question into QUESTION_ANSWER table
        const [inserted] = await db('QUESTION_ANSWER')
            .insert({
                product_id: productId,
                user_id: userId,
                question: question,
                answer: null,
                created_at: db.fn.now() // Knex function for NOW()
            })
            .returning('*'); // PostgreSQL syntax

        return { success: true, data: inserted };
    } catch (err) {
        console.error("askSeller error:", err);
        throw new Error("Database error while asking seller");
    }
}

export async function emailAfterBid(productId, sellerId, bidderId, price) {
    try {
        const product = await productService.getProductInfor(productId);
        const bidder = await accountService.findAllById(bidderId);
        const seller = await accountService.findAllById(sellerId);

        const formattedPrice = Number(price).toLocaleString("vi-VN") + " VNĐ";
        const bestBidder = accountService.findAllById(product.best_bidder);

        // 1. Email cho Người bán
        await sendMail(
            seller.email,
            `Sản phẩm ${product.name} vừa có giá mới`,
            `
                <p>Xin chào <b>${seller.full_name}</b>,</p>
                <p>Sản phẩm <b>${product.name}</b> vừa được đặt giá mới: <b>${formattedPrice}</b>.</p>
                <p>Người ra giá: <b>${bidder.full_name}</b></p>
            `
        );

        // 2. Email cho Người ra giá
        await sendMail(
            bidder.email,
            `Bạn đã ra giá thành công cho ${product.name}`,
            `
                <p>Xin chào <b>${bidder.full_name}</b>,</p>
                <p>Bạn đã ra giá thành công <b>${formattedPrice}</b> cho sản phẩm <b>${product.name}</b>.</p>
            `
        );

        // 3. Email cho Người giữ giá trước đó (nếu có)
        if (bestBidder) {
            await sendMail(
                bestBidder.email,
                `Giá bạn giữ cho ${product.name} đã bị vượt`,
                `
                    <p>Xin chào <b>${bestBidder.full_name}</b>,</p>
                    <p>Giá bạn đang giữ cho sản phẩm <b>${product.name}</b> đã bị vượt qua.</p>
                    <p>Giá mới: <b>${formattedPrice}</b>.</p>
                `
            );
        }

        return { success: true };

    } catch (err) {
        console.error("emailAfterBid error:", err);
        return { success: false, message: err.message };
    }
}

export async function emailDeniedBidder(product, bidder) {
    try {
        const subject = `Bạn đã bị từ chối ra giá cho sản phẩm "${product.name}"`;

        const html = `
            <h2>Thông báo từ chối quyền ra giá</h2>
            <p>Xin chào <b>${bidder.full_name}</b>,</p>
            <p>Bạn đã bị từ chối quyền tiếp tục ra giá cho sản phẩm:</p>

            <ul>
                <li><b>Mã sản phẩm:</b> ${product.id}</li>
                <li><b>Tên sản phẩm:</b> ${product.name}</li>
                <li><b>Giá hiện tại:</b> ${product.current_price.toLocaleString()} VND</li>
            </ul>

            <p>Lý do phổ biến:</p>
            <ul>
                <li>Điểm đánh giá của bạn dưới mức yêu cầu.</li>
                <li>Lịch sử giao dịch chưa đạt tiêu chuẩn.</li>
            </ul>

            <p>Nếu bạn nghĩ có sự nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ.</p>

            <p>Trân trọng,<br/>Website Đấu Giá Trực Tuyến</p>
        `;

        await sendMail(bidder.email, subject, html);

        return { success: true };
    } catch (err) {
        console.error("Error sending denied bidder email:", err);
        throw err;
    }
}

export async function emailForSeller(params) {
    //     Đấu giá kết thúc, không có người mua
// Người bán        
}

export async function emailEndBid(best_bidderId, sellerId, productId) {
    try {
        const best_bidder = await accountService.findAllById(best_bidderId);
        const seller = await accountService.findAllById(sellerId);
        const product = await productService.getProductInfor(productId);

        // --------------------------------------
        // CASE 1: Có người thắng đấu giá
        // --------------------------------------
        if (best_bidder) {
            // Gửi cho người thắng
            await sendMail(
                best_bidder.email,
                "Chúc mừng! Bạn đã thắng phiên đấu giá 🎉",
                `
                <h2>🎉 Bạn đã thắng đấu giá!</h2>
                <p>Xin chào <b>${best_bidder.full_name}</b>,</p>
                <p>Bạn là người trả giá cao nhất cho sản phẩm:</p>

                <p><b>${product.name}</b></p>
                <p>Giá thắng: <b>${product.current_price.toLocaleString()} VND</b></p>

                <p>Chúng tôi sẽ sớm liên hệ để hoàn tất giao dịch.</p>
                <hr>
                <p>Cảm ơn bạn đã tham gia đấu giá!</p>
                `
            );

            // Gửi cho người bán
            await sendMail(
                seller.email,
                "Phiên đấu giá đã kết thúc — Có người thắng",
                `
                <h2>📦 Đấu giá đã kết thúc</h2>
                <p>Chào <b>${seller.full_name}</b>,</p>

                <p>Sản phẩm của bạn: <b>${product.name}</b></p>
                <p>Đã có người thắng đấu giá:</p>

                <p><b>${best_bidder.full_name}</b> — giá ${product.current_price.toLocaleString()} VND</p>

                <p>Vui lòng liên hệ người thắng để hoàn tất giao dịch.</p>
                `
            );

            return { success: true, message: "Emails sent to seller & winner." };
        }

        // --------------------------------------
        // CASE 2: Không có người bid nào
        // --------------------------------------
        await sendMail(
            seller.email,
            "Phiên đấu giá đã kết thúc — Không có người mua",
            `
            <h2>⚠️ Đấu giá kết thúc</h2>
            <p>Chào <b>${seller.full_name}</b>,</p>

            <p>Rất tiếc, sản phẩm <b>${product.name}</b> không có ai tham gia đặt giá.</p>

            <p>Bạn có thể:</p>
            <ul>
                <li>Đăng bán lại sản phẩm</li>
                <li>Giảm giá khởi điểm</li>
                <li>Giữ sản phẩm để đấu giá sau</li>
            </ul>
            `
        );

        return { success: true, message: "Email sent to seller (no bidders)." };

    } catch (err) {
        console.error("EmailEndBid error:", err);
        throw new Error("Unable to send email.");
    }
}

export async function emailAsking(bidderId, productId, question) {
    try {
        // 1️⃣ Lấy thông tin người mua (bidder)
        const bidder = await db('USER')
            .where({ id: bidderId })
            .select('*')
            .first();

        if (!bidder) throw new Error("Bidder not found");

        // 2️⃣ Lấy thông tin sản phẩm + người bán
        const seller = await db('PRODUCT')
            .join('USER', 'PRODUCT.seller', 'USER.id')  // PRODUCT.seller là id user
            .where('PRODUCT.id', productId)
            .select('USER.*', 'PRODUCT.name as product_name')
            .first();

        if (!seller) throw new Error("Seller or product not found");

        // 3️⃣ Nội dung email gửi người bán
        const subject = `Một người mua vừa đặt câu hỏi về sản phẩm "${seller.product_name}"`;

        const text = `
            Xin chào ${seller.full_name},

            ${bidder.full_name} (người mua) vừa đặt câu hỏi về sản phẩm **${seller.product_name}** của bạn.

            Câu hỏi:
            "${question}"

            Vui lòng đăng nhập để trả lời sớm nhất.

            Trân trọng,
            Hệ thống đấu giá
                    `;

        // 4️⃣ Gửi email
        await sendMail(seller.email, subject, text);

        return { success: true };
    } catch (err) {
        console.error("emailAsking error:", err);
        throw err;
    }
}

export async function emailAnswering(productId, questionId, answer) {
    try {
        const data = await findById(questionId);
        if (!data) {
            throw new Error("Question not found");
        }

        const question = data.question;
        
        // 1️⃣ Lấy danh sách user đã đấu giá
        const bidUsers = await db('BID_HISTORY')
            .where({ product_id: productId })
            .select('user_id');

        // 2️⃣ Lấy danh sách user đã đặt câu hỏi
        const questionUsers = await db('QUESTION_ANSWER')
            .where({ product_id: productId })
            .select('user_id');

        // 3️⃣ Gộp user_id, loại trùng
        const userIds = Array.from(
            new Set([
                ...bidUsers.map(u => u.user_id),
                ...questionUsers.map(u => u.user_id)
            ])
        );

        if (userIds.length === 0) return;

        // 4️⃣ Lấy email + tên của tất cả user cần thông báo
        const users = await db('USER')
            .whereIn('id', userIds)
            .select('email', 'full_name');

        // 5️⃣ Lấy thông tin sản phẩm để đưa vào email
        const product = await db('PRODUCT')
            .where({ id: productId })
            .select('name')
            .first();

        // 6️⃣ Gửi email cho từng người
        const subject = `Người bán vừa trả lời câu hỏi về sản phẩm "${product.name}"`;

        for (const user of users) {
            const text = `
                Xin chào ${user.full_name},

                Người bán đã trả lời câu hỏi về sản phẩm **${product.name}**.

                Câu hỏi:
                "${question}"

                Trả lời:
                "${answer}"

                Vui lòng đăng nhập vào hệ thống để xem chi tiết.

                Trân trọng,
                Hệ thống đấu giá
                `;

            await sendMail(user.email, subject, text);
        }

        return { success: true };

    } catch (err) {
        console.error("emailAnswering error:", err);
        throw err;
    }
}

export async function findById(id) {
    return db('QUESTION_ANSWER')
        .where({ id })
        .select('*')
        .first();
}
