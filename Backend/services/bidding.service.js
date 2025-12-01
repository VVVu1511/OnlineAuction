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
            .whereNot('PRODUCT.id', 2)   // not equal 2
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
        return await db('BID_HISTORY')
            .select('*')    
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
    } catch (err) {
        console.error('Cannot add new bid', err);
        throw err;
    }
}