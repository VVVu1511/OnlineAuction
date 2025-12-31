import db from "../utils/db.js";
import dotenv from "dotenv";
import sendMail from "../utils/sendMail.js";
import * as accountService from "../services/account.service.js";
import * as productService from "../services/product.service.js";

dotenv.config();

/* ================= ANSWER QUESTION ================= */
export async function answerQuestion(productId, questionId, answer) {
    try {
        const product = await db('PRODUCT').where({ id: productId }).first();
        if (!product) throw new Error('Product not found');

        const question = await db('QUESTION_ANSWER')
            .where({ id: questionId, product_id: productId })
            .first();
        if (!question) throw new Error('Question not found');

        await db('QUESTION_ANSWER')
            .where({ id: questionId })
            .update({ answer });

        return {
            success: true,
            message: 'Answer submitted successfully',
            data: { ...question, answer }
        };
    } catch (err) {
        return { success: false, message: err.message, data: null };
    }
}

/* ================= ASK SELLER ================= */
export async function askSeller({ userId, productId, question }) {
    try {
        const [inserted] = await db('QUESTION_ANSWER')
            .insert({
                product_id: productId,
                user_id: userId,
                question,
                answer: null,
                created_at: db.fn.now()
            })
            .returning('*');

        return {
            success: true,
            message: 'Question sent to seller successfully',
            data: inserted
        };
    } catch (err) {
        return { success: false, message: err.message, data: null };
    }
}

/* ================= EMAIL AFTER BID ================= */
export async function emailAfterBid(productId, sellerId, bidderId, price) {
    try {
        const product = await productService.getProductInfor(productId);
        const bidder = await accountService.findAllById(bidderId);
        const seller = await accountService.findAllById(sellerId);
        const bestBidder = product.best_bidder
            ? await accountService.findAllById(product.best_bidder)
            : null;

        const formattedPrice = Number(price).toLocaleString("vi-VN") + " VNĐ";

        await sendMail(
            seller.email,
            `Sản phẩm ${product.name} vừa có giá mới`,
            `<p>Người ra giá: <b>${bidder.full_name}</b></p>
             <p>Giá mới: <b>${formattedPrice}</b></p>`
        );

        await sendMail(
            bidder.email,
            `Bạn đã ra giá thành công cho ${product.name}`,
            `<p>Giá: <b>${formattedPrice}</b></p>`
        );

        if (bestBidder) {
            await sendMail(
                bestBidder.email,
                `Giá bạn giữ cho ${product.name} đã bị vượt`,
                `<p>Giá mới: <b>${formattedPrice}</b></p>`
            );
        }

        return { success: true, message: 'Emails sent successfully', data: null };
    } catch (err) {
        return { success: false, message: err.message, data: null };
    }
}

/* ================= EMAIL DENIED BIDDER ================= */
export async function emailDeniedBidder(product, bidder) {
    try {
        await sendMail(
            bidder.email,
            `Bạn đã bị từ chối ra giá cho sản phẩm "${product.name}"`,
            `<p>Sản phẩm: <b>${product.name}</b></p>`
        );

        return { success: true, message: 'Denied bidder email sent', data: null };
    } catch (err) {
        return { success: false, message: err.message, data: null };
    }
}

/* ================= EMAIL END BID ================= */
export async function emailEndBid(bestBidderId, sellerId, productId) {
    try {
        const seller = await accountService.findAllById(sellerId);
        const product = await productService.getProductInfor(productId);

        if (bestBidderId) {
            const winner = await accountService.findAllById(bestBidderId);

            await sendMail(
                winner.email,
                "Bạn đã thắng đấu giá 🎉",
                `<p>Sản phẩm: <b>${product.name}</b></p>`
            );

            await sendMail(
                seller.email,
                "Đấu giá kết thúc — Có người thắng",
                `<p>Người thắng: <b>${winner.full_name}</b></p>`
            );

            return {
                success: true,
                message: 'Winner & seller notified',
                data: { winner }
            };
        }

        await sendMail(
            seller.email,
            "Đấu giá kết thúc — Không có người mua",
            `<p>Sản phẩm ${product.name} không có người bid</p>`
        );

        return {
            success: true,
            message: 'Seller notified (no bidders)',
            data: null
        };

    } catch (err) {
        return { success: false, message: err.message, data: null };
    }
}

/* ================= EMAIL ASKING ================= */
export async function emailAsking(bidderId, productId, question) {
    try {
        const bidder = await db('USER').where({ id: bidderId }).first();
        const seller = await db('PRODUCT')
            .join('USER', 'PRODUCT.seller', 'USER.id')
            .where('PRODUCT.id', productId)
            .select('USER.*', 'PRODUCT.name as product_name')
            .first();

        await sendMail(
            seller.email,
            `Câu hỏi mới về ${seller.product_name}`,
            `<p>${bidder.full_name}: "${question}"</p>`
        );

        return { success: true, message: 'Email sent to seller', data: null };
    } catch (err) {
        return { success: false, message: err.message, data: null };
    }
}

/* ================= EMAIL ANSWERING ================= */
export async function emailAnswering(productId, questionId, answer) {
    try {
        const questionData = await findById(questionId);
        if (!questionData) throw new Error('Question not found');

        const bidUsers = await db('BID_HISTORY').where({ product_id: productId });
        const questionUsers = await db('QUESTION_ANSWER').where({ product_id: productId });

        const userIds = [...new Set([
            ...bidUsers.map(u => u.user_id),
            ...questionUsers.map(u => u.user_id)
        ])];

        const users = await db('USER').whereIn('id', userIds);
        const product = await db('PRODUCT').where({ id: productId }).first();

        for (const user of users) {
            await sendMail(
                user.email,
                `Người bán đã trả lời câu hỏi về ${product.name}`,
                `<p>${answer}</p>`
            );
        }

        return { success: true, message: 'Emails sent to users', data: null };
    } catch (err) {
        return { success: false, message: err.message, data: null };
    }
}

/* ================= FIND QUESTION ================= */
export async function findById(id) {
    try {
        const data = await db('QUESTION_ANSWER').where({ id }).first();
        return { success: true, message: 'Get question successfully', data };
    } catch (err) {
        return { success: false, message: err.message, data: null };
    }
}
