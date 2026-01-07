import db from '../utils/db.js'

export const getOrderByProduct = async (productId) => {
    const order = await db('ORDER_COMPLETION')
        .where({ product_id: productId })
        .first();

    if (!order) throw new Error('Order not found');
    return order;
};

export const createOrder = async (payload) => {
    const {
        product_id,
        seller_id,
        winner_id
    } = payload;

    if (!product_id || !seller_id || !winner_id) {
        throw new Error('Missing required fields');
    }

    // Check existing order
    const existing = await db('ORDER_COMPLETION')
        .where({ product_id })
        .first();

    if (existing) {
        throw new Error('Order already exists for this product');
    }

    const [order] = await db('ORDER_COMPLETION')
        .insert({
            product_id,
            seller_id,
            winner_id,
            status: 'BUYER_SUBMIT_PAYMENT'
        })
        .returning('*');

    return order;
};

export const submitPayment = async (productId, userId, payload) => {
    const order = await getOrderByProduct(productId);

    if (order.winner_id !== userId)
        throw new Error('Only winner can submit payment');

    await db('ORDER_COMPLETION')
        .where({ product_id: productId })
        .update({
        buyer_payment_info: payload.payment_info,
        buyer_address: payload.address,
        status: 'SELLER_CONFIRM_PAYMENT',
        updated_at: new Date()
        });

    return true;
};

export const confirmShipping = async (productId, sellerId, shippingInfo) => {
    const order = await getOrderByProduct(productId);

    if (order.seller_id !== sellerId)
        throw new Error('Only seller can confirm');

    await db('ORDER_COMPLETION')
        .where({ product_id: productId })
        .update({
        seller_shipping_info: shippingInfo,
        status: 'BUYER_CONFIRM_RECEIVE',
        updated_at: new Date()
        });

    return true;
};

export const confirmReceive = async (productId, userId) => {
    const order = await getOrderByProduct(productId);

    if (order.winner_id !== userId)
        throw new Error('Only buyer can confirm receive');

    await db('ORDER_COMPLETION')
        .where({ product_id: productId })
        .update({
            status: 'RATING_OPEN',
            updated_at: new Date()
        });

    return true;
};

export const cancelOrder = async (productId, sellerId) => {
    const order = await getOrderByProduct(productId);

    if (order.seller_id !== sellerId)
        throw new Error('Only seller can cancel');

    await db.transaction(async trx => {
        await trx('ORDER_COMPLETION')
        .where({ product_id: productId })
        .update({
            status: 'CANCELLED',
            cancelled_by: sellerId,
            cancelled_at: new Date()
        });

        await trx('ORDER_REVIEW')
        .insert({
            order_id: order.id,
            reviewer_id: sellerId,
            target_user_id: order.winner_id,
            score: -1,
            comment: 'Buyer did not complete payment in time'
        })
        .onConflict(['order_id', 'reviewer_id'])
        .merge({
            score: -1,
            updated_at: new Date()
        });
        
        await trx('RATING')
                .insert({
                    product_id: productId,
                    rater_id: sellerId,
                    rated_id: order.winner_id,
                    rating: -1,
                    comment: 'Buyer did not complete payment in time',
                    created_at: new Date()
                })
    });


    return true;
};

export const sendMessage = async (productId, senderId, message) => {
    const order = await getOrderByProduct(productId);

    if (![order.seller_id, order.winner_id].includes(senderId))
        throw new Error('Not allowed');

    return await db('ORDER_CHAT').insert({
        order_id: order.id,
        sender_id: senderId,
        message
    });
};

/**
 * Get chat history by productId
 */
export const getChatHistory = async (productId) => {
    // 1️⃣ Lấy order
    const order = await db('ORDER_COMPLETION')
        .where({ product_id: productId })
        .first();

    if (!order) {
        throw new Error('Order not found');
    }

    // 2️⃣ Lấy chat
    const chats = await db('ORDER_CHAT')
        .where({ order_id: order.id })
        .orderBy('created_at', 'asc');

    return chats;
};

export const getReviewsByOrder = async (orderId) => {
    const reviews = await db("ORDER_REVIEW")
        .where({ order_id: orderId })
        .select(
            "id",
            "order_id",
            "reviewer_id",
            "target_user_id",
            "score",
            "comment",
            "updated_at"
        );

    return reviews;
};

export async function upsertReview(data) {
    const {
        product_id,
        reviewer_id,
        score,
        comment
    } = data;

    // 🔹 Resolve target_user_id từ order
    const order = await db('ORDER_COMPLETION')
        .where({ product_id })
        .first();

    if (!order) {
        throw new Error('Order not found');
    }

    const order_id = order.id;

    const target_user_id =
        reviewer_id === order.winner_id
            ? order.seller_id
            : order.winner_id;

    // =====================
    // REVIEW (per product)
    // =====================
    const existingReview = await db('ORDER_REVIEW')
        .where({ reviewer_id, target_user_id, order_id })
        .first();

    let review;

    if (existingReview) {
        await db('ORDER_REVIEW')
            .where({ id: existingReview.id })
            .update({
                score,
                comment,
                updated_at: new Date()
            });

        review = {
            ...existingReview,
            score,
            comment,
            updated_at: new Date()
        };
    } else {
        const [id] = await db('ORDER_REVIEW').insert({
            product_id,
            reviewer_id,
            target_user_id,
            score,
            comment,
            created_at: new Date()
        });

        review = await db('ORDER_REVIEW').where({ id }).first();
    }

    // =====================
    // RATING (reputation)
    // =====================
    const existingRating = await db('RATING')
        .where({
            product_id,
            rater_id: reviewer_id,
            rated_id: target_user_id
        })
        .first();

    if (existingRating) {
        await db('RATING')
            .where({ id: existingRating.id })
            .update({
                rating: score,
                comment,
                created_at: new Date()
            });
    } else {
        await db('RATING').insert({
            product_id,
            rater_id: reviewer_id,
            rated_id: target_user_id,
            rating: score,
            comment,
            created_at: new Date()
        });
    }

    return review;
}

