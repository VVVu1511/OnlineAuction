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
        updated_at: db.fn.now()
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
        updated_at: db.fn.now()
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
        status: 'BOTH_REVIEW',
        updated_at: db.fn.now()
        });

    return true;
};

export const upsertReview = async (productId, reviewerId, payload) => {
    const order = await getOrderByProduct(productId);

    if (![order.seller_id, order.winner_id].includes(reviewerId))
        throw new Error('Not allowed');

    const target =
        reviewerId === order.seller_id
        ? order.winner_id
        : order.seller_id;

    await db('ORDER_REVIEW')
        .insert({
        order_id: order.id,
        reviewer_id: reviewerId,
        target_user_id: target,
        score: payload.score,
        comment: payload.comment
        })
        .onConflict(['order_id', 'reviewer_id'])
        .merge({
        score: payload.score,
        comment: payload.comment,
        updated_at: db.fn.now()
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
            cancelled_at: trx.fn.now()
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
            updated_at: trx.fn.now()
        });
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
