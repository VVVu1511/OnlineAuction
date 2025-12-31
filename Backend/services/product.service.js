import db from '../utils/db.js';
import * as contactService from '../services/contact.service.js';

/**
 * =========================
 * Q & A
 * =========================
 */
export async function getQ_A(productId) {
    try {
        return await db('QUESTION_ANSWER')
            .where({ product_id: productId })
            .select('*');
    } catch (err) {
        console.error('Error getting Q & A product:', err);
        throw err;
    }
}

/**
 * =========================
 * PRODUCT BASIC
 * =========================
 */
export async function getProductInfor(id) {
    try {
        return await db('PRODUCT')
            .where({ id })
            .first() || null;
    } catch (err) {
        console.error('Error fetching product:', err);
        throw err;
    }
}

export async function addProduct(product) {
    const [{ id }] = await db('PRODUCT')
        .insert(product)
        .returning('id');

    return { id }; // id là NUMBER
}

export async function updateImagePath(productId, imagePathsJson) {
    const updated = await db('PRODUCT')
        .where({ id: productId })
        .update({ image_path: imagePathsJson });

    return { productId, updated };
}

export async function deleteProduct(id) {
    const deleted = await db('PRODUCT')
        .where({ id })
        .delete();

    return { id, deleted };
}

/**
 * =========================
 * PRODUCT LIST
 * =========================
 */
export async function getAllProducts() {
    return await db('PRODUCT').select('*');
}

export async function getTop5Price() {
    return await db('PRODUCT')
        .orderBy('current_price', 'desc')
        .limit(5);
}

export async function getTop5BidCounts() {
    return await db('PRODUCT')
        .orderBy('bid_counts', 'desc')
        .limit(5);
}

export async function getTop5NearEnd() {
    return await db('PRODUCT')
        .orderBy('end_date', 'asc')
        .limit(5);
}

/**
 * =========================
 * CATEGORY
 * =========================
 */
export async function getByCategory(cat_id) {
    const childRows = await db('CATEGORY_PARENT')
        .where({ parent_id: cat_id })
        .select('child_id');

    const categoryIds = childRows.length
        ? childRows.map(r => r.child_id)
        : [cat_id];

    return await db('PRODUCT')
        .join('PRODUCT_CATEGORY', 'PRODUCT.id', 'PRODUCT_CATEGORY.product_id')
        .whereIn('PRODUCT_CATEGORY.category_id', categoryIds)
        .select('PRODUCT.*');
}

/**
 * =========================
 * SEARCH
 * =========================
 */
export async function search(keyword) {
    return await db('PRODUCT')
        .whereRaw(
            `fts @@ plainto_tsquery('simple', unaccent(?))`,
            [keyword]
        );
}

/**
 * =========================
 * SELLER / BIDDER
 * =========================
 */
export async function getBestBidder(productId) {
    return await db('BID_HISTORY')
        .where({ product_id: productId })
        .join('USER', 'USER.id', 'BID_HISTORY.user_id')
        .orderBy('price', 'desc')
        .select('USER.*')
        .first() || null;
}

export async function getSellerInfor(productId) {
    return await db('PRODUCT')
        .where('PRODUCT.id', productId)
        .join('USER', 'USER.id', 'PRODUCT.seller')
        .select('USER.*')
        .first() || null;
}

/**
 * =========================
 * RELATED PRODUCTS
 * =========================
 */
export async function get5relatedProducts(productId) {
    const parentCat = await db('PRODUCT')
        .where('PRODUCT.id', productId)
        .join('PRODUCT_CATEGORY', 'PRODUCT.id', 'PRODUCT_CATEGORY.product_id')
        .join('CATEGORY_PARENT', 'PRODUCT_CATEGORY.category_id', 'CATEGORY_PARENT.child_id')
        .select('CATEGORY_PARENT.parent_id')
        .first();

    if (!parentCat) return [];

    const childIds = await db('CATEGORY_PARENT')
        .where({ parent_id: parentCat.parent_id })
        .pluck('child_id');

    return await db('PRODUCT')
        .join('PRODUCT_CATEGORY', 'PRODUCT.id', 'PRODUCT_CATEGORY.product_id')
        .whereIn('PRODUCT_CATEGORY.category_id', childIds)
        .whereNot('PRODUCT.id', productId)
        .select('PRODUCT.*')
        .limit(5);
}

/**
 * =========================
 * REVIEW
 * =========================
 */
export async function getReviews(userId) {
    return await db('RATING')
        .where({ rated_id: userId })
        .select('rating', 'comment', 'created_at');
}

/**
 * =========================
 * DESCRIPTION
 * =========================
 */
export async function appendDescription(productId, newDescription) {
    const product = await getProductInfor(productId);
    if (!product) throw new Error('Product not found');

    const description = product.description
        ? product.description + '\n' + newDescription
        : newDescription;

    await db('PRODUCT')
        .where({ id: productId })
        .update({ description });

    return { ...product, description };
}

/**
 * =========================
 * SELLER DASHBOARD
 * =========================
 */
export async function getActiveProducts(userId) {
    return await db('PRODUCT')
        .where({ seller: userId })
        .whereNull('winner')
        .andWhere('end_date', '>', Date.now())
        .orderBy('upload_date', 'desc');
}

export async function getWonProducts(userId) {
    return await db('PRODUCT')
        .join('USER as Winner', 'PRODUCT.winner', 'Winner.id')
        .leftJoin('RATING as R', 'PRODUCT.id', 'R.product_id')
        .where({ seller: userId })
        .whereNotNull('winner')
        .select(
            'PRODUCT.*',
            'Winner.full_name as winner_name',
            'Winner.email as winner_email',
            'R.rating',
            'R.comment',
            'R.created_at'
        );
}

/**
 * =========================
 * END BID
 * =========================
 */
export async function productEndBid(productId) {
    await db('PRODUCT')
        .where({ id: productId })
        .update({ state_id: 2 });

    const product = await getProductInfor(productId);

    await contactService.emailEndBid(
        product.best_bidder,
        product.seller,
        product.id
    );

    return {
        productId,
        state: "ended"
    };
}