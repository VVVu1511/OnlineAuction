import db from '../utils/db.js'


export async function getQ_A(id) {
    try{
        const ques_ans = await db('QUESTION_ANSWER').select('*')
            .where('product_id', id);

        return ques_ans;
    }
    catch(err){
        console.error('Error getting Q & A product: ', err);
        throw err;
    }
}

export async function getProductInfor(id) {
    try{
        const product = await db('PRODUCT').select('*').where({id});

        return product;
    }
    catch(err){
        console.error('Error fetching product: ', err);
        throw err;
    }
}

export async function addProduct(product) {
    try{
        return db('PRODUCT').insert(product);
    }
    catch(err){
        console.error('Error adding product: ', err);
        throw err;
    }
}

export async function getTop5Price() {
    try{
        return db('PRODUCT')
            .select('*')
            .orderBy('current_price','desc')
            .limit(5);
    }
    catch(err){
        console.error('Error getting top 5 products');
        throw err;
    }
}

export async function getTop5BidCounts() {
    try{
        return db('PRODUCT')
            .select('*')
            .orderBy('bid_counts','desc')
            .limit(5);
    }
    catch(err){
        console.error('Error getting top 5 products');
        throw err;
    }
}

export async function getTop5NearEnd() {
    try{
        return db('PRODUCT')
            .select('*')
            .orderBy('time_left','asc')
            .limit(5);
    }
    catch(err){
        console.error('Error getting top 5 products');
        throw err;
    }
}

export async function getByCategory(cat_id) {
    try {
        
        const childRows = await db('CATEGORY_PARENT')
            .select('child_id')
            .where('parent_id', cat_id);

        let categoryIds;

        if (childRows.length > 0) {
            categoryIds = childRows.map(row => row.child_id);
        } else {
            categoryIds = [cat_id];
        }

        const products = await db('PRODUCT')
            .join('PRODUCT_CATEGORY', 'PRODUCT.id', 'PRODUCT_CATEGORY.product_id')
            .select('PRODUCT.*')
            .whereIn('PRODUCT_CATEGORY.category_id', categoryIds);

        return products;

    } catch (err) {
        console.error('Cannot get products by category:', err);
        throw err;
    }
}

export async function search(keyword) {
    return await db('PRODUCT')
        .whereRaw(`fts @@ plainto_tsquery('simple', unaccent(?))`, [keyword]);
}

export async function deleteProduct(id) {
    try {
        await db('PRODUCT')
            .where({id: id})
            .delete();
            

    } catch (err) {
        console.error('Error deleting product', err);
        throw err;
    }
}

export async function getBestBidder(id) {
    try {
        return await db('BID_HISTORY')
            .where({product_id: id})
            .join('USER','USER.id', 'BID_HISTORY.user_id')
            .orderBy('price','desc')
            .first()
            .select('USER.*');
            

    } catch (err) {
        console.error('Error getting best bidder', err);
        throw err;
    }
}

export async function getSellerInfor(product_id) {
    try {
        return await db('PRODUCT')
            .where('PRODUCT.id',product_id)
            .join('USER','USER.id', 'PRODUCT.seller')
            .select('USER.*');
            

    } catch (err) {
        console.error('Error getting selling information', err);
        throw err;
    }
}

export async function get5relatedProducts(productId) {
    try {
        
        const parentCatRow = await db('PRODUCT')
            .where('PRODUCT.id', productId)
            .join('PRODUCT_CATEGORY', 'PRODUCT.id', 'PRODUCT_CATEGORY.product_id')
            .join('CATEGORY_PARENT', 'PRODUCT_CATEGORY.category_id', 'CATEGORY_PARENT.child_id')
            .select('CATEGORY_PARENT.parent_id')
            .first();

        if (!parentCatRow) return []; 

        const parentId = parentCatRow.parent_id;

        const childCategories = await db('CATEGORY_PARENT')
            .where('CATEGORY_PARENT.parent_id', parentId)
            .select('child_id');

        const childCategoryIds = childCategories.map(cat => cat.child_id);

        const relatedProducts = await db('PRODUCT')
            .join('PRODUCT_CATEGORY', 'PRODUCT.id', 'PRODUCT_CATEGORY.product_id')
            .whereIn('PRODUCT_CATEGORY.category_id', childCategoryIds)
            .whereNot('PRODUCT.id', productId)
            .select('PRODUCT.*')
            .limit(5);

        return relatedProducts;

    } catch (err) {
        console.error('Error getting 5 related products', err);
        throw err;
    }
}

export async function getReviews(userId) {
    try {
        let query = db('RATING')
            .where('rated_id', userId) // reviews about this user
            .select('rating');

        const reviews = await query;
        return reviews;
    } catch (err) {
        console.error('Error getting reviews', err);
        throw err;
    }
}

export async function getProductById(productId) {
    try {
        const product = await db('PRODUCT')
            .where('id', productId)
            .first(); // lấy một dòng duy nhất

        if (!product) return null;

        return product;
    } catch (err) {
        console.error('Error fetching product by ID', err);
        throw err;
    }
}

export async function appendDescription(productId, newDescription) {
    // Lấy sản phẩm, kiểm tra quyền
    const product = await db('PRODUCT').where({ id: productId }).first();
    if (!product) throw new Error('Product not found');

    // Append mô tả mới vào mô tả cũ
    const updatedDescription = product.description
        ? product.description + "\n" + newDescription
        : newDescription;

    // Cập nhật vào DB
    await db('PRODUCT')
        .where({ id: productId })
        .update({ description: updatedDescription });

    // Trả về sản phẩm đã cập nhật
    return { ...product, description: updatedDescription };
}

// 1️⃣ Lấy sản phẩm đang đăng & còn hạn
export async function getActiveProducts(userId) {
    return await db('PRODUCT')
        .where({ seller: userId })
        .whereNull('winner')        // chưa có người thắng
        .andWhere('time_left', '>', 0) // còn thời gian (giả sử time_left là số giây còn lại)
        .orderBy('upload_date', 'desc')
        .select('*');
}

// 2️⃣ Lấy sản phẩm đã có người thắng
export async function getWonProducts(userId) {
    return await db('PRODUCT')
        .where({ seller: userId })
        .whereNotNull('winner')   // đã có người thắng
        .orderBy('upload_date', 'desc')
        .select('*');
}