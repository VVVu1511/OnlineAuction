import bcrypt from "bcryptjs";
import db from "../utils/db.js"
import dotenv from "dotenv";
import authMiddleware from "../middleware/auth.js"; // adjust path

dotenv.config();

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

export async function refuseBidder(productId, bidderId) {
    // 1️⃣ Kiểm tra quyền: chỉ seller mới được từ chối
    const product = await db('PRODUCT').where({ id: productId }).first();

    if (!product) throw new Error('Product not found');

    // 2️⃣ Cập nhật bidder bị từ chối
    await db('BID_HISTORY')
        .where({ product_id: productId, bidder_id: bidderId })
        .update({ is_refused: true });

    // 3️⃣ Kiểm tra xem bidder này có đang là giá cao nhất không
    let highestBid = await db('BID_HISTORY')
        .where({ product_id: productId, is_refused: false })
        .orderBy('bid_amount', 'desc')
        .first();

    // 4️⃣ Cập nhật sản phẩm với best_bidder mới và current_price
    const newCurrentPrice = highestBid ? highestBid.bid_amount : product.sell_price; 
    const newBestBidder = highestBid ? highestBid.bidder_id : null;

    await db('PRODUCT')
        .where({ id: productId })
        .update({
            current_price: newCurrentPrice,
            best_bidder: newBestBidder
        });

    // 5️⃣ Trả về sản phẩm đã cập nhật
    return { ...product, current_price: newCurrentPrice, best_bidder: newBestBidder };
}

export async function getBidHistory(product_id) {
    try {
        return await db('BID_HISTORY as b')
            .join('USER as u', 'b.user_id', 'u.id')
            .select('b.*', 'u.full_name as full_name')    
            .where({product_id: product_id});
            

    } catch (err) {
        console.error('Cannot get bid history', err);
        throw err;
    }
}

export async function new_bid(data) {
    try {
        await db('BID_HISTORY').insert({
            user_id: data.user_id,
            product_id: data.product_id,
            time: data.time || new Date(),
            price: data.price
        });

        await db('PRODUCT').update({
            current_price: data.price,
            bid_counts: bid_counts + 1
        }).where({id: data.product_id});

    } catch (err) {
        console.error('Cannot add new bid', err);
        throw err;
    }
}

export async function denyBidder(productId, bidderId) {
    try {
        // 2. Delete all bids by this bidder
        await db('BID_HISTORY')
            .where({ product_id: productId, user_id: bidderId })
            .del();

        await db('DENIED_BIDDERS')
            .insert({ product_id: productId, user_id: bidderId });

        // 3. Get current highest bid after deletion
        const highestBid = await db('BID_HISTORY')
                                .where({ product_id: productId })
                                .orderBy([{ column: 'price', order: 'desc' }, { column: 'time', order: 'asc' }])
                                .first();

        if (highestBid) {
        // Update current_price in PRODUCT table
            await db('PRODUCT')
                .where({ id: productId })
                .update({ current_price: highestBid.price , best_bidder: highestBid.user_id});
        } else {
            await db('PRODUCT')
                .where({ id: productId })
                .update({ current_price: starting_price , best_bidder: null});
        }

        return highestBid || null;

    } catch (err) {
        throw err;
    }
}

export async function getDeniedBidders(productId) {
    // return array of denied bidders with user info
    const rows = await db('DENIED_BIDDERS')
        .select('user_id') // select the columns you need
        .where('product_id', productId);

    return rows;
}

//rate bidder
export async function rateBidder(bidderId, productId, comment, rating) {
    try {
        const product = await db('PRODUCT').where({ id: productId }).first();
        if (!product) {
            throw new Error('Product not found');
        }

        await db('RATING').insert({
            rater_id: product.seller,
            rated_id: bidderId,
            product_id: productId,
            comment: comment,
            rating: rating,
            created_at: new Date()
        });
    } catch (err) {
        console.error('Cannot rate bidder', err);
        throw err;
    }     
}