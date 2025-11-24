import db from '../utils/db.js'

export async function addNewCategory(description) {
    try {
        await db('CATEGORY')
            .insert({description: description});    
            
    } catch (err) {
        console.error('Cannot add new category', err);
        throw err;
    }
}

export async function updateCategory(data) {
    try {
        await db('CATEGORY')
            .where({id: data.id})
            .update({description: data.description});
            
    } catch (err) {
        console.error('Cannot update category', err);
        throw err;
    }
}

export async function deleteCategory(id) {
    try {
        await db('CATEGORY')
            .where({id: id})
            .delete();
            
    } catch (err) {
        console.error('Cannot delete category', err);
        throw err;
    }
}

export async function getAll() {
    try {
        return await db('CATEGORY')
            .select('*');
            
    } catch (err) {
        console.error('Cannot get all categories', err);
        throw err;
    }
}