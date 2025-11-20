import db from '../utils/db.js'

export async function getProductInfor(id) {
    try{
        const product = await db('USER').select('*').where({id});
        const ques_ans = await db('QUESTION_ANSWER').select('*').where({id});

        return {...product, ...ques_ans};
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