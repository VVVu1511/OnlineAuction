import bcrypt from "bcryptjs";
import db from "../utils/db.js"
import dotenv from "dotenv";
import authMiddleware from "../middleware/auth.js"; // adjust path

dotenv.config();

export async function answerQuestion(productId, questionId, sellerId, answer) {
    // 1️⃣ Kiểm tra quyền: chỉ seller mới trả lời
    const product = await db('PRODUCT').where({ id: productId }).first();
    if (!product) throw new Error('Product not found');

    // 2️⃣ Kiểm tra câu hỏi có tồn tại cho sản phẩm này
    const question = await db('PRODUCT_QUESTION')
        .where({ id: questionId, product_id: productId })
        .first();
    if (!question) throw new Error('Question not found');

    // 3️⃣ Cập nhật câu trả lời
    await db('PRODUCT_QUESTION')
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

        // TODO: send email to seller
        // const seller = await db('users')
        //     .join('product', 'product.seller_id', 'users.id')
        //     .select('users.email')
        //     .where('product.id', productId)
        //     .first();
        // if (seller?.email) {
        //     sendEmail(
        //         seller.email,
        //         `New question for your product`,
        //         `A buyer asked: "${question}"\nView product: http://your-site.com/product/${productId}`
        //     );
        // }

        return { success: true, data: inserted };
    } catch (err) {
        console.error("askSeller error:", err);
        throw new Error("Database error while asking seller");
    }
}
