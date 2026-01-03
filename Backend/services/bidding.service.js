import db from "../utils/db.js";

/**
 * Lấy danh sách sản phẩm user đã bid
 */
export async function getBiddingList(user_id) {
    try {
        return await db('BID_HISTORY')
            .where('BID_HISTORY.user_id', user_id)
            .join('PRODUCT', 'PRODUCT.id', 'BID_HISTORY.product_id')
            .whereNot('PRODUCT.state_id', 2)
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
        await db('BID_HISTORY')
            .where({ product_id: productId, user_id: bidderId })
            .del();

        await db('DENIED_BIDDERS').insert({
            product_id: productId,
            user_id: bidderId
        });

        const product = await db('PRODUCT').where({ id: productId }).first();

        const highestBid = await db('BID_HISTORY')
            .where({ product_id: productId })
            .orderBy([
                { column: 'price', order: 'desc' },
                { column: 'time', order: 'asc' }
            ])
            .first();

        const newPrice = highestBid ? highestBid.price : product.starting_price;
        const bestBidder = highestBid ? highestBid.user_id : null;

        await db('PRODUCT')
            .where({ id: productId })
            .update({
                current_price: newPrice,
                best_bidder: bestBidder
            });

        return {
            product_id: productId,
            current_price: newPrice,
            best_bidder: bestBidder
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
        const product = await db('PRODUCT').where({ id: productId }).first();
        if (!product) throw new Error('Product not found');

        const [ratingId] = await db('RATING').insert({
            rater_id: product.seller,
            rated_id: bidderId,
            product_id: productId,
            comment,
            rating,
            created_at: new Date()
        });

        return {
            rating_id: ratingId,
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
