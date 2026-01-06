import db from "../utils/db.js";

/**
 * Lấy danh sách sản phẩm user đã bid
 */
export async function getBiddingList(user_id) {
    try {
        return await db('BID_HISTORY')
            .where('BID_HISTORY.user_id', user_id)
            .join('PRODUCT', 'PRODUCT.id', 'BID_HISTORY.product_id')
            .where('end_date', '>', new Date())
            .groupBy('PRODUCT.id')
            .select('PRODUCT.*');
    } catch (err) {
        console.error('Error fetching bidding list', err);
        throw err;
    }
}

/**
 * Seller từ chối bidder
 */
export async function refuseBidder(productId, bidderId) {
    const product = await db('PRODUCT').where({ id: productId }).first();
    if (!product) throw new Error('Product not found');

    // mark bid as refused
    await db('BID_HISTORY')
        .where({ product_id: productId, user_id: bidderId })
        .update({ is_refused: true });

    // get highest valid bid
    const highestBid = await db('BID_HISTORY')
        .where({ product_id: productId, is_refused: false })
        .orderBy('price', 'desc')
        .first();

    const newCurrentPrice = highestBid ? highestBid.price : product.starting_price;
    const newBestBidder = highestBid ? highestBid.user_id : null;

    await db('PRODUCT')
        .where({ id: productId })
        .update({
            current_price: newCurrentPrice,
            best_bidder: newBestBidder
        });

    return {
        product_id: productId,
        current_price: newCurrentPrice,
        best_bidder: newBestBidder
    };
}

/**
 * Lịch sử đấu giá của sản phẩm
 */
export async function getBidHistory(product_id) {
    try {
        return await db('BID_HISTORY as b')
            .join('USER as u', 'b.user_id', 'u.id')
            .select('b.*', 'u.full_name')
            .where({ product_id });
    } catch (err) {
        console.error('Cannot get bid history', err);
        throw err;
    }
}

/**
 * Đặt giá mới
 */
export async function new_bid(data) {
    try {
        // insert bid + lấy id
        const rows = await db('BID_HISTORY')
            .insert({
                user_id: data.user_id,
                product_id: data.product_id,
                time: data.time || new Date(),
                price: data.price
            })
            
        // get product
        const product = await db('PRODUCT')
            .where({ id: data.product_id })
            .first();

        const newBidCount = (product.bid_counts || 0) + 1;

        // update product
        await db('PRODUCT')
            .where({ id: data.product_id })
            .update({
                current_price: data.price,
                bid_counts: newBidCount,
                best_bidder: data.user_id
            });

        return {
            product_id: data.product_id,
            price: data.price,
            bid_counts: newBidCount
        };

    } catch (err) {
        console.error('Cannot add new bid', err);
        throw err;
    }
}

/**
 * Cấm bidder
 */
export async function denyBidder(productId, bidderId) {
    try {
        /* 1️⃣ Thêm vào danh sách bị chặn */
        await db('DENIED_BIDDERS').insert({
            product_id: productId,
            user_id: bidderId
        });

        /* 2️⃣ Lấy thông tin sản phẩm */
        const product = await db('PRODUCT')
            .where({ id: productId })
            .first();

        if (!product) throw new Error('Product not found');

        /* ❗ Nếu bidder KHÔNG phải best_bidder → dừng */
        if (product.best_bidder !== bidderId) {
            return {
                product_id: productId,
                current_price: product.current_price,
                best_bidder: product.best_bidder,
                updated: false
            };
        }

        /* 3️⃣ Lấy bid cao nhất KHÔNG phải bidder bị deny */
        const highestBid = await db('BID_HISTORY')
            .where({ product_id: productId })
            .andWhereNot({ user_id: bidderId })
            .orderBy([
                { column: 'price', order: 'desc' },
                { column: 'time', order: 'asc' }
            ])
            .first();

        /* 4️⃣ Xác định giá & người thắng mới */
        const newPrice = highestBid
            ? highestBid.price
            : product.starting_price;

        const bestBidder = highestBid
            ? highestBid.user_id
            : null;

        /* 5️⃣ Update PRODUCT (chỉ trong trường hợp này) */
        await db('PRODUCT')
            .where({ id: productId })
            .update({
                current_price: newPrice,
                best_bidder: bestBidder
            });

        return {
            product_id: productId,
            current_price: newPrice,
            best_bidder: bestBidder,
            updated: true
        };

    } catch (err) {
        throw err;
    }
}

/**
 * Danh sách bidder bị cấm
 */
export async function getDeniedBidders(productId) {
    return await db('DENIED_BIDDERS')
        .join('USER', 'USER.id', 'DENIED_BIDDERS.user_id')
        .select('USER.id', 'USER.full_name', 'USER.email')
        .where('DENIED_BIDDERS.product_id', productId);
}

/**
 * Seller đánh giá bidder
 */
export async function rateBidder(bidderId, productId, comment, rating) {
    try {
        console.log(rating);
        
        const product = await db('PRODUCT').where({ id: productId }).first();
        if (!product) throw new Error('Product not found');

        await db('RATING').insert({
            rater_id: product.seller,
            rated_id: bidderId,
            product_id: productId,
            comment,
            rating,
            created_at: new Date()
        });

        return {
            bidder_id: bidderId,
            product_id: productId,
            rating,
            comment
        };

    } catch (err) {
        console.error('Cannot rate bidder', err);
        throw err;
    }
}

export async function rateSeller(sellerId, productId, comment, rating) {
    try {
        const product = await db('PRODUCT')
            .where({ id: productId })
            .first();

        if (!product) {
            throw new Error('Product not found');
        }

        // 🔐 chỉ winner mới được đánh giá seller
        // if (!product.winner) {
        //     throw new Error('Product has no winner');
        // }

        // if (product.seller !== sellerId) {
        //     throw new Error('Invalid seller');
        // }

        await db('RATING').insert({
            rater_id: product.best_bidder, // 👈 người mua
            rated_id: sellerId,        // 👈 người bán
            product_id: productId,
            comment,
            rating,
            created_at: new Date()
        });

        return {
            seller_id: sellerId,
            product_id: productId,
            rating,
            comment
        };

    } catch (err) {
        console.error('Cannot rate seller', err);
        throw err;
    }
}

// services/deniedBidder.service.js
export async function isUserDeniedBid(productId, userId) {
    const row = await db('DENIED_BIDDERS')
        .where({
            product_id: productId,
            user_id: userId
        })
        .first();

    return !!row; // true | false
}

export async function getBiddersByProduct(productId) {
    return await db('BID_HISTORY as B')
        .join('USER as U', 'B.user_id', 'U.id')
        .where('B.product_id', productId)
        .select('U.id', 'U.email', 'U.full_name')
        .groupBy('U.id', 'U.email', 'U.full_name');
}