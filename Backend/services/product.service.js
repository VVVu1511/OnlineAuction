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

export async function getWatchList(user_id) {
    try {
        const list = await db('WATCHLIST')
            .join('PRODUCT', 'WATCHLIST.product_id', 'PRODUCT.id')
            .select('PRODUCT.*')
            .where('WATCHLIST.user_id', user_id);

        return list;

    } catch (err) {
        console.error('Cannot get watch list', err);
        throw err;
    }
}

export async function addWatchList(user_id, product_id) {
    try {
        await db('WATCHLIST')
            .insert({user_id: user_id, product_id: product_id});

    } catch (err) {
        console.error('Cannot add watch list', err);
        throw err;
    }
}


export async function delWatchList(user_id, product_id) {
    try {
        await db('WATCHLIST')
            .where({user_id: user_id, product_id: product_id})
            .delete();

    } catch (err) {
        console.error('Cannot delete 1 row watch list', err);
        throw err;
    }
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
        await db('BID_HISTORY')
            .insert({user_id: data.user_id,product_id: data.product_id,time: data.time, price: data.price});
            

    } catch (err) {
        console.error('Cannot add new bid', err);
        throw err;
    }
}

