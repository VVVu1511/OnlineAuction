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
    return await db('PRODUCT as P')
        .leftJoin('USER as U', 'P.best_bidder', 'U.id')
        .select(
            'P.*',
            'U.full_name as best_bidder_name'
        );
}

export async function getTop5Price() {
    return await db('PRODUCT as P')
        .join('USER as U', 'P.best_bidder', 'U.id')
        .select(
            'P.*',
            'U.full_name as best_bidder_name'
        )
        .where('end_date', '>', new Date())
        .orderBy('P.current_price', 'desc')
        .limit(5);
}

export async function getTop5BidCounts() {
    return await db('PRODUCT as P')
        .join('USER as U', 'P.best_bidder', 'U.id')
        .select(
            'P.*',
            'U.full_name as best_bidder_name'
        )
        .where('end_date', '>', new Date())
        .orderBy('P.bid_counts', 'desc')
        .limit(5);
}

export async function getTop5NearEnd() {
    return await db('PRODUCT as P')
        .join('USER as U', 'P.best_bidder', 'U.id')
        .select(
            'P.*',
            'U.full_name as best_bidder_name'
        )
        .where('end_date', '>', new Date())
        .orderBy('P.end_date', 'asc')
        .limit(5);
}

export async function getEndedAuctionsNotHandled() {
    return db('PRODUCT')
        .where('end_date', '<=', new Date())
        .andWhere({ state_id: 1 })
        .select('*');
}

/**
 * =========================
 * CATEGORY
 * =========================
 */
export async function getByCategory(cat_id, page, pageSize, sort) {
    const offset = (page - 1) * pageSize;

    const childRows = await db('CATEGORY_PARENT')
        .where({ parent_id: cat_id })
        .select('child_id');

    const categoryIds = childRows.length
        ? childRows.map(r => r.child_id)
        : [cat_id];

    // ===== SORT =====
    let orderBy = { column: 'P.end_date', direction: 'desc' };
    if (sort === "priceAsc") {
        orderBy = { column: 'P.current_price', direction: 'asc' };
    }

    // ===== TOTAL COUNT =====
    const [{ total }] = await db('PRODUCT as P')
        .join('PRODUCT_CATEGORY as PC', 'P.id', 'PC.product_id')
        .whereIn('PC.category_id', categoryIds)
        .count('P.id as total');

    // ===== DATA =====
    const data = await db('PRODUCT as P')
        .join('PRODUCT_CATEGORY as PC', 'P.id', 'PC.product_id')
        .leftJoin('USER as U', 'P.best_bidder', 'U.id')
        .whereIn('PC.category_id', categoryIds)
        .orderBy(orderBy.column, orderBy.direction)
        .limit(pageSize)
        .offset(offset)
        .select(
            'P.*',
            'U.full_name as best_bidder_name'
        );

    return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
    };
}

/**
 * =========================
 * SEARCH
 * =========================
 */
export async function search(keyword, page = 1, pageSize = 10, sort = 'time_desc') {
    const offset = (page - 1) * pageSize;

    // ===== BASE QUERY (NO ORDER) =====
    const baseQuery = db('PRODUCT')
        .whereRaw(
            `fts @@ plainto_tsquery('simple', unaccent(?))`,
            [keyword]
        );

    // ===== COUNT (KHÔNG ORDER BY) =====
    const [{ count }] = await baseQuery.clone().count('* as count');

    // ===== DATA QUERY (CÓ ORDER BY) =====
    let dataQuery = baseQuery.clone();

    switch (sort) {
        case 'price_asc':
            dataQuery = dataQuery.orderBy('current_price', 'asc');
            break;
        case 'time_asc':
            dataQuery = dataQuery.orderBy('end_date', 'asc');
            break;
        case 'time_desc':
        default:
            dataQuery = dataQuery.orderBy('end_date', 'desc');
            break;
    }

    const items = await dataQuery
        .limit(pageSize)
        .offset(offset);

    return {
        items,
        pagination: {
            page,
            pageSize,
            total: Number(count),
            totalPages: Math.ceil(count / pageSize)
        }
    };
}

/**
 * =========================
 * SELLER / BIDDER
 * =========================
 */
export async function getBestBidder(productId) {
    const product = await db('PRODUCT')
        .where({ id: productId })
        .select('best_bidder')
        .first();

    if (!product || !product.best_bidder) return null;

    return await db('USER')
        .where({ id: product.best_bidder })
        .first();
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
    return await db('PRODUCT as P')
        .leftJoin('USER as U', 'P.best_bidder', 'U.id')
        .where('P.seller', userId)
        .whereNull('P.winner')
        .where('end_date', '>', new Date())
        .select(
            'P.*',
            'U.full_name as best_bidder_name'
        )
        .orderBy('P.upload_date', 'desc');
}

export async function getWonProducts(userId) {
    return await db('PRODUCT as P')
        .leftJoin('USER as U', 'P.best_bidder', 'U.id')

        .leftJoin('RATING as R', function () {
            this.on('R.product_id', '=', 'P.id')
                .andOn('R.rater_id', '=', db.raw('?', [userId]))
                .andOn('R.rated_id', '=', 'P.best_bidder');
        })

        .where('P.seller', userId)
        .where('end_date', '<=', new Date())

        .select(
            'P.*',
            'P.id as id',
            'U.full_name as best_bidder_name',

            db.raw(
                '(?? IS NOT NULL) AS winner_rating',
                [db.ref('R.id')]
            ),
            'R.rating as rating',
            'R.comment as comment'
        )
        .orderBy('P.end_date', 'desc');
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

    return {
        productId,
        state: "ended"
    };
}

export async function advancedSearch(params) {
    const {
        keyword,
        minPrice,
        maxPrice,
        category,
        fromDate,
        toDate,
        page = 1,
        limit = 10
    } = params;

    const currentPage = Number(page);
    const pageSize = Number(limit);
    const offset = (currentPage - 1) * pageSize;

    /* ===== BASE QUERY ===== */
    const baseQuery = db('PRODUCT')
        .where('PRODUCT.state_id', 1);

    if (keyword) {
        baseQuery.andWhere('PRODUCT.name', 'ilike', `%${keyword}%`);
    }

    if (minPrice) {
        baseQuery.andWhere('PRODUCT.current_price', '>=', Number(minPrice));
    }

    if (maxPrice) {
        baseQuery.andWhere('PRODUCT.current_price', '<=', Number(maxPrice));
    }

    if (category) {
        baseQuery.whereExists(function () {
            this.select(1)
                .from('PRODUCT_CATEGORY')
                .whereRaw('"PRODUCT_CATEGORY"."product_id" = "PRODUCT"."id"')
                .whereIn(
                    'PRODUCT_CATEGORY.category_id',
                    db('CATEGORY_PARENT')
                        .select('child_id')
                        .where('parent_id', Number(category))
                        .union(function () {
                            this.select(db.raw('?', [Number(category)]));
                        })
                );
        });
    }

    if (fromDate) {
        baseQuery.andWhere('PRODUCT.upload_date', '>=', fromDate);
    }

    if (toDate) {
        baseQuery.andWhere('PRODUCT.upload_date', '<=', toDate);
    }

    /* ===== COUNT ===== */
    const totalResult = await baseQuery.clone()
        .count('* as total')
        .first();

    const total = Number(totalResult.total);

    /* ===== DATA ===== */
    const data = await baseQuery
        .clone()
        .orderBy('PRODUCT.upload_date', 'desc')
        .limit(pageSize)
        .offset(offset)
        .select('PRODUCT.*');

    return {
        data,
        pagination: {
            page: currentPage,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    };
}

// services/product.service.js
export async function updateProductInfo({
    productId,
    sellerId,
    name,
    sell_price,
    end_date
}) {
    const product = await db("PRODUCT")
        .where({ id: productId, seller: sellerId })
        .first();

    if (!product) {
        throw new Error("Không tìm thấy sản phẩm hoặc không có quyền");
    }
    
    const updateData = {};

    if (name) updateData.name = name;
    if (sell_price !== undefined) updateData.sell_price = sell_price;
    if (end_date) updateData.end_date = end_date;

    await db("PRODUCT")
        .where({ id: productId })
        .update(updateData);

    return updateData;
}
