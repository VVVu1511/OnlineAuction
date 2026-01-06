import db from "../utils/db.js";
import dotenv from "dotenv";
import sendMail from "../utils/sendMail.js";
import * as accountService from "../services/account.service.js";
import * as productService from "../services/product.service.js";
import * as biddingService from "../services/bidding.service.js";

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
                created_at: new Date()
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

        const formattedPrice =
            Number(product.current_price).toLocaleString("vi-VN") + " VNĐ";

        const productUrl = `http://localhost:5173/product/${productId}`;

        // 📧 Email cho người bán
        await sendMail(
            seller.email,
            `Sản phẩm ${product.name} vừa có giá mới`,
            `
            <p>Người ra giá: <b>${bidder.full_name}</b></p>
            <p>Giá mới: <b>${formattedPrice}</b></p>
            <p>
                👉 <a href="${productUrl}" target="_blank">
                    Xem chi tiết sản phẩm
                </a>
            </p>
            `
        );

        // 📧 Email cho người ra giá
        await sendMail(
            bidder.email,
            `Bạn đã ra giá thành công cho ${product.name}`,
            `
            <p>Giá bạn vừa ra: <b>${formattedPrice}</b></p>
            <p>
                👉 <a href="${productUrl}" target="_blank">
                    Xem sản phẩm
                </a>
            </p>
            `
        );

        // 📧 Email cho người giữ giá cũ (nếu có)
        if (bestBidder) {
            await sendMail(
                bestBidder.email,
                `Giá bạn giữ cho ${product.name} đã bị vượt`,
                `
                <p>Giá mới hiện tại: <b>${formattedPrice}</b></p>
                <p>
                    👉 <a href="${productUrl}" target="_blank">
                        Vào sản phẩm để ra giá tiếp
                    </a>
                </p>
                `
            );
        }

        return {
            success: true,
            message: "Emails sent successfully",
            data: null
        };
    } catch (err) {
        return {
            success: false,
            message: err.message,
            data: null
        };
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

        if (!product) throw new Error('Product not found');

        const productUrl =
            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/product/${productId}`;

        if (bestBidderId) {
            const winner = await accountService.findAllById(bestBidderId);

            await sendMail(
                winner.email,
                "🎉 Bạn đã thắng đấu giá",
                `
                <p>Xin chào <b>${winner.full_name || winner.email}</b>,</p>

                <p>
                    Chúc mừng! Bạn đã <b>thắng đấu giá</b> cho sản phẩm:
                </p>

                <p>
                    <b>${product.name}</b>
                </p>

                <p>
                    👉 <a href="${productUrl}" target="_blank">
                        Xem chi tiết & hoàn tất giao dịch
                    </a>
                </p>

                <p>
                    Vui lòng truy cập sản phẩm để tiếp tục các bước thanh toán
                    và nhận hàng theo quy trình.
                </p>

                <p>
                    Trân trọng,<br/>
                    Hệ thống đấu giá
                </p>
                `
            );

            await sendMail(
                seller.email,
                "Đấu giá kết thúc — Có người thắng",
                `
                <p>Xin chào <b>${seller.full_name || seller.email}</b>,</p>

                <p>
                    Phiên đấu giá cho sản phẩm <b>${product.name}</b> đã kết thúc.
                </p>

                <p>
                    Người thắng đấu giá: <b>${winner.full_name}</b>
                </p>

                <p>
                    👉 <a href="${productUrl}" target="_blank">
                        Xem chi tiết đơn hàng
                    </a>
                </p>

                <p>
                    Vui lòng truy cập hệ thống để xác nhận và thực hiện các bước tiếp theo.
                </p>

                <p>
                    Trân trọng,<br/>
                    Hệ thống đấu giá
                </p>
                `
            );

            return {
                success: true,
                message: 'Winner & seller notified',
                data: { winner }
            };
        }

        // ❌ Không có người bid
        await sendMail(
            seller.email,
            "Đấu giá kết thúc — Không có người mua",
            `
            <p>Xin chào <b>${seller.full_name || seller.email}</b>,</p>

            <p>
                Phiên đấu giá cho sản phẩm <b>${product.name}</b> đã kết thúc
                nhưng <b>không có người tham gia đấu giá</b>.
            </p>

            <p>
                👉 <a href="${productUrl}" target="_blank">
                    Xem lại sản phẩm
                </a>
            </p>

            <p>
                Bạn có thể đăng lại hoặc chỉnh sửa thông tin sản phẩm nếu cần.
            </p>

            <p>
                Trân trọng,<br/>
                Hệ thống đấu giá
            </p>
            `
        );

        return {
            success: true,
            message: 'Seller notified (no bidders)',
            data: null
        };

    } catch (err) {
        return {
            success: false,
            message: err.message,
            data: null
        };
    }
}

/* ================= EMAIL ASKING ================= */
export async function emailAsking(bidderId, productId, question) {
    try {
        const bidder = await db('USER')
            .where({ id: bidderId })
            .first();

        const seller = await db('PRODUCT')
            .join('USER', 'PRODUCT.seller', 'USER.id')
            .where('PRODUCT.id', productId)
            .select(
                'USER.email',
                'USER.full_name as seller_name',
                'PRODUCT.name as product_name'
            )
            .first();

        if (!bidder || !seller) {
            throw new Error('Bidder or seller not found');
        }

        const link = `http://localhost:5173/product/${productId}`;

        await sendMail(
            seller.email,
            `Câu hỏi mới về ${seller.product_name}`,
            `
                <p>Xin chào <b>${seller.seller_name}</b>,</p>

                <p>
                    Người dùng <b>${bidder.full_name}</b> đã đặt câu hỏi
                    cho sản phẩm <b>${seller.product_name}</b>:
                </p>

                <blockquote style="border-left: 3px solid #ccc; padding-left: 10px;">
                    ${question}
                </blockquote>

                <p>
                    👉 <a href="${link}" target="_blank">
                        Xem sản phẩm & trả lời câu hỏi
                    </a>
                </p>

                <p>Trân trọng,<br/>Hệ thống đấu giá</p>
            `
        );

        return {
            success: true,
            message: 'Email sent to seller',
            data: null
        };
    } catch (err) {
        return {
            success: false,
            message: err.message,
            data: null
        };
    }
}

/* ================= EMAIL ANSWERING ================= */
export async function emailAnswering(productId, questionId, answer) {
    try {
        const questionData = await findById(questionId);
        if (!questionData) throw new Error('Question not found');

        const product = await db('PRODUCT')
            .where({ id: productId })
            .select('id', 'name', 'seller')
            .first();

        if (!product) throw new Error('Product not found');

        // Lấy user đã bid
        const bidUsers = await db('BID_HISTORY')
            .where({ product_id: productId })
            .select('user_id');

        // Lấy user đã hỏi / trả lời
        const questionUsers = await db('QUESTION_ANSWER')
            .where({ product_id: productId })
            .select('user_id');

        // Gộp & loại trùng
        const userIds = [
            ...new Set([
                ...bidUsers.map(u => u.user_id),
                ...questionUsers.map(u => u.user_id)
            ])
        ];

        // ❌ loại seller
        const notifyUserIds = userIds.filter(
            userId => userId !== product.seller
        );

        if (!notifyUserIds.length) {
            return {
                success: true,
                message: 'No users to notify',
                data: null
            };
        }

        const users = await db('USER')
            .whereIn('id', notifyUserIds)
            .select('email', 'full_name');

        const link = `http://localhost:5173/product/${productId}`;

        for (const user of users) {
            await sendMail(
                user.email,
                `Người bán đã trả lời câu hỏi về "${product.name}"`,
                `
                    <p>Xin chào <b>${user.full_name}</b>,</p>

                    <p>
                        Người bán đã trả lời một câu hỏi
                        liên quan đến sản phẩm <b>${product.name}</b>:
                    </p>

                    <blockquote style="border-left: 3px solid #ccc; padding-left: 10px;">
                        ${answer}
                    </blockquote>

                    <p>
                        👉 <a href="${link}" target="_blank">
                            Xem sản phẩm & toàn bộ hỏi đáp
                        </a>
                    </p>

                    <p>Trân trọng,<br/>Hệ thống đấu giá</p>
                `
            );
        }

        return {
            success: true,
            message: 'Answer emails sent successfully',
            data: null
        };
    } catch (err) {
        return {
            success: false,
            message: err.message,
            data: null
        };
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

/* ================= EMAIL RESET PASSWORD ================= */
export async function emailResetPassword(email, newPassword = '123456') {
    try {
        const user = await db('USER').where({ email }).first();
        if (!user) throw new Error('User not found');

        await sendMail(
            user.email,
            'Reset mật khẩu tài khoản',
            `
                <p>Xin chào <b>${user.full_name || user.email}</b>,</p>

                <p>Mật khẩu tài khoản của bạn đã được <b>Admin reset</b>.</p>

                <p>
                    <b>Mật khẩu mới:</b> 
                    <span style="color: red; font-size: 16px;">
                        ${newPassword}
                    </span>
                </p>

                <p>
                    Vui lòng đăng nhập và đổi mật khẩu ngay để đảm bảo an toàn.
                </p>

                <p>Trân trọng,<br/>Hệ thống đấu giá</p>
            `
        );

        return {
            success: true,
            message: 'Reset password email sent',
            data: null
        };
    } catch (err) {
        return {
            success: false,
            message: err.message,
            data: null
        };
    }
}

export async function emailNotifyDescriptionUpdated(productId) {
    try {
        const product = await productService.getProductInfor(productId);
        if (!product) throw new Error('Product not found');

        const bidders = await biddingService.getBiddersByProduct(productId);
        
        console.log(bidders);

        if (!bidders.length) {
            return {
                success: true,
                message: 'No bidders to notify',
                data: null
            };
        }

        const productUrl =
            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/product/${productId}`;

        for (const user of bidders) {
            await sendMail(
                user.email,
                `Sản phẩm bạn đã đấu giá vừa được cập nhật mô tả`,
                `
                <p>Xin chào <b>${user.full_name || user.email}</b>,</p>

                <p>
                    Sản phẩm <b>${product.name}</b> mà bạn đã tham gia đấu giá
                    vừa được <b>người bán cập nhật mô tả</b>.
                </p>

                <p>
                    👉 <a href="${productUrl}" target="_blank">
                        Xem chi tiết sản phẩm
                    </a>
                </p>

                <p>
                    Việc cập nhật mô tả có thể ảnh hưởng đến quyết định đấu giá,
                    bạn vui lòng kiểm tra lại thông tin.
                </p>

                <p>
                    Trân trọng,<br/>
                    Hệ thống đấu giá
                </p>
                `
            );
        }

        return {
            success: true,
            message: 'Description update emails sent',
            data: null
        };
    } catch (err) {
        return {
            success: false,
            message: err.message,
            data: null
        };
    }
}
